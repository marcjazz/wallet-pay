import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import {
  CybridCustomerStatus,
  CybridExternalAccountStatus,
  IdentityVerificationStatus,
} from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { cybridConstants, cybridJobs } from './constants';
import { CybridService } from './cybrid.service';
import { IdentityVerificationWithDetailsBankModel } from '@cybrid/cybrid-api-bank-typescript';

@Processor(cybridConstants.QUEUE)
export class CybridProcessor {
  private readonly logger = new Logger(CybridProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService
  ) {}

  @Process(cybridJobs.PULLING_CYBRID_CUSTOMER)
  async pullCybridCustomer(job: Job<string>) {
    this.logger.debug('Pulling cybrid customer...');

    const customer = await this.cybridService.getCustomer(job.data);
    if (!customer.state || customer.state === CybridCustomerStatus.STORING) {
      throw new Error('Customer creation not completed yet!');
    }

    this.prismaService.cybridCustomer.update({
      data: {
        status: customer.state.toLocaleUpperCase() as CybridCustomerStatus,
      },
      where: { cybrid_customer_guid: job.data },
    });

    this.logger.log(
      `Successfully pulled customer from cybrid and updated database`
    );
  }

  @Process(cybridJobs.PULLING_CUSTOMER_IDENTITY_VERIFICATION)
  async pullIdentityVerification(job: Job<string>) {
    this.logger.debug('Pulling cybrid customer identity verification...');

    const identityVerification = await this.fetchIdentityVerification(job.data);

    await this.prismaService.cybridCustomer.update({
      data: {
        verification_status:
          identityVerification.state as IdentityVerificationStatus,
      },
      where: {
        cybrid_customer_guid: identityVerification.customer_guid as string,
      },
    });

    this.logger.log(
      `Successfully pulled customer from cybrid and updated database`
    );
  }

  @Process(cybridJobs.PULLING_EXTERNAL_ACCOUNT_IDENTITY_VERIFICATION)
  async pullExternalAccountIdentityVerification(job: Job<string>) {
    this.logger.debug(
      'Pulling cybrid external bank account identity verification...'
    );

    const identityVerification = await this.fetchIdentityVerification(job.data);
    if (
      !identityVerification ||
      !identityVerification.external_bank_account_guid
    ) {
      throw new Error(
        'External bank account identity verification not completed yet!'
      );
    }

    const externalAccount = await this.cybridService.getExternalBankAccount(
      identityVerification.customer_guid as string,
      identityVerification.external_bank_account_guid
    );

    await this.prismaService.cybridExternalAccount.update({
      data: {
        verification_status:
          identityVerification.state as IdentityVerificationStatus,
        status:
          externalAccount.state?.toLocaleUpperCase() as CybridExternalAccountStatus,
      },
      where: {
        cybrid_external_account_guid:
          identityVerification.external_bank_account_guid as string,
      },
    });
  }

  private async fetchIdentityVerification(
    identityVerificationGuid: string
  ): Promise<IdentityVerificationWithDetailsBankModel> {
    const identityVerification =
      await this.cybridService.getIdentityVerification(
        identityVerificationGuid
      );

    const finalIDVerificationStatus: IdentityVerificationStatus[] = [
      IdentityVerificationStatus.COMPLETED,
      IdentityVerificationStatus.EXPIRED,
    ];
    const identityVerificationStatus =
      identityVerification.state?.toLocaleUpperCase() as IdentityVerificationStatus;
    if (
      !identityVerificationStatus ||
      !identityVerification.customer_guid ||
      !finalIDVerificationStatus.includes(identityVerificationStatus)
    ) {
      throw new Error('Identity verification not completed yet!');
    }

    return { ...identityVerification, state: identityVerificationStatus };
  }
}
