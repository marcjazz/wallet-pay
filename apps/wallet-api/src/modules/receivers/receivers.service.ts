import { PostCounterpartyBankModelTypeEnum } from '@cybrid/cybrid-api-bank-typescript';
import { InjectQueue } from '@nestjs/bull';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { $Enums, IdentityVerificationStatus } from '@prisma/client';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';
import { SearchQueryDto } from '../../app/app.dto';
import { constants } from '../../constants';
import { CybridService } from '../../cybrid/cybrid.service';
import { normalizeName, validatePhoneNumber } from '../../helpers/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { UnsupportedCybridSubcriptionEvents } from '../../types/cybrid/enums';
import { UnsupportedCybridSubcriptionEventObjectDto } from '../webhooks/dtos/cybrid-subscription.dto';
import { CreateReceiverDto } from './receiver.dto';

@Injectable()
export class RecieversService {
  private readonly logger = new Logger(RecieversService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService,
    @InjectQueue(constants.WEBHOOK_QUEUE)
    private readonly webhooksQueue: Queue<UnsupportedCybridSubcriptionEventObjectDto>
  ) {}

  async findAll(query: SearchQueryDto) {
    return this.prismaService.cybridCounterparty.findMany({
      where: {
        person_id: query.person_id,
        is_deleted: false,
        verification_status: {
          not: IdentityVerificationStatus.FAILED,
        },
        ...(query.search
          ? {
              OR: [
                { fullname: { search: query?.search } },
                { phone_number: { search: query?.search } },
                { national_id_number: { search: query?.search } },
              ],
            }
          : {}),
      },
    });
  }

  async findOne(counterpartyId: string) {
    const counterparty = await this.prismaService.cybridCounterparty.findUnique(
      {
        where: { cybrid_counterparty_id: counterpartyId, is_deleted: false },
      }
    );

    if (!counterparty) {
      throw new NotFoundException(`Counterparty not found!`);
    }
    return counterparty;
  }

  async create(
    {
      address,
      phone_number: phoneNumber,
      fullname,
      ...newReceiver
    }: CreateReceiverDto,
    personId: string
  ) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('No customer found!');
    }

    const [first, last] = fullname.split(' ');

    // Validate receiver's phone number
    if (validatePhoneNumber(phoneNumber) === -1) {
      throw new UnprocessableEntityException(
        'Phone number must be a valid Mobile money number'
      );
    }

    const existingCounterParty =
      await this.prismaService.cybridCounterparty.findFirst({
        where: {
          phone_number: phoneNumber,
          person_id: personId,
          is_deleted: false,
        },
      });

    if (existingCounterParty) {
      throw new ConflictException(
        `Receiver already exist with phone number: ${phoneNumber}`
      );
    }

    const counterparty = await this.cybridService.createCounterparty(
      customer.cybrid_customer_guid,
      {
        address,
        name: { full: fullname, last, first },
        type: PostCounterpartyBankModelTypeEnum.Individual,
      }
    );
    const status =
      counterparty.state?.toLocaleUpperCase() as $Enums.CybridCounterpartyStatus;

    // Create Counterparty in the database
    const cybridCounterparty =
      await this.prismaService.cybridCounterparty.create({
        data: {
          fullname: normalizeName(fullname),
          address: `${address.city}, ${address.street} (${address.country_code}-${address.subdivision})`,
          cybrid_counterparty_guid: counterparty.guid as string,
          phone_number: phoneNumber,
          national_id_number: newReceiver.national_id_number,
          Person: { connect: { person_id: personId } },
          status: status ?? 'STORING',
        },
      });

    // Start a job that will initiate the counterparty verification
    this.webhooksQueue.add(
      constants.INITIATE_COUNTERPARTY_VERIFICATION,
      {
        guid: randomUUID(),
        environment:
          process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        event_type: UnsupportedCybridSubcriptionEvents.COUNTERPARTY_CREATED,
        object_guid: cybridCounterparty.cybrid_counterparty_guid,
      },
      {
        attempts: 3,
        removeOnComplete: true,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );

    return cybridCounterparty;
  }

  async update(
    counterpartyId: string,
    updatedReciever: CreateReceiverDto,
    personId: string
  ) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('No customer found!');
    }

    await this.prismaService.cybridCounterparty.update({
      where: {
        cybrid_counterparty_id: counterpartyId,
        person_id: personId,
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
    return await this.create(updatedReciever, personId);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async rescueUnverifiedCounterparties() {
    const counterparties = await this.prismaService.cybridCounterparty.findMany(
      {
        where: {
          is_deleted: false,
          created_at: {
            lte: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          },
          identity_verification_guid: null,
        },
      }
    );

    if (counterparties.length === 0) {
      this.logger.log('No counterparties to pull');
      return;
    }

    counterparties.map((counterparty) => {
      // Start a job that will initiate the counterparty verification
      this.webhooksQueue.add(
        constants.INITIATE_COUNTERPARTY_VERIFICATION,
        {
          guid: randomUUID(),
          environment:
            process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
          event_type: UnsupportedCybridSubcriptionEvents.COUNTERPARTY_CREATED,
          object_guid: counterparty.cybrid_counterparty_guid,
        },
        {
          attempts: 3,
          removeOnComplete: true,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      );
    });
  }
}
