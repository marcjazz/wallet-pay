import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsFQDN,
  IsHexadecimal,
  IsIP,
  IsJWT,
  IsNumber,
  IsPort,
  IsString,
  IsStrongPassword,
  IsUrl,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsPort()
  PORT: string;

  @IsNumber()
  SALT_ROUNDS: number;

  @IsStrongPassword()
  JWT_SECRET: string;

  @IsString()
  POSTGRES_PASSWORD: string;

  @IsString()
  POSTGRES_USER: string;

  @IsString()
  POSTGRES_DB: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  CYBRID_CLIENT_ID: string;

  @IsString()
  CYBRID_CLIENT_SECRET: string;

  @IsHexadecimal()
  CYBRID_BANK_GUID: string;

  @IsHexadecimal()
  CYBRID_ORGANIZATION_GUID: string;

  @IsHexadecimal()
  CYBRID_BANK_FIAT_ACCOUNT_GUID: string;

  @IsHexadecimal()
  CYBRID_BANK_TRADING_ACCOUNT_GUID: string;

  @IsHexadecimal()
  CYBRID_BANK_EXTERNAL_WALLET_GUID: string;

  @IsUrl()
  CYBRID_BANK_LEVEL_TOKEN_ENDPOINT: string;

  @IsUrl()
  CYBRID_CUSTOMER_LEVEL_TOKEN_ENDPOINT: string;

  @IsHexadecimal()
  CYBRID_WEBHOOK_SIGNING_KEY: string;

  @IsFQDN()
  EMAIL_HOST: string;

  @IsString()
  EMAIL_PASS: string;

  @IsEmail({ allow_display_name: true })
  APP_EMAIL: string;

  @IsString()
  REDIS_HOST: string;

  @IsPort()
  REDIS_PORT: string;

  @IsUrl()
  RATE_API_URL: string;

  @IsString()
  RATE_API_KEY: string;

  @IsUrl()
  PAWAPAY_API_BASE_URL: string;

  @IsJWT()
  PAWAPAY_API_BEARER_TOKEN: string;

  // @IsString()
  // PRIVATE_KEY_ID: string;

  @IsString()
  MOMO_API_BASE_URL: string;

  @IsString()
  MOMO_REMITTANCE_API_USER: string;

  @IsString()
  MOMO_REMITTANCE_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
