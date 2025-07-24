import {
  PostCounterpartyBankModelTypeEnum,
  PostIdentityVerificationBankModelMethodEnum,
  PostIdentityVerificationBankModelTypeEnum,
} from '@cybrid/cybrid-api-bank-typescript';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { SearchQueryDto } from '../../app/app.dto';
import { CybridService } from '../../cybrid/cybrid.service';
import { normalizeName, validatePhoneNumber } from '../../helpers/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceiverDto } from './receiver.dto';

@Injectable()
export class RecieversService {
  private readonly logger = new Logger(RecieversService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cybridService: CybridService
  ) {}

  async getCustomers() {
    return this.cybridService.getCustomers();
  }

  async findAll(query: SearchQueryDto) {
    return this.prismaService.cybridCounterparty.findMany({
      where: {
        person_id: query.person_id,
        is_deleted: false,
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
        where: { cybrid_counterparty_id: counterpartyId, is_deleted: false }
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

    // Validate receiver's account name
    // const { family_name, given_name } =
    //   await this.momoService.getAccountHolderBasicInfo(phoneNumber);
    // const regex = new RegExp(
    //   `(?=.*\\b${family_name}\\b)(?=.*\\b${given_name}\\b)`,
    //   'i'
    // );
    // if (
    //   process.env.NODE_ENV === 'production' &&
    //   fullname.search(regex) === -1
    // ) {
    //   throw new UnprocessableEntityException(
    //     `Receiver's fullname doesn't match MoMo Account holder basic info`
    //   );
    // }

    const existingCounterParty =
      await this.prismaService.cybridCounterparty.findFirst({
        where: {
          fullname: normalizeName(fullname),
          person_id: personId,
          is_deleted: false
        }
      });

    if (existingCounterParty?.phone_number === phoneNumber) {
      throw new ConflictException(
        `Receiver already exist with phone number: ${phoneNumber}`
      );
    }

    let status = existingCounterParty?.status;
    let counterpartyGuid = existingCounterParty?.cybrid_counterparty_guid;

    if (!existingCounterParty) {
      const counterparty = await this.cybridService.createCounterparty(
        customer.cybrid_customer_guid,
        {
          address,
          name: { full: fullname, last, first },
          type: PostCounterpartyBankModelTypeEnum.Individual,
        }
      );
      status =
        counterparty.state?.toLocaleUpperCase() as $Enums.CybridCounterpartyStatus;
      counterpartyGuid = counterparty.guid as string;

      const timeout = setTimeout(async () => {
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
              identity_verification_guid:
                counterpartyVerification.guid as string,
              verification_status:
                counterpartyVerification.outcome === 'failed'
                  ? $Enums.IdentityVerificationStatus.FAILED
                  : (counterpartyVerification.state?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus),
            },
            where: { cybrid_counterparty_guid: counterparty.guid },
          });

          this.logger.log(
            `Counterparty verification completed with status ${counterpartyVerification.state}`
          );
          clearInterval(timeout);
        } catch (error) {
          this.logger.error(error);
        }
      }, 1000);
    }

    return await this.prismaService.cybridCounterparty.create({
      data: {
        fullname,
        address: `${address.city}, ${address.street} (${address.country_code}-${address.subdivision})`,
        cybrid_counterparty_guid: counterpartyGuid as string,
        phone_number: phoneNumber,
        national_id_number: newReceiver.national_id_number,
        Person: { connect: { person_id: personId } },
        status: status ?? 'STORING'
      }
    });
  }

  async update(
    counterpartyId: string,
    updatedReciever: CreateReceiverDto,
    personId: string
  ) {
    const customer = await this.prismaService.cybridCustomer.findFirst({
      where: { person_id: personId }
    });
    if (!customer) {
      throw new NotFoundException('No customer found!');
    }

    await this.prismaService.cybridCounterparty.update({
      where: {
        cybrid_counterparty_id: counterpartyId,
        person_id: personId
      },
      data: {
        is_deleted: true,
        deleted_at: new Date()
      }
    });
    return await this.create(updatedReciever, personId);
  }
}
