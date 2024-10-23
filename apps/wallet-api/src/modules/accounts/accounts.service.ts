import {
  PostExternalBankAccountBankModelAccountKindEnum,
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
import {
  CreateExternalAccountDto,
  InitiateTransferDto,
} from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async findAccounts(personId: string) {
    const cybridAccounts = await this.prismaService.cybridAccount.findMany({
      where: { CybridCustomer: { person_id: personId } },
    });
    return cybridAccounts;
  }

  async initiateVerificationProcess(accountId: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { CybridAccounts: { some: { cybrid_account_id: accountId } } },
    });
    if (!customer) {
      throw new NotFoundException('Customer account not found!');
    }

    const identityVerification =
      await this.cybridService.createIdentityVerification(
        customer.cybrid_customer_guid
      );

    const verificationPayload = {
      identity_verification_guid: identityVerification.guid,
      verification_status:
        identityVerification.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
    };
    await this.prismaService.cybridCustomer.update({
      data: {
        ...verificationPayload,
        CybridAccounts: {
          updateMany: {
            data: verificationPayload,
            where: { cybrid_customer_id: customer.cybrid_customer_id },
          },
        },
      },
      where: { cybrid_customer_id: customer.cybrid_customer_id },
    });

    return this.cybridService.getIdentityVerification(
      customer.cybrid_customer_guid,
      identityVerification.guid as string
    );
  }

  async findExternalAccounts(personId: string) {
    const cybridCustomers =
      await this.prismaService.cybridExternalAccount.findMany({
        where: { CybridCustomer: { person_id: personId } },
      });
    return cybridCustomers;
  }

  async createWorkflow(personId: string, redirectUri?: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }
    return this.cybridService.createWorkflow(
      customer.cybrid_customer_guid,
      redirectUri
    );
  }

  async getWorkflow(personId: string, workflowGuid: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }

    return this.cybridService.getWorkflow(
      customer.cybrid_customer_guid,
      workflowGuid
    );
  }

  async createExternalAccount(
    {
      currency: asset,
      plaid_account_mask,
      plaid_account_id,
      plaid_public_token,
    }: CreateExternalAccountDto,
    personId: string
  ) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found!');
    }

    let {
      objects: [externalAccount],
    } = await this.cybridService.getExternalBankAccounts(
      customer.cybrid_customer_guid
    );
    if (!externalAccount) {
      externalAccount = await this.cybridService.createExternalBankAccount(
        customer.cybrid_customer_guid,
        {
          asset,
          plaid_account_id,
          plaid_public_token,
          plaid_account_mask,
          name: `${asset} Funding Account`,
          customer_guid: customer.cybrid_customer_guid,
          account_kind: PostExternalBankAccountBankModelAccountKindEnum.Plaid,
        }
      );
    } else if (
      externalAccount.state === $Enums.CybridExternalAccountStatus.UNVERIFIED
    ) {
      await this.cybridService.verifyExternalAccount(
        customer.cybrid_customer_guid,
        externalAccount.guid as string
      );
    }

    return this.prismaService.cybridExternalAccount.create({
      data: {
        name: externalAccount.name as string,
        balance: externalAccount.balances?.available ?? 0,
        mask: (externalAccount.plaid_account_mask ??
          plaid_account_mask) as string,
        cybrid_external_account_guid: externalAccount.guid as string,
        status:
          externalAccount.state?.toLocaleUpperCase() as $Enums.CybridExternalAccountStatus,
        CybridCustomer: {
          connect: { cybrid_customer_id: customer.cybrid_customer_id },
        },
      },
    });
  }

  async initiateTransfer(
    personId: string,
    { transfer_type: transferType, ...payload }: InitiateTransferDto
  ) {
    const isBookTransfer =
      transferType == PostTransferBankModelTransferTypeEnum.Book;
    const isFundingTransfer =
      transferType == PostTransferBankModelTransferTypeEnum.InstantFunding ||
      transferType == PostTransferBankModelTransferTypeEnum.Funding;

    let cybridExternalAccount = null;
    if (isBookTransfer) {
      cybridExternalAccount = await this.prismaService.cybridAccount.findFirst({
        include: { CybridCustomer: { include: { CybridAccounts: true } } },
        where: {
          cybrid_account_id: payload.cybrid_source_account_id,
          CybridCustomer: { person_id: personId },
        },
      });
    } else if (isFundingTransfer) {
      cybridExternalAccount =
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

    if (!cybridExternalAccount) {
      throw new NotFoundException('External bank account not found!');
    }

    const {
      CybridCustomer: {
        CybridAccounts: [cybridAccount],
        ...customer
      },
    } = cybridExternalAccount;

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

    const [cybridTransaction] = await this.prismaService.$transaction([
      this.prismaService.cybridTransaction.create({
        data: {
          fees: 0,
          initial_currency: payload.currency,
          amount: fundingTransfer.amount as number,
          transaction_type: $Enums.CybridTransactionType.FUNDING,
          cybrid_transaction_guid: fundingTransfer.guid as string,
          status: fundingTransfer.state as $Enums.CybridTransactionStatus,
          InitiatedBy: {
            connect: { cybrid_account_id: cybridAccount.cybrid_account_id },
          },
          // adjusting our database transaction payload accordingly
          ...(isBookTransfer
            ? {
                CybridAccount: {
                  connect: {
                    cybrid_account_id: payload.cybrid_source_account_id,
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
