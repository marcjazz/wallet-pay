import {
  PostQuoteBankModelProductTypeEnum,
  PostTradeBankModelTradeTypeEnum,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModelTypeEnum,
  TradeBankModel,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  $Enums,
  CybridSupportedCurrency,
  CybridTransaction,
} from '@prisma/client';
import { CybridService } from '../../cybrid/cybrid.service';
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

    const fundingTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        product_type: PostQuoteBankModelProductTypeEnum.Funding,
        receive_amount: payload.amount,
        asset: currency,
      }
    );

    const fundingTransfer = await this.cybridService.initiateTransfer(
      customerGuid,
      {
        payment_rail: 'ach',
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
    console.error(sourceAccountGuids);

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

    const bookTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      {
        asset: 'USDC_SOL',
        customer_guid: customerGuid,
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
          'CYBRID_BANK_WALLET_GUID'
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
            guid: this.configService.get('CYBRID_BANK_GUID') as string,
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
          cybrid_transaction_guid: tradeTransaction.guid as string,
          status:
            tradeTransaction.state?.toLocaleUpperCase() as $Enums.CybridTransactionStatus,
          transaction_type: 'CONVERT',
          InitiatedBy: {
            connect: { cybrid_customer_id: customerGuid },
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
        where: { cybrid_counterparty_id: receiver.cybrid_counterparty_id },
      });

    if (!cybridCounterparty) {
      throw new NotFoundException(`Receiver not found!`);
    }

    if (cybridCounterparty.status !== 'VERIFIED') {
      throw new UnauthorizedException(`Potential faulty receiver detected!`);
    }

    if (receiver.national_id_number || receiver.phone_number) {
      cybridCounterparty = await this.prismaService.cybridCounterparty.update({
        data: {
          phone_number: receiver.phone_number ?? undefined,
          national_id_number: receiver.national_id_number ?? undefined,
        },
        where: { cybrid_counterparty_id: receiver.cybrid_counterparty_id },
      });
    }

    return cybridCounterparty;
  }
}
