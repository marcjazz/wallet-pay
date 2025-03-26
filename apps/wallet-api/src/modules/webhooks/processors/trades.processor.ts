import {
  PostQuoteBankModelProductTypeEnum,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModelTypeEnum,
  TradeBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import { Process, Processor } from '@nestjs/bull';
import {
  Logger,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, PrismaPromise } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';
import {
  CustomerAccountInfo,
  resolveAccountInfo,
} from '../helpers/account-resolver';
import { parseEventObject } from '../helpers/event-parser';

@Processor(constants.WEBHOOK_QUEUE)
export class TradesProcessor {
  private readonly logger = new Logger(TradesProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {}

  @Process(constants.CYBRID_TRADE_EVENTS)
  async handle(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}) from cybrid...`
    );

    const parsedObject = await parseEventObject(job.data, {
      logger: this.logger,
      prisma: this.prismaService,
    });
    if (!parsedObject) {
      return;
    }

    const { customerGuid, transactionGuid, transactionStatus, transaction } =
      parsedObject;

    const trade = await this.cybridService.getTrade(
      customerGuid,
      transactionGuid
    );
    if (
      trade.trade_type !== 'platform' ||
      trade.symbol !== constants.SUPPORTED_TRADE_SYMBOL
    ) {
      throw new NotImplementedException(
        `${trade.trade_type} not  supported for symbol ${trade.symbol} yet!`
      );
    }

    if (trade.state === 'completed') {
      const sourceAccountInfo = await resolveAccountInfo(this.prismaService, {
        purpose: 'book',
        accountId: transaction.cybrid_account_id as string,
      });

      if (!sourceAccountInfo) {
        throw new NotFoundException('Source bank account not found!');
      }

      await this.executeBookTransfer(trade, sourceAccountInfo);
    }

    const { CryptoCybridAccount: cryptoAccount, CybridAccount: fiatAccount } =
      await this.prismaService.cybridTransaction.findUniqueOrThrow({
        select: {
          CryptoCybridAccount: { select: { cybrid_account_guid: true } },
          CybridAccount: { select: { cybrid_account_guid: true } },
        },
        where: { cybrid_transaction_guid: transactionGuid },
      });

    const accountUpdateOperations: PrismaPromise<unknown>[] = [];

    if (cryptoAccount) {
      const customerAccount = await this.cybridService.getAccount(
        customerGuid,
        cryptoAccount.cybrid_account_guid
      );
      accountUpdateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            balance:
              // Convert lamports to SOL
              (customerAccount.platform_available as number) / 1e6,
          },
          where: { cybrid_account_guid: cryptoAccount.cybrid_account_guid },
        })
      );
    }

    if (fiatAccount) {
      const customerAccount = await this.cybridService.getAccount(
        customerGuid,
        fiatAccount.cybrid_account_guid
      );
      accountUpdateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            balance:
              // Convert cents to USD
              (customerAccount.platform_available as number) / 100,
          },
          where: { cybrid_account_guid: fiatAccount.cybrid_account_guid },
        })
      );
    }

    await this.prismaService.$transaction([
      ...accountUpdateOperations,
      this.prismaService.cybridTransaction.update({
        data:
          transactionStatus === 'COMPLETED'
            ? { status: transactionStatus, settled_at: new Date() }
            : { status: transactionStatus },
        where: { cybrid_transaction_guid: transactionGuid },
      }),
    ]);

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid.`
    );
  }

  private async executeBookTransfer(
    trade: TradeBankModel,
    { currency, customerGuid, cryptoAccountGuid }: CustomerAccountInfo
  ) {
    const transferType = PostTransferBankModelTransferTypeEnum.Book;

    const bankGuid = this.configService.get<string>(
      'CYBRID_BANK_GUID'
    ) as string;
    const bookTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        asset: 'USDC_SOL',
        deliver_amount: trade.receive_amount,
        product_type: PostQuoteBankModelProductTypeEnum.BookTransfer,
      }
    );

    const bookTransfer = await this.cybridService.initiateTransfer(
      customerGuid,
      {
        transfer_type: transferType,
        source_account_guid: cryptoAccountGuid,
        quote_guid: bookTransferQuote.guid as string,
        destination_account_guid: this.configService.get(
          'CYBRID_BANK_TRADING_ACCOUNT_GUID'
        ),
        source_participants: [
          {
            guid: customerGuid,
            amount: trade.receive_amount as number,
            type: PostTransferParticipantBankModelTypeEnum.Customer,
          },
        ],
        destination_participants: [
          {
            guid: bankGuid,
            amount: trade.receive_amount as number,
            type: PostTransferParticipantBankModelTypeEnum.Bank,
          },
        ],
      }
    );

    // Retrieving supported currency rate
    const usedCurrency =
      await this.prismaService.supportedCurrency.findFirstOrThrow({
        select: { currency: true, xaf_rate: true },
        where: { currency: currency.toLocaleUpperCase() },
      });

    const cybridTransaction = await this.prismaService.cybridTransaction.update(
      {
        data: {
          currency: 'USDC_SOL',
          fees: bookTransfer.fee ?? 0,
          conversion_rate: usedCurrency.xaf_rate,
          initial_currency: currency,
          // convert cents to dollars
          initial_currency_amount: Number(trade.deliver_amount) / 100,
          amount: Number(bookTransfer.amount) / 1e6,
          transaction_id: trade.guid as string,
          cybrid_transaction_guid: bookTransfer.guid as string,
          status:
            bookTransfer.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
        },
        where: {
          cybrid_transaction_guid: `${constants.UNSCHEDULED_TRASACTION}-${trade.guid}`,
        },
      }
    );

    return cybridTransaction;
  }
}
