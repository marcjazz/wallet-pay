import { Process, Processor } from '@nestjs/bull';
import { Logger, NotImplementedException } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';
import { Job } from 'bull';
import { constants } from '../../../constants';
import { CybridService } from '../../../cybrid/cybrid.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { CybridSubscriptionEventObjectDto } from '../dtos/cybrid-subscription.dto';
import { parseEventObject } from '../helpers/event-parser';

@Processor(constants.WEBHOOK_QUEUE)
export class TradesProcessor {
  private readonly logger = new Logger(TradesProcessor.name);

  constructor(
    private readonly cybridService: CybridService,
    private readonly prismaService: PrismaService
  ) {}

  @Process(constants.CYBRID_TRADE_EVENTS)
  async handle(job: Job<CybridSubscriptionEventObjectDto>) {
    const { event_type: eventType, guid } = job.data;
    this.logger.log(
      `Processing (event: ${eventType}, Guid: ${guid}) from cybrid...`
    );

    const parsedObject = await parseEventObject(job.data, {
      logger: this.logger,
      prisma: this.prismaService,
    });
    if (!parsedObject) {
      return;
    }

    const { customerGuid, transactionGuid, transactionStatus } = parsedObject;

    const trade = await this.cybridService.getTrade(
      customerGuid,
      transactionGuid
    );
    if (
      trade.trade_type !== 'platform' ||
      trade.symbol !== constants.SUPPORTED_TRADE_SYMBOL
    ) {
      throw new NotImplementedException(
        `${trade.trade_type} not  supported for symbol ${trade.symbol} yet!`
      );
    }

    const { CryptoCybridAccount: cryptoAccount, CybridAccount: fiatAccount } =
      await this.prismaService.cybridTransaction.findUniqueOrThrow({
        select: {
          CryptoCybridAccount: { select: { cybrid_account_guid: true } },
          CybridAccount: { select: { cybrid_account_guid: true } },
        },
        where: { cybrid_transaction_guid: transactionGuid },
      });

    const accountUpdateOperations: PrismaPromise<unknown>[] = [];

    if (cryptoAccount) {
      const customerAccount = await this.cybridService.getAccount(
        customerGuid,
        cryptoAccount.cybrid_account_guid
      );
      accountUpdateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            balance:
              // Convert lamports to SOL
              (customerAccount.platform_available as number) / 1e6,
          },
          where: { cybrid_account_guid: cryptoAccount.cybrid_account_guid },
        })
      );
    }

    if (fiatAccount) {
      const customerAccount = await this.cybridService.getAccount(
        customerGuid,
        fiatAccount.cybrid_account_guid
      );
      accountUpdateOperations.push(
        this.prismaService.cybridAccount.update({
          data: {
            balance:
              // Convert cents to USD
              (customerAccount.platform_available as number) / 100,
          },
          where: { cybrid_account_guid: fiatAccount.cybrid_account_guid },
        })
      );
    }

    await this.prismaService.$transaction([
      ...accountUpdateOperations,
      this.prismaService.cybridTransaction.update({
        data:
          transactionStatus === 'COMPLETED'
            ? { status: transactionStatus, settled_at: new Date() }
            : { status: transactionStatus },
        where: { cybrid_transaction_guid: transactionGuid },
      }),
    ]);

    this.logger.log(
      `Successfully processed (event: ${eventType}, Guid: ${guid}) from cybrid.`
    );
  }
}
