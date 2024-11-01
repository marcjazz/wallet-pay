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
  UnprocessableEntityException,
} from '@nestjs/common';
import { $Enums, CybridCounterparty } from '@prisma/client';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InitiateTransferDto } from './transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
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

    let customerAccount = null;
    if (isBookTransfer) {
      if (!receiver) {
        throw new UnprocessableEntityException(
          `Receiver must be provided for ${transferType} transfer type`
        );
      }

      customerAccount = await this.prismaService.cybridAccount.findFirst({
        select: { CybridCustomer: { include: { CybridAccounts: true } } },
        where: {
          cybrid_account_id: payload.cybrid_source_account_id,
          CybridCustomer: { person_id: personId },
        },
      });
    } else if (isFundingTransfer) {
      customerAccount =
        await this.prismaService.cybridExternalAccount.findFirst({
          include: { CybridCustomer: { include: { CybridAccounts: true } } },
          where: {
            cybrid_external_account_id: payload.cybrid_source_account_id,
            CybridCustomer: { person_id: personId },
          },
        });
    } else
      throw new NotImplementedException(
        `${transferType} transfers not implemented yet!`
      );

    if (!customerAccount) {
      throw new NotFoundException('Source bank account not found!');
    }

    const {
      CybridCustomer: {
        CybridAccounts: [cybridAccount],
        cybrid_customer_guid: customerGuid,
      },
    } = customerAccount;

    let receiverPayoutInfo: CybridCounterparty | null = null;
    if (receiver) {
      if (receiver.cybrid_counterparty_id) {
        receiverPayoutInfo =
          await this.prismaService.cybridCounterparty.findUnique({
            where: { cybrid_counter_party_id: receiver.cybrid_counterparty_id },
          });

        if (!receiverPayoutInfo) {
          throw new NotFoundException(
            `Counterparty not found! omit 'cybrid_counterparty_id' to create a new.`
          );
        }
      } else {
        const counterparty = await this.cybridService.createCounterparty(
          customerGuid,
          {
            type: PostCounterpartyBankModelTypeEnum.Individual,
            name: { full: receiver.fullname },
          }
        );

        const counterpartyVerification =
          await this.cybridService.verifyIdentity(customerGuid, {
            counterparty_guid: counterparty.guid,
            type: PostIdentityVerificationBankModelTypeEnum.Counterparty,
            method: PostIdentityVerificationBankModelMethodEnum.Watchlists,
          });

        if (counterpartyVerification.outcome === 'failed') {
          throw new UnauthorizedException(
            `Potential faulty receiver detected!`
          );
        }

        receiverPayoutInfo = await this.prismaService.cybridCounterparty.create(
          {
            data: {
              ...receiver,
              person_id: personId,
              cybrid_counterparty_guid: counterparty.guid as string,
            },
          }
        );
      }
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
        ...(isBookTransfer && receiverPayoutInfo
          ? {
              source_account_guid: payload.cybrid_source_account_id,
              source_participants: [
                {
                  amount: payload.amount,
                  guid: payload.cybrid_source_account_id,
                  type: PostTransferParticipantBankModelTypeEnum.Customer,
                },
              ],
              destination_account_guid: process.env.CYBRID_BANK_ACCOUNT_ID,
              destination_participants: [
                {
                  amount: payload.amount,
                  guid: process.env.CYBRID_BANK_ACCOUNT_ID as string,
                  type: PostTransferParticipantBankModelTypeEnum.Bank,
                },
                {
                  amount: payload.amount,
                  guid: receiverPayoutInfo.cybrid_counterparty_guid,
                  type: PostTransferParticipantBankModelTypeEnum.Counterparty,
                },
              ],
            }
          : {
              fiat_account_guid: cybridAccount.cybrid_account_guid,
              external_bank_account_guid: payload.cybrid_source_account_id,
            }),
      }
    );

    const customerFiatAccount = await this.cybridService.getAccount(
      customerGuid,
      cybridAccount.cybrid_account_guid
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
            connect: { cybrid_account_id: cybridAccount.cybrid_account_id },
          },
          CybridAccount: {
            connect: {
              cybrid_account_id: isBookTransfer
                ? payload.cybrid_source_account_id
                : cybridAccount.cybrid_account_id,
            },
          },
          // adjusting our database transaction payload accordingly
          ...(isBookTransfer && receiverPayoutInfo
            ? {
                ReceiverPayoutInfo: {
                  connect: {
                    cybrid_counter_party_id:
                      receiverPayoutInfo.cybrid_counter_party_id,
                  },
                },
              }
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
        where: { cybrid_account_id: cybridAccount.cybrid_account_id },
      }),
    ]);

    return cybridTransaction;
  }
}
