import {
  IdentityVerificationBankModel,
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
import { $Enums, IdentityVerificationStatus } from '@prisma/client';
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

    let status = null;

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

    // Create Counterparty in the database
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

    // Create identity verification for such the counterparty from Cybrid platform
    const identityVerification = await this.cybridService.verifyIdentity(
      customer.cybrid_customer_guid,
      {
        counterparty_guid: counterparty.guid,
        type: PostIdentityVerificationBankModelTypeEnum.Counterparty,
        method: PostIdentityVerificationBankModelMethodEnum.Watchlists,
      }
    );

    // Verify Counterparty
    const counterpartyVerification = (await this.counterpartyVerif(
      identityVerification.guid as string,
      customer.cybrid_customer_guid,
      {
        maxAttempts: 2,
        initialDelay: 1000,
      }
    )) as IdentityVerificationBankModel;

    // Pass through the verification loop if verification is not completed
    if (
      !['completed', 'expired'].includes(
        counterpartyVerification.state as string
      )
    ) {
      /**
       * Call pooling event that will check the status of the counterparty until it is completed
       * Then update the database and notify the user using push notification.
       * Run as a non-blocking background task.
       */
      const timeout = setTimeout(async () => {
        try {
          await this.counterpartyVerif(
            identityVerification.guid as string,
            customer.cybrid_customer_guid,
            {
              onComplete: async (result) => {
                await this.prismaService.cybridCounterparty.update({
                  data: {
                    verification_status: (
                      result.outcome ?? result.state
                    )?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus,
                  },
                  where: { cybrid_counterparty_guid: counterparty.guid },
                });

                // TODO: Send push notification to notify user for their counterparty status
              },
            }
          );
          clearInterval(timeout);
        } catch (error) {
          this.logger.error(error);
        }
      }, 1000);
    }
    const receiverVerified = await this.prismaService.cybridCounterparty.update(
      {
        data: {
          identity_verification_guid: counterpartyVerification.guid as string,
          verification_status:
            counterpartyVerification.outcome === 'failed'
              ? $Enums.IdentityVerificationStatus.FAILED
              : ((
                  counterpartyVerification.outcome ??
                  counterpartyVerification.state
                )?.toLocaleUpperCase() as $Enums.IdentityVerificationStatus),
        },
        where: { cybrid_counterparty_guid: counterparty.guid },
      }
    );

    return {
      counterpartyVerify: counterpartyVerification,
      receiverVerified,
    };
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

  /**
   * Generalized counterparty verification loop.
   *
   * @param verificationGuid - The verification GUID.
   * @param cybrid_customer_guid - The Cybrid customer GUID.
   * @param options - Optional settings:
   *    maxAttempts: number of attempts before giving up (undefined for infinite),
   *    initialDelay: delay before first check (ms),
   *    onComplete: callback when verification completes (optional).
   * @returns The final IdentityVerificationBankModel if maxAttempts is set, otherwise void.
   */
  private async counterpartyVerif(
    verificationGuid: string,
    cybrid_customer_guid: string,
    options?: {
      maxAttempts?: number;
      initialDelay?: number;
      onComplete?: (
        result: IdentityVerificationBankModel
      ) => Promise<void> | void;
    }
  ): Promise<IdentityVerificationBankModel | void> {
    let attempt = 1;
    let delay = options?.initialDelay ?? 1000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.logger.log(`Counterparty verification attempt #${attempt}...`);
      const counterpartyVerification =
        await new Promise<IdentityVerificationBankModel>((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await this.cybridService.getIdentityVerification(
                cybrid_customer_guid,
                verificationGuid
              );
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, delay);
        });

      if (
        ['completed', 'expired'].includes(
          counterpartyVerification.state as string
        )
      ) {
        this.logger.log(
          `Counterparty verification completed with status ${counterpartyVerification.state}`
        );
        if (options?.onComplete) {
          await options.onComplete(counterpartyVerification);
        }
        return options?.maxAttempts ? counterpartyVerification : undefined;
      }

      if (options?.maxAttempts && attempt >= options.maxAttempts) {
        this.logger.log(
          `Counterparty verification did not complete after ${attempt} attempts. Last status: ${counterpartyVerification.state}`
        );
        return counterpartyVerification;
      }

      delay = 3000;
      attempt += 1;
    }
  }
}
