import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { roundNumber } from '../../helpers/utils';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrencyEntity, ForexCurrencyEntity } from './currency.dto';

type Rates = Record<string, number>;
type Rate = { code: string; value: number };

interface ICurrencyRate {
  ms: number;
  base: 'XAF';
  updated: string;
  results: Rates;
}

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.syncCurrencies();
  }

  async findAll(is_active?: boolean): Promise<CurrencyEntity[]> {
    const currencies = await this.prismaService.supportedCurrency.findMany({
      where: { is_active },
    });

    // Refetching currencies if needed
    if (currencies.length === 0) {
      await this.syncCurrencies();
      return this.findAll(is_active);
    }

    return currencies.map((currency) => new CurrencyEntity(currency));
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async syncCurrencies() {
    this.logger.log('Fetching currencies from fastforex.com...');
    try {
      const admin = await this.prismaService.personHasRole.findFirst({
        where: {
          Person: {
            email: this.configService.get('APP_EMAIL', 'xafpay@gmail.com'),
          },
        },
      });
      if (!admin) {
        this.logger.error(
          'Failed to run currency cron job: No admin account was found.'
        );
        return;
      }

      const currencies = await this.prismaService.supportedCurrency.findMany({
        select: {
          currency: true,
          xaf_rate: true,
          last_updated: true,
        },
      });
      const initialCurrencies: Prisma.SupportedCurrencyCreateManyInput[] = [
        {
          currency: 'USD',
          xaf_rate: 0,
          last_updated: new Date(),
          created_by: '',
        },
      ];
      const rates = await this.fetchAll(
        (currencies.length > 0 ? currencies : initialCurrencies).map(
          (_) => _.currency
        )
      );
      const conversionRates = await this.convertRates(rates);
      if (currencies.length > 0)
        await this.prismaService.$transaction(
          initialCurrencies.map(({ currency }) =>
            this.prismaService.supportedCurrency.update({
              data: {
                xaf_rate: conversionRates.find((_) => _.code === currency)
                  ?.value,
              },
              where: { currency },
            })
          )
        );
      else
        await this.prismaService.supportedCurrency.createMany({
          data: initialCurrencies.map(
            ({ currency: currency_acronym, ...currency }) => ({
              ...currency,
              currency: currency_acronym,
              xaf_rate:
                conversionRates.find((_) => _.code === currency_acronym)
                  ?.value ?? 0,
              created_by: admin.person_has_role_id,
            })
          ),
          skipDuplicates: true,
        });
      this.logger.log('Successfully fetched currencies from fastforex.com...');
    } catch (error) {
      this.logger.error(
        error.response?.data.error ??
          `Could not fetch currencies from api.fastforex.io`
      );
    }
  }

  async findUnsupported(): Promise<ForexCurrencyEntity[]> {
    const supportedCurrencies = await this.findAll();
    const resp = await this.httpService.axiosRef.get<{
      currencies: Record<string, string>;
      ms: number;
    }>(`/currencies`);
    return Object.entries(resp.data.currencies)
      .map(([currency, currency_name]) => ({
        currency,
        currency_name,
      }))
      .filter(
        (_) => !supportedCurrencies.find((sc) => sc.currency === _.currency)
      );
  }

  /**
   * Add new supported currencies to platform
   * @param newCurrencies currencies to be added
   * @param created_by the person add the new currencies
   */
  async addMany(newCurrencies: ForexCurrencyEntity[], created_by: string) {
    const currencies = await this.fetchAll(
      newCurrencies.map((_) => _.currency)
    );
    const conversionRates = await this.convertRates(currencies);
    await this.prismaService.supportedCurrency.createMany({
      data: newCurrencies.map(
        ({ currency: currency_acronym, ...currency }) => ({
          ...currency,
          created_by,
          currency: currency_acronym,
          xaf_rate:
            conversionRates.find((_) => _.code === currency_acronym)?.value ??
            0,
          last_updated: new Date(),
        })
      ),
      skipDuplicates: true,
    });
  }

  async updateCurrencyState(
    currencyId: string,
    activate: boolean,
    createdBy: string
  ) {
    const currency = await this.prismaService.supportedCurrency.findFirst({
      select: {
        xaf_rate: true,
        currency: true,
        last_updated: true,
        is_active: true,
      },
      where: { supported_currency_id: currencyId, is_active: !activate },
    });
    if (!currency) throw new NotFoundException();
    await this.prismaService.supportedCurrency.update({
      data: {
        is_active: activate,
        SupportedCurrencyAudits: {
          create: {
            ...currency,
            audited_by: createdBy,
          },
        },
      },
      where: { supported_currency_id: currencyId },
    });
  }

  async updateCurrenciesState(
    currencyIds: string[],
    activate: boolean,
    created_by: string
  ) {
    const currencies = await this.prismaService.supportedCurrency.findMany({
      select: {
        xaf_rate: true,
        currency: true,
        last_updated: true,
        is_active: true,
        supported_currency_id: true,
      },
      where: {
        supported_currency_id: { in: currencyIds },
        is_active: !activate,
      },
    });
    await this.prismaService.$transaction([
      this.prismaService.supportedCurrency.updateMany({
        data: { is_active: activate },
        where: { supported_currency_id: { in: currencyIds } },
      }),
      this.prismaService.supportedCurrencyAudit.createMany({
        data: currencies.map((currency) => ({
          ...currency,
          audited_by: created_by,
        })),
      }),
    ]);
  }

  private async fetchAll(currencies: string[]) {
    const { data } = await this.httpService.axiosRef.get<ICurrencyRate>(
      `/fetch-multi`,
      {
        params: {
          from: 'XAF',
          to: currencies.reduce(
            (codes, code, i) =>
              codes.concat(code, i < currencies.length - 1 ? ',' : ''),
            ''
          ),
        },
      }
    );
    return data.results;
  }

  /**
   * convert from `1 XAF = x Currency`  to `1 Currency = x XAF` format
   * @param rates payload returned by the `fetchAll` API
   * @returns an array of converted `Rate` where `Rate` is an object of two properties `code` and `value`
   */
  private async convertRates(rates: Rates): Promise<Rate[]> {
    // const { bonus_percentage } =
    //   await this.prismaService.platformSetting.findFirst();
    const bonus_percentage = 0;
    return Object.keys(rates).map((code) => {
      const value = rates[code];
      const rate = Number(1 / value);
      return {
        code,
        value: roundNumber(rate + (bonus_percentage * rate) / 100),
      };
    });
  }
}
