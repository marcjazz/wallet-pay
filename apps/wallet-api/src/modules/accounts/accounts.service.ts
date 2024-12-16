import {
  PostExternalBankAccountBankModelAccountKindEnum,
  PostIdentityVerificationBankModel,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums, IdentityVerificationStatus } from '@prisma/client';
import { CybridService } from '../../cybrid/cybrid.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateExternalAccountDto
} from './dto/account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async findAccounts(personId: string) {
    const cybridAccounts = await this.prismaService.cybridAccount.findMany({
      include: {
        CybridCustomer: {
          select: {
            identity_verification_guid: true,
            verification_status: true,
          },
        },
      },
      where: { CybridCustomer: { person_id: personId } },
    });
    return cybridAccounts;
  }

  async verifyCybridCustomer(personId: string) {
    let customer = await this.prismaService.cybridCustomer.findFirst({
      include: { CybridExternalAccounts: true },
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('Customer account not found!');
    }

    if (
      customer.identity_verification_guid == null ||
      customer.verification_status === 'FAILED' ||
      customer.verification_status === 'EXPIRED'
    ) {
      const identityVerification = await this.cybridService.verifyIdentity(
        customer.cybrid_customer_guid,
        {
          type: PostIdentityVerificationBankModelTypeEnum.Kyc,
          method: PostIdentityVerificationBankModelMethodEnum.IdAndSelfie,
          customer_guid: customer.cybrid_customer_guid,
        }
      );
      customer = {
        ...customer,
        identity_verification_guid: identityVerification.guid as string,
      };

      await this.prismaService.cybridCustomer.update({
        include: { CybridExternalAccounts: true },
        data: {
          identity_verification_guid: identityVerification.guid,
          verification_status:
            identityVerification.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
        },
        where: { cybrid_customer_id: customer.cybrid_customer_id },
      });
    }

    if (customer.verification_status === 'COMPLETED') {
      throw new ConflictException('Customer is successfully verified already!');
    }

    return this.cybridService.getIdentityVerification(
      customer.cybrid_customer_guid,
      customer.identity_verification_guid as string
    );
  }

  async verifyCybridExternalAccount(externalBankAccountId: string) {
    const cybridExternalAccount =
      await this.prismaService.cybridExternalAccount.findUnique({
        include: { CybridCustomer: true },
        where: { cybrid_external_account_id: externalBankAccountId },
      });

    if (!cybridExternalAccount) {
      throw new NotFoundException('External account not found!');
    }

    const identityVerificationPayload: PostIdentityVerificationBankModel = {
      type: PostIdentityVerificationBankModelTypeEnum.BankAccount,
      method: PostIdentityVerificationBankModelMethodEnum.AccountOwnership,
      external_bank_account_guid:
        cybridExternalAccount.cybrid_external_account_guid,
    };

    let { CybridCustomer: customer } = cybridExternalAccount;
    const identityVerification = await this.cybridService.verifyIdentity(
      customer.cybrid_customer_guid,
      {
        ...identityVerificationPayload,
        customer_guid: customer.cybrid_customer_guid,
      }
    );
    customer = {
      ...customer,
      identity_verification_guid: identityVerification.guid as string,
    };

    await this.prismaService.cybridExternalAccount.update({
      data: {
        identity_verification_guid: identityVerification.guid,
        verification_status:
          identityVerification.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
      },
      where: { cybrid_external_account_id: externalBankAccountId },
    });

    return this.cybridService.getIdentityVerification(
      customer.cybrid_customer_guid,
      customer.identity_verification_guid as string
    );
  }

  async findExternalAccounts(
    personId: string,
    verificationStatus?: IdentityVerificationStatus
  ) {
    const cybridCustomers =
      await this.prismaService.cybridExternalAccount.findMany({
        where: {
          verification_status: verificationStatus,
          CybridCustomer: { person_id: personId },
        },
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
      currency,
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

    const externalAccount = await this.cybridService.createExternalBankAccount(
      customer.cybrid_customer_guid,
      {
        asset: currency,
        plaid_account_id,
        plaid_public_token,
        plaid_account_mask,
        name: `${currency} Funding Account`,
        customer_guid: customer.cybrid_customer_guid,
        account_kind: PostExternalBankAccountBankModelAccountKindEnum.Plaid,
      }
    );

    return this.prismaService.cybridExternalAccount.create({
      data: {
        currency,
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
}
