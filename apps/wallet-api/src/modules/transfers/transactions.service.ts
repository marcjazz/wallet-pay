import {
  PostQuoteBankModelProductTypeEnum,
  PostTransferBankModelTransferTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
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
      customerAccount = await this.prismaService.cybridAccount.findFirst({
        include: { CybridCustomer: { include: { CybridAccounts: true } } },
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
        ...customer
      },
    } = customerAccount;

    const fundingTransferQuote = await this.cybridService.createQuote(
      customer.cybrid_customer_guid,
      // adjusting product type based on our transfer type
      isBookTransfer
        ? PostQuoteBankModelProductTypeEnum.BookTransfer
        : PostQuoteBankModelProductTypeEnum.Funding,
      payload.amount,
      payload.currency
    );

    const fundingTransfer = await this.cybridService.initiateTransfer(
      customer.cybrid_customer_guid,
      {
        transfer_type: transferType,
        quote_guid: fundingTransferQuote.guid as string,
        // adjusting transfer payload accordingly
        ...(isBookTransfer
          ? {
              source_account_guid: payload.cybrid_source_account_id,
              destination_account_guid: process.env.CYBRID_BANK_ACCOUNT_ID,
            }
          : {
              fiat_account_guid: cybridAccount.cybrid_account_guid,
              external_bank_account_guid: payload.cybrid_source_account_id,
            }),
      }
    );

    const customerFiatAccount = await this.cybridService.getAccount(
      customer.cybrid_customer_guid,
      cybridAccount.cybrid_account_guid
    );
    const receiverPayoutInfo =
      await this.prismaService.receiverPayoutInfo.upsert({
        create: { ...receiver, person_id: personId },
        update: receiver,
        where: {
          person_id_fullname_phone_number: {
            person_id: personId,
            fullname: receiver.fullname,
            phone_number: receiver.phone_number,
          },
        },
      });

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
          ...(isBookTransfer
            ? {
                ReceiverPayoutInfo: {
                  connect: {
                    receiver_payout_info_id:
                      receiverPayoutInfo.receiver_payout_info_id,
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
