import { plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsFQDN,
  IsHexadecimal,
  IsNumber,
  IsPort,
  IsString,
  IsStrongPassword,
  IsUrl,
  IsUUID,
  validateSync
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
  CYBRID_API_BASE_URL: string;
  
  @IsUrl()
  CYBRID_BANK_LEVEL_TOKEN_ENDPOINT: string;

  @IsUrl()
  CYBRID_CUSTOMER_LEVEL_TOKEN_ENDPOINT: string;

  @IsHexadecimal()
  CYBRID_WEBHOOK_SIGNING_KEY: string;

  @IsFQDN()
  SMTP_HOST: string;

  @IsPort()
  SMTP_PORT: string;

  @IsString()
  APP_EMAIL_PASS: string;

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
  PEEX_API_BASE_URL: string

  @IsUUID()
  PEEX_SECRETKEY: string

  @IsString()
  PEEX_USERNAME: string;
  
  @IsString()
  PEEX_PASSWORD: string;

  @IsEmail({}, {
    each: true,
    message: 'Each item in PILOT_USER_EMAILS must be a valid email address.'
  })
  PILOT_USER_EMAILS: string[]
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
