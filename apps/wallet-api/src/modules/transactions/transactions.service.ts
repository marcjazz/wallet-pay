import {
  PostQuoteBankModelProductTypeEnum,
  PostQuoteBankModelSideEnum,
  PostTradeBankModelTradeTypeEnum,
  PostTransferBankModelPaymentRailEnum,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModelTypeEnum,
  TradeBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  $Enums,
  CybridTransaction,
  CybridTransactionStatus,
} from '@prisma/client';
import { constants } from '../../constants';
import { CybridService, Participants } from '../../cybrid/cybrid.service';
import { generateTransactionId } from '../../helpers/otp-generator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CustomerAccountInfo,
  resolveAccountInfo,
} from '../webhooks/helpers/account-resolver';
import {
  CybridTransactionEntity,
  InitiateFundingTransferDto,
  InitiateRemittanceDto,
  QueryTransactionDto,
  ReceiverPayoutInfoDto,
} from './transaction.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService,
    private readonly configService: ConfigService
  ) {}

  async initiateFunding(payload: InitiateFundingTransferDto, personId: string) {
    let transferType = PostTransferBankModelTransferTypeEnum.Funding;

    const sourceAccountGuids = await resolveAccountInfo(this.prismaService, {
      accountId: payload.cybrid_source_account_id,
      purpose: transferType,
      personId,
    });

    if (!sourceAccountGuids) {
      throw new NotFoundException('Source bank account not found!');
    }

    const { currency, customerGuid, fiatAccountGuid, externalAccountGuid } =
      sourceAccountGuids;

    const bankFiatAccountGuid = this.configService.get(
      'CYBRID_BANK_FIAT_ACCOUNT_GUID'
    );

    try {
      const { platform_balance } = await this.cybridService.getBankAccount(
        bankFiatAccountGuid
      );

      // Switch to instant transaction when platform fiat account funds are available
      if ((platform_balance ?? 0) > payload.amount) {
        transferType = PostTransferBankModelTransferTypeEnum.InstantFunding;
      }
    } catch (error) {
      this.logger.error('Could not retrieve platform fiat account!');
    }

    // Retrieving supported currency rate
    const usedCurrency =
      await this.prismaService.supportedCurrency.findFirstOrThrow({
        select: { currency: true, xaf_rate: true },
        where: { currency: currency.toLocaleUpperCase() },
      });

    const bankGuid = this.configService.get('CYBRID_BANK_GUID');
    const fundingTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        asset: currency,
        bank_guid: bankGuid,
        customer_guid: customerGuid,
        receive_amount: payload.amount,
        side: PostQuoteBankModelSideEnum.Deposit,
        product_type: PostQuoteBankModelProductTypeEnum.Funding,
      }
    );

    const fundingTransfer = await this.cybridService.initiateTransfer(
      customerGuid,
      {
        transfer_type: transferType,
        payment_rail:
          transferType === PostTransferBankModelTransferTypeEnum.Funding
            ? PostTransferBankModelPaymentRailEnum.Ach
            : undefined,
        quote_guid: fundingTransferQuote.guid as string,
        external_bank_account_guid: externalAccountGuid,
        source_participants: [
          {
            guid: customerGuid,
            amount: payload.amount,
            type: PostTransferParticipantBankModelTypeEnum.Customer,
          },
        ],
        destination_participants: [
          {
            guid: customerGuid,
            amount: payload.amount,
            type: PostTransferParticipantBankModelTypeEnum.Customer,
          },
        ],
      }
    );

    const cybridTransaction = await this.prismaService.cybridTransaction.create(
      {
        data: {
          fees: 0,
          currency,
          initial_currency: currency,
          conversion_rate: usedCurrency.xaf_rate,
          amount: (fundingTransfer.amount as number) / 100,
          initial_currency_amount: payload.amount / 100,
          transaction_id: generateTransactionId(),
          cybrid_transaction_guid: fundingTransfer.guid as string,
          transaction_type:
            transferType.toLocaleUpperCase() as $Enums.CybridTransactionType,
          status:
            fundingTransfer.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
          InitiatedBy: {
            connect: { cybrid_customer_guid: customerGuid },
          },
          CybridAccount: {
            connect: { cybrid_account_guid: fiatAccountGuid },
          },
          CybridExternalAccount: {
            connect: {
              cybrid_external_account_id: payload.cybrid_source_account_id,
            },
          },
        },
      }
    );

    return new CybridTransactionEntity({
      ...cybridTransaction,
      recipient_fullname: null,
    });
  }

  async initiateRemittance(
    { receiver, ...payload }: InitiateRemittanceDto,
    personId: string
  ) {
    const transferType = PostTransferBankModelTransferTypeEnum.Book;

    const sourceAccountInfo = await resolveAccountInfo(this.prismaService, {
      personId,
      purpose: transferType,
      accountId: payload.cybrid_source_account_id,
    });

    if (!sourceAccountInfo) {
      throw new NotFoundException('Source bank account not found!');
    }

    if (sourceAccountInfo.balance < payload.amount) {
      throw new UnprocessableEntityException('Infussicient account balance');
    }

    const cybridCounterparty = await this.getCounterpartyFromReceiver(receiver);

    // trade USD for USDC_SOL
    const [, cybridTransaction] = await this.trateFiatForCrypto(
      sourceAccountInfo,
      cybridCounterparty.cybrid_counterparty_guid,
      payload.amount
    );

    return new CybridTransactionEntity({
      ...cybridTransaction,
      recipient_fullname: cybridCounterparty.fullname,
    });
  }

  async getTransaction(cybridTransactionId: string) {
    return this.prismaService.cybridTransaction.findUnique({
      where: { cybrid_transaction_id: cybridTransactionId },
    });
  }

  async getTransactions(
    { order_by, order_direction, search, status }: QueryTransactionDto,
    personId: string
  ) {
    const personFullnameSelect = {
      select: { Person: { select: { first_name: true, last_name: true } } },
    };
    const transactions = await this.prismaService.cybridTransaction.findMany({
      orderBy:
        order_by === 'amount'
          ? { amount: order_direction }
          : { initiated_at: order_direction },
      include: {
        LocalCustomer: personFullnameSelect,
        ReceiverPayoutInfo: {
          select: { fullname: true },
          where: search ? { fullname: { search } } : undefined,
        },
      },
      where: {
        InitiatedBy: { person_id: personId },
        transaction_type: {
          not: 'CONVERT',
        },
        ...(status ? { status } : {}),
      },
    });

    return transactions.map(
      ({ LocalCustomer, ReceiverPayoutInfo, ...transantion }) => {
        const person = LocalCustomer?.Person;
        return new CybridTransactionEntity({
          ...transantion,
          recipient_fullname:
            ReceiverPayoutInfo?.fullname ??
            (person ? `${person.first_name} ${person.last_name}` : null),
        });
      }
    );
  }

  private async trateFiatForCrypto(
    {
      currency,
      customerGuid,
      fiatAccountGuid,
      cryptoAccountGuid,
    }: CustomerAccountInfo,
    counterpartyGuid: string,
    fiatAmount: number
  ): Promise<[TradeBankModel, CybridTransaction]> {
    const tradeQuote = await this.cybridService.createQuote(customerGuid, {
      bank_guid: this.configService.get('CYBRID_BANK_GUID'),
      product_type: PostQuoteBankModelProductTypeEnum.Trading,
      deliver_amount: fiatAmount,
      customer_guid: customerGuid,
      symbol: constants.SUPPORTED_TRADE_SYMBOL,
      side: PostQuoteBankModelSideEnum.Buy,
    });

    const tradeTransaction = await this.cybridService.initiateTrade(
      customerGuid,
      {
        quote_guid: tradeQuote.guid as string,
        trade_type: PostTradeBankModelTradeTypeEnum.Platform,
      }
    );

    // Retrieving supported currency rate
    const usedCurrency =
      await this.prismaService.supportedCurrency.findFirstOrThrow({
        select: { currency: true, xaf_rate: true },
        where: { currency: currency.toLocaleUpperCase() },
      });

    const cybridTransaction = await this.prismaService.cybridTransaction.create(
      {
        data: {
          currency: 'USDC_SOL',
          fees: tradeTransaction.fee ?? 0,
          initial_currency: currency,
          conversion_rate: usedCurrency.xaf_rate,
          // convert cents to dollars
          initial_currency_amount: fiatAmount / 100,
          transaction_id: generateTransactionId(),
          remittance_payout_ref: randomUUID(),
          // convert lamports to USDC_SOL
          amount: (tradeTransaction.receive_amount as number) / 1e6,
          cybrid_transaction_guid: tradeTransaction.guid as string,
          status:
            tradeTransaction.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
          transaction_type: 'REMITTANCE',
          InitiatedBy: {
            connect: { cybrid_customer_guid: customerGuid },
          },
          CybridAccount: {
            connect: { cybrid_account_guid: fiatAccountGuid },
          },
          CryptoCybridAccount: {
            connect: { cybrid_account_guid: cryptoAccountGuid },
          },
          ReceiverPayoutInfo: {
            connect: {
              cybrid_counterparty_guid: counterpartyGuid,
            },
          },
        },
      }
    );
    return [tradeTransaction, cybridTransaction];
  }

  private async getCounterpartyFromReceiver(receiver: ReceiverPayoutInfoDto) {
    let cybridCounterparty =
      await this.prismaService.cybridCounterparty.findUnique({
        where: { cybrid_counterparty_id: receiver.receiver_id },
      });

    if (!cybridCounterparty) {
      throw new NotFoundException(`Receiver not found!`);
    }

    if (cybridCounterparty.verification_status !== 'PASSED') {
      throw new UnauthorizedException(`Potential faulty receiver detected!`);
    }

    if (receiver.national_id_number || receiver.phone_number) {
      cybridCounterparty = await this.prismaService.cybridCounterparty.update({
        data: {
          phone_number: receiver.phone_number ?? undefined,
          national_id_number: receiver.national_id_number ?? undefined,
        },
        where: { cybrid_counterparty_id: receiver.receiver_id },
      });
    }

    return cybridCounterparty;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async settleRemittanceTransations() {
    this.logger.verbose(`Settling remittance transactions...`);

    const transactions = await this.prismaService.cybridTransaction.findMany({
      select: {
        amount: true,
        cybrid_transaction_id: true,
        ReceiverPayoutInfo: { select: { cybrid_counterparty_guid: true } },
      },
      where: {
        status: 'COMPLETED',
        transaction_type: 'REMITTANCE',
        withdrawal_transaction_id: null,
        receiver_payout_info_id: { not: null },
      },
    });

    if (!transactions.length) {
      this.logger.verbose(`No remittance transaction to process!`);
      return;
    }

    const bankGuid = this.configService.get<string>(
      'CYBRID_BANK_GUID'
    ) as string;

    const totalAmount =
      1e6 * transactions.reduce((total, tx) => total + tx.amount, 0);

    const remittanceParticipants = transactions.reduce<Participants>(
      (participants, { amount, ReceiverPayoutInfo }) => ({
        source_participants: [
          {
            guid: bankGuid,
            amount: totalAmount,
            type: PostTransferParticipantBankModelTypeEnum.Bank,
          },
        ],
        destination_participants: [
          ...participants.destination_participants,
          {
            amount: amount * 1e6, // usdc_sol to lamports
            guid: ReceiverPayoutInfo?.cybrid_counterparty_guid as string,
            type: PostTransferParticipantBankModelTypeEnum.Counterparty,
          },
        ],
      }),
      {
        source_participants: [],
        destination_participants: [],
      }
    );

    const externalWalletGuid = this.configService.get(
      'CYBRID_BANK_EXTERNAL_WALLET_GUID'
    ) as string;

    const transfer = await this.cybridService.settleXafPayUSDCFunds(
      bankGuid,
      externalWalletGuid,
      totalAmount,
      remittanceParticipants
    );

    const transaction = await this.prismaService.cybridTransaction.create({
      data: {
        amount: totalAmount / 1e6,
        cybrid_transaction_guid: transfer.guid as string,
        fees: (transfer.fee ?? 0) / 1e6,
        initial_currency: 'USDC_SOL',
        initial_currency_amount: totalAmount / 1e6,
        status:
          transfer.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
        transaction_id: transfer.quote_guid as string,
        transaction_type: 'WITHDRAWAL',
      },
    });

    await this.prismaService.cybridTransaction.updateMany({
      data: { withdrawal_transaction_id: transaction.cybrid_transaction_id },
      where: {
        cybrid_transaction_id: {
          in: transactions.map((tx) => tx.cybrid_transaction_id),
        },
      },
    });

    this.logger.verbose(
      `Sucessfully initiated ${transactions.length} remittance transactions settlement (Transfer Guid: ${transfer.guid})`
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pullUnterminatedTransaction() {
    const transactions = await this.prismaService.cybridTransaction.findMany({
      select: {
        CybridAccount: { select: { cybrid_customer_id: true } },
        cybrid_transaction_guid: true,
        transaction_type: true,
      },
      where: { status: { notIn: ['COMPLETED', 'FAILED', 'REVERTED'] } },
    });

    const [tradeIds, transferIds] = transactions.reduce<[string[], string[]]>(
      ([trades, transfers], tx) => {
        const { cybrid_transaction_guid: guid, transaction_type: type } = tx;
        return type === 'CONVERT' || type === 'REMITTANCE'
          ? [[...trades, guid], transfers]
          : [trades, [...transfers, guid]];
      },
      [[], []]
    );

    if (!tradeIds.length && !transferIds.length) return;

    const [trades, transfers] = await Promise.all([
      this.cybridService.getTrades({ guid: tradeIds.join(',') }),
      this.cybridService.getTransfers({ guid: transferIds.join(',') }),
    ]);

    const statusIdMap = new Map<CybridTransactionStatus, Set<string>>();

    [...trades.objects, ...transfers.objects].forEach((object) => {
      const status = (
        object.state === 'cancelled' ? 'failed' : object.state
      )?.toLocaleUpperCase() as CybridTransactionStatus;
      if (!status || !object.guid) return;

      const ids = statusIdMap.get(status) ?? new Set();
      ids.add(object.guid);
      statusIdMap.set(status, ids);
    });

    await this.prismaService.$transaction(
      Array.from(statusIdMap.entries()).map(([status, ids]) =>
        this.prismaService.cybridTransaction.updateMany({
          where: { cybrid_transaction_guid: { in: Array.from(ids) } },
          data: { status },
        })
      )
    );
  }
}
