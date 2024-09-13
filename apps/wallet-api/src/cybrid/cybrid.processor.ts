import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CybridService } from './cybrid.service';
import { cybridConstants } from './constants';

@Processor(cybridConstants.QUEUE)
export class CybridProcessor {
  private readonly logger = new Logger(CybridProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService
  ) {}

  @Process('identity-verification-init')
  async handleMailQueue(job: Job<string>) {
    const customerGuid = job.data;
    this.logger.debug('Processing identity-verification-init job...');

    try {
      const identityVerification =
        await this.cybridService.createIdentityVerification(customerGuid);
      await this.prismaService.cybridCustomer.update({
        data: {
          identity_verification_guid: identityVerification.guid as string,
        },
        where: { cybrid_customer_guid: customerGuid },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw new Error('Failed to create identity verification');
    }

    this.logger.log(
      `Successfully processed identity-verification-init job for customer: ${job.data}`
    );
  }
}
