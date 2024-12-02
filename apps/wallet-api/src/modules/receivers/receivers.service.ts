import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SearchQueryDto } from '../../app/app.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiverDto } from './receiver.dto';
import { CybridService } from '../../cybrid/cybrid.service';
import {
  PostCounterpartyBankModelTypeEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import { $Enums } from '@prisma/client';

@Injectable()
export class RecieversService {
  private readonly logger = new Logger(RecieversService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async findAll(query?: SearchQueryDto) {
    return this.prismaService.cybridCounterparty.findMany({
      where: query?.search
        ? {
            OR: [
              { fullname: { search: query?.search } },
              { phone_number: { search: query?.search } },
              { national_id_number: { search: query?.search } },
            ],
          }
        : undefined,
    });
  }

  async findOne(counterpartyId: string) {
    return this.prismaService.cybridCounterparty.findUnique({
      where: { cybrid_counterparty_id: counterpartyId },
    });
  }

  async create(newReceiver: CreateReceiverDto, personId: string) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId },
    });
    if (!customer) {
      throw new NotFoundException('No customer found!');
    }

    const [first, last] = newReceiver.fullname.split(' ');
    const counterparty = await this.cybridService.createCounterparty(
      customer.cybrid_customer_guid,
      {
        address: newReceiver.address,
        name: { full: newReceiver.fullname, last, first },
        type: PostCounterpartyBankModelTypeEnum.Individual,
      }
    );

    setTimeout(async () => {
      try {
        this.logger.log(`Counterparty verification started...`);
        const counterpartyVerification =
          await this.cybridService.verifyIdentity(
            customer.cybrid_customer_guid,
            {
              counterparty_guid: counterparty.guid,
              type: PostIdentityVerificationBankModelTypeEnum.Counterparty,
              method: PostIdentityVerificationBankModelMethodEnum.Watchlists,
            }
          );

        await this.prismaService.cybridCounterparty.update({
          data: {
            identity_verification_guid: counterpartyVerification.guid as string,
            verification_status:
              counterpartyVerification.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
          },
          where: { cybrid_counterparty_guid: counterparty.guid },
        });

        this.logger.log(
          `Counterparty verification completed with status ${counterpartyVerification.state}`
        );
      } catch (error) {
        this.logger.error(error);
      }
    }, 7000);

    return await this.prismaService.cybridCounterparty.create({
      data: {
        address: newReceiver.address.toString(), // CM-OU, Bangangte, Chumba
        cybrid_counterparty_guid: counterparty.guid as string,
        fullname: newReceiver.fullname,
        phone_number: newReceiver.phone_number,
        national_id_number: newReceiver.national_id_number,
        Person: { connect: { person_id: personId } },
        status:
          counterparty.state?.toLocaleUpperCase() as $Enums.CybridCounterpartyStatus,
      },
    });
  }
}
