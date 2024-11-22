import {
  PostCounterpartyBankModelTypeEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
  PostQuoteBankModelProductTypeEnum,
  PostTransferBankModelTransferTypeEnum,
  PostTransferParticipantBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@prisma/client';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CybridTransactionEntity,
  InitiateTransferDto,
  QueryTransactionDto,
} from './transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService,
    private readonly configService: ConfigService
  ) {}

  async initiateTransfer(
    personId: string,
    {
      receiver,
      transfer_type: transferType,
      ...payload
    }: Omit<InitiateTransferDto, 'otp'>
  ) {
    const isBookTransfer =
      transferType == PostTransferBankModelTransferTypeEnum.Book;
    const isFundingTransfer =
      transferType == PostTransferBankModelTransferTypeEnum.InstantFunding ||
      transferType == PostTransferBankModelTransferTypeEnum.Funding;

    if (isBookTransfer || isFundingTransfer) {
      throw new NotImplementedException(
        `${transferType} transfers not implemented yet!`
      );
    }

    const customerAccount = await this.getCustomerAccount(
      personId,
      payload.cybrid_source_account_id,
      transferType
    );

    if (!customerAccount) {
      throw new NotFoundException('Source bank account not found!');
    }

    const { accountId, customerGuid, accountGuid } = customerAccount;

    let counterpartyCreateInput = null;
    if (receiver?.cybrid_counterparty_id) {
      const cybridCounterparty =
        await this.prismaService.cybridCounterparty.findUnique({
          where: { cybrid_counterparty_id: receiver.cybrid_counterparty_id },
        });

      if (!cybridCounterparty) {
        throw new NotFoundException(
          `Counterparty not found! omit 'cybrid_counterparty_id' to create a new.`
        );
      }
      counterpartyCreateInput = cybridCounterparty;
    } else if (receiver) {
      const counterparty = await this.cybridService.createCounterparty(
        customerGuid,
        {
          type: PostCounterpartyBankModelTypeEnum.Individual,
          name: { full: receiver.fullname },
        }
      );

      const counterpartyVerification = await this.cybridService.verifyIdentity(
        customerGuid,
        {
          counterparty_guid: counterparty.guid,
          type: PostIdentityVerificationBankModelTypeEnum.Counterparty,
          method: PostIdentityVerificationBankModelMethodEnum.Watchlists,
        }
      );

      if (counterpartyVerification.outcome === 'failed') {
        throw new UnauthorizedException(`Potential faulty receiver detected!`);
      }

      counterpartyCreateInput = {
        ...receiver,
        person_id: personId,
        cybrid_counterparty_guid: counterparty.guid as string,
      };
    }

    const fundingTransferQuote = await this.cybridService.createQuote(
      customerGuid,
      // adjusting product type based on our transfer type
      isBookTransfer
        ? PostQuoteBankModelProductTypeEnum.BookTransfer
        : PostQuoteBankModelProductTypeEnum.Funding,
      payload.amount,
      payload.currency
    );

    const fundingTransfer = await this.cybridService.initiateTransfer(
      customerGuid,
      {
        transfer_type: transferType,
        quote_guid: fundingTransferQuote.guid as string,
        // adjusting transfer payload accordingly
        ...(isBookTransfer && counterpartyCreateInput
          ? {
              source_account_guid: payload.cybrid_source_account_id,
              source_participants: [
                {
                  amount: payload.amount,
                  guid: payload.cybrid_source_account_id,
                  type: PostTransferParticipantBankModelTypeEnum.Customer,
                },
              ],
              destination_account_guid: this.configService.get(
                'CYBRID_BANK_ACCOUNT_ID'
              ),
              destination_participants: [
                {
                  amount: payload.amount,
                  guid: this.configService.get<string>(
                    'CYBRID_BANK_ACCOUNT_ID'
                  ) as string,
                  type: PostTransferParticipantBankModelTypeEnum.Bank,
                },
                {
                  amount: payload.amount,
                  guid: counterpartyCreateInput.cybrid_counterparty_guid as string,
                  type: PostTransferParticipantBankModelTypeEnum.Counterparty,
                },
              ],
            }
          : {
              fiat_account_guid: accountGuid,
              external_bank_account_guid: payload.cybrid_source_account_id,
            }),
      }
    );

    const customerFiatAccount = await this.cybridService.getAccount(
      customerGuid,
      accountGuid
    );

    const [cybridTransaction] = await this.prismaService.$transaction([
      this.prismaService.cybridTransaction.create({
        data: {
          fees: 0,
          initial_currency: payload.currency,
          amount: fundingTransfer.amount as number,
          transaction_type:
            transferType.toLocaleUpperCase() as $Enums.CybridTransactionType,
          cybrid_transaction_guid: fundingTransfer.guid as string,
          status: fundingTransfer.state as $Enums.CybridTransactionStatus,
          InitiatedBy: {
            connect: { cybrid_account_id: accountId },
          },
          CybridAccount: {
            connect: {
              cybrid_account_id: isBookTransfer
                ? payload.cybrid_source_account_id
                : accountId,
            },
          },
          // adjusting our database transaction payload accordingly
          ...(isBookTransfer
            ? {}
            : {
                CybridExternalAccount: {
                  connect: {
                    cybrid_external_account_id:
                      payload.cybrid_source_account_id,
                  },
                },
              }),
        },
      }),
      this.prismaService.cybridAccount.update({
        data: { balance: customerFiatAccount.platform_available as number },
        where: { cybrid_account_id: accountId },
      }),
      ...(counterpartyCreateInput
        ? [
            this.prismaService.cybridCounterparty.upsert({
              create: {
                fullname: counterpartyCreateInput.fullname,
                phone_number: counterpartyCreateInput.phone_number,
                national_id_number: counterpartyCreateInput.national_id_number,
                cybrid_counterparty_guid:
                  counterpartyCreateInput.cybrid_counterparty_guid,
                Person: {
                  connect: { person_id: counterpartyCreateInput.person_id },
                },
              },
              update: {
                fullname: counterpartyCreateInput.fullname,
                phone_number: counterpartyCreateInput.phone_number,
                national_id_number: counterpartyCreateInput.national_id_number,
              },
              where: receiver?.cybrid_counterparty_id
                ? { cybrid_counterparty_id: receiver.cybrid_counterparty_id }
                : {
                    person_id_fullname_phone_number: {
                      person_id: personId,
                      fullname: counterpartyCreateInput.fullname,
                      phone_number: counterpartyCreateInput.phone_number,
                    },
                  },
            }),
          ]
        : []),
    ]);

    return new CybridTransactionEntity({
      ...cybridTransaction,
      reciepient_fullname: receiver?.fullname ?? null,
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

  private async getCustomerAccount(
    personId: string,
    sourceAccountId: string,
    transferType: PostTransferBankModelTransferTypeEnum
  ) {
    type CustomerAccountType = {
      accountId: string;
      customerGuid: string;
      accountGuid: string;
    };

    let customerAccount: CustomerAccountType | null = null;
    if (transferType === PostTransferBankModelTransferTypeEnum.Book) {
      const cybridAccount = await this.prismaService.cybridAccount.findFirst({
        select: {
          cybrid_account_id: true,
          cybrid_account_guid: true,
          CybridCustomer: {
            select: { cybrid_customer_guid: true, CybridAccounts: true },
          },
        },
        where: {
          cybrid_account_id: sourceAccountId,
          CybridCustomer: { person_id: personId },
        },
      });
      if (cybridAccount) {
        customerAccount = {
          accountGuid: cybridAccount.cybrid_account_guid,
          accountId: cybridAccount.cybrid_account_id,
          customerGuid: cybridAccount.CybridCustomer.cybrid_customer_guid,
        };
      }
    } else {
      const externalAccount =
        await this.prismaService.cybridExternalAccount.findFirst({
          select: {
            CybridCustomer: {
              select: { cybrid_customer_guid: true, CybridAccounts: true },
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
            CybridAccounts: [{ cybrid_account_guid, cybrid_account_id }],
          },
        } = externalAccount;
        customerAccount = {
          accountId: cybrid_account_id,
          accountGuid: cybrid_account_guid,
          customerGuid: externalAccount.CybridCustomer.cybrid_customer_guid,
        };
      }
    }
    return customerAccount;
  }
}
