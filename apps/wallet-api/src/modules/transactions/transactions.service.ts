import {
  PostQuoteBankModelProductTypeEnum,
  PostTradeBankModelTradeTypeEnum,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModelTypeEnum,
  TradeBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  $Enums,
  CybridSupportedCurrency,
  CybridTransaction,
} from '@prisma/client';
import { CybridService, Participants } from '../../cybrid/cybrid.service';
import { generateTransactionId } from '../../helpers/otp-generator';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CybridTransactionEntity,
  InitiateFundingTransferDto,
  InitiateRemittanceDto,
  QueryTransactionDto,
  ReceiverPayoutInfoDto,
} from './transaction.dto';

type CustomerAccountGuids = {
  customerGuid: string;
  fiatAccountGuid: string;
  cryptoAccountGuid?: string;
  currency: CybridSupportedCurrency;
  externalAccountGuid?: string;
};

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService,
    private readonly configService: ConfigService
  ) {}

  async initiateInstantFunding(
    payload: InitiateFundingTransferDto,
    personId: string
  ) {
    const transferType = PostTransferBankModelTransferTypeEnum.InstantFunding;

    const sourceAccountGuids = await this.getSourceAccountGuids(
      personId,
      payload.cybrid_source_account_id,
      transferType
    );

    if (!sourceAccountGuids) {
      throw new NotFoundException('Source bank account not found!');
    }

    const { currency, customerGuid, fiatAccountGuid, externalAccountGuid } =
      sourceAccountGuids;
    const bankGuid = this.configService.get('CYBRID_BANK_GUID');
    const fundingTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        asset: currency,
        side: 'deposit',
        bank_guid: bankGuid,
        customer_guid: customerGuid,
        receive_amount: payload.amount,
        product_type: PostQuoteBankModelProductTypeEnum.Funding,
      }
    );

    const fundingTransfer = await this.cybridService.initiateTransfer(
      customerGuid,
      {
        transfer_type: transferType,
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
          initial_currency: currency,
          amount: fundingTransfer.amount as number,
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
      reciepient_fullname: null,
    });
  }

  async initiateRemittance(
    { receiver, ...payload }: InitiateRemittanceDto,
    personId: string
  ) {
    const transferType = PostTransferBankModelTransferTypeEnum.Book;

    const sourceAccountGuids = await this.getSourceAccountGuids(
      personId,
      payload.cybrid_source_account_id,
      transferType
    );

    if (!sourceAccountGuids) {
      throw new NotFoundException('Source bank account not found!');
    }

    const cybridCounterparty = await this.getCounterpartyFromReceiver(receiver);

    // trade USD for USDC_SOL
    const [fiatTrade] = await this.trateFiatForCrypto(
      sourceAccountGuids,
      payload.amount
    );

    // execute book transfer on customer's  USDC_SOL to xafpay bank level account
    const cybridTransaction = await this.executeBookTransfer(
      fiatTrade.receive_amount as number,
      sourceAccountGuids,
      cybridCounterparty.cybrid_counterparty_guid
    );

    return new CybridTransactionEntity({
      ...cybridTransaction,
      reciepient_fullname: cybridCounterparty.fullname,
    });
  }

  async getTransaction(cybridTransactionId: string) {
    return this.prismaService.cybridTransaction.findUnique({
      where: { cybrid_transaction_id: cybridTransactionId },
    });
  }

  async getTransactions(
    { order_by, order_direction, search, status }: QueryTransactionDto,
    initiatedBy: string
  ) {
    const personFullnameSelect = {
      select: { Person: { select: { first_name: true, last_name: true } } },
    };
    const transantions = await this.prismaService.cybridTransaction.findMany({
      orderBy:
        order_by === 'amount'
          ? { amount: order_direction }
          : { initiated_at: order_direction },
      include: {
        LocalCustomer: personFullnameSelect,
        ReceiverPayoutInfo: {
          ...personFullnameSelect,
          where: { fullname: { search } },
        },
      },
      where: { status, initiated_by: initiatedBy },
    });

    return transantions.map(
      ({ LocalCustomer, ReceiverPayoutInfo, ...transantion }) => {
        const person = ReceiverPayoutInfo?.Person ?? LocalCustomer?.Person;
        return new CybridTransactionEntity({
          ...transantion,
          reciepient_fullname: person
            ? `${person.first_name} ${person.last_name}`
            : null,
        });
      }
    );
  }

  private async getSourceAccountGuids(
    personId: string,
    sourceAccountId: string,
    purpose: 'book' | 'instant_funding'
  ) {
    let customerAccount: CustomerAccountGuids | null = null;
    if (purpose === 'book') {
      const cybridAccount = await this.prismaService.cybridAccount.findFirst({
        select: {
          currency: true,
          cybrid_account_guid: true,
          CybridCustomer: {
            select: {
              cybrid_customer_guid: true,
              CybridAccounts: {
                take: 1,
                select: { cybrid_account_guid: true },
                where: { currency: 'USDC_SOL' },
              },
            },
          },
        },
        where: {
          cybrid_account_id: sourceAccountId,
          CybridCustomer: { person_id: personId },
        },
      });

      if (cybridAccount) {
        const {
          currency,
          CybridCustomer: customer,
          cybrid_account_guid: fiatAccountGuid,
        } = cybridAccount;

        customerAccount = {
          currency,
          fiatAccountGuid,
          customerGuid: customer.cybrid_customer_guid,
          cryptoAccountGuid: customer.CybridAccounts[0].cybrid_account_guid,
        };
      }
    } else {
      const externalAccount =
        await this.prismaService.cybridExternalAccount.findFirst({
          select: {
            currency: true,
            cybrid_external_account_guid: true,
            CybridCustomer: {
              select: {
                cybrid_customer_guid: true,
                CybridAccounts: {
                  take: 1,
                  select: {
                    cybrid_account_guid: true,
                  },
                  where: { currency: 'USD' },
                },
              },
            },
          },
          where: {
            cybrid_external_account_id: sourceAccountId,
            CybridCustomer: { person_id: personId },
          },
        });
      if (externalAccount) {
        const {
          CybridCustomer: {
            cybrid_customer_guid,
            CybridAccounts: [{ cybrid_account_guid }],
          },
          currency,
          cybrid_external_account_guid,
        } = externalAccount;
        customerAccount = {
          currency,
          fiatAccountGuid: cybrid_account_guid,
          customerGuid: cybrid_customer_guid,
          externalAccountGuid: cybrid_external_account_guid,
        };
      }
    }
    return customerAccount;
  }

  private async executeBookTransfer(
    amount: number,
    { currency, customerGuid, cryptoAccountGuid }: CustomerAccountGuids,
    counterpartyGuid: string
  ) {
    const transferType = PostTransferBankModelTransferTypeEnum.Book;

    const bankGuid = this.configService.get<string>(
      'CYBRID_BANK_GUID'
    ) as string;
    const bookTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        asset: 'USDC_SOL',
        deliver_amount: amount,
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
            amount: amount,
            guid: customerGuid,
            type: PostTransferParticipantBankModelTypeEnum.Customer,
          },
        ],
        destination_participants: [
          {
            amount: amount,
            guid: bankGuid,
            type: PostTransferParticipantBankModelTypeEnum.Bank,
          },
        ],
      }
    );

    const cybridTransaction = await this.prismaService.cybridTransaction.create(
      {
        data: {
          fees: 0,
          initial_currency: currency,
          amount: bookTransfer.amount as number,
          transaction_type: 'REMITTANCE',
          transaction_id: generateTransactionId(),
          cybrid_transaction_guid: bookTransfer.guid as string,
          status:
            bookTransfer.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
          InitiatedBy: {
            connect: { cybrid_customer_guid: customerGuid },
          },
          CryptoCybridAccount: {
            connect: { cybrid_account_guid: cryptoAccountGuid },
          },
          ReceiverPayoutInfo: {
            connect: { cybrid_counterparty_guid: counterpartyGuid },
          },
        },
      }
    );
    return cybridTransaction;
  }

  private async trateFiatForCrypto(
    {
      currency,
      customerGuid,
      fiatAccountGuid,
      cryptoAccountGuid,
    }: CustomerAccountGuids,
    fiatAmount: number
  ): Promise<[TradeBankModel, CybridTransaction]> {
    const tradeQuote = await this.cybridService.createQuote(customerGuid, {
      bank_guid: this.configService.get('CYBRID_BANK_GUID'),
      product_type: PostQuoteBankModelProductTypeEnum.Trading,
      deliver_amount: fiatAmount,
      customer_guid: customerGuid,
      symbol: 'USDC_SOL-USD',
      side: 'buy',
    });

    const tradeTransaction = await this.cybridService.initiateTrade(
      customerGuid,
      {
        quote_guid: tradeQuote.guid as string,
        trade_type: PostTradeBankModelTradeTypeEnum.Platform,
      }
    );

    const cybridTransaction = await this.prismaService.cybridTransaction.create(
      {
        data: {
          fees: 0,
          amount: fiatAmount,
          initial_currency: currency,
          transaction_id: generateTransactionId(),
          cybrid_transaction_guid: tradeTransaction.guid as string,
          status:
            tradeTransaction.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
          transaction_type: 'CONVERT',
          InitiatedBy: {
            connect: { cybrid_customer_guid: customerGuid },
          },
          CybridAccount: {
            connect: { cybrid_account_guid: fiatAccountGuid },
          },
          CryptoCybridAccount: {
            connect: { cybrid_account_guid: cryptoAccountGuid },
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

    if (cybridCounterparty.verification_status !== 'COMPLETED') {
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
        cybrid_transfer_settlement_guid: null,
        transaction_type: 'REMITTANCE',
        initial_currency: 'USDC_SOL',
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

    const totalAmount = transactions.reduce(
      (total, tx) => total + tx.amount,
      0
    );

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
            amount,
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

    await this.prismaService.cybridTransaction.updateMany({
      data: { cybrid_transfer_settlement_guid: transfer.guid },
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
}
