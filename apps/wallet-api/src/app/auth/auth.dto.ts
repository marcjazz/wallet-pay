import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import {
  CybridSupportedCountry,
  PersonGender,
  PreferredLanguage,
} from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
  Length,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ApiProperty({
    description: 'Valid user email',
  })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Strong password',
  })
  password: string;

  constructor(props: SignInDto) {
    Object.assign(this, props);
  }
}

export class SignUpDto extends SignInDto {
  @IsEnum(CybridSupportedCountry)
  @ApiProperty({ enum: CybridSupportedCountry })
  country: CybridSupportedCountry;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty({
    description: 'User first name',
  })
  first_name: string;

  @IsString()
  @ApiProperty({
    description: 'User last name',
  })
  last_name: string;

  @IsPhoneNumber()
  @ApiProperty({
    description: 'Valid user phone number',
  })
  phone_number: string;

  @IsDateString()
  @ApiProperty({ description: 'User date of birth' })
  birthdate: Date;

  @IsEnum(PersonGender)
  @ApiProperty({
    description: 'User gender',
    enum: PersonGender,
    example: PersonGender.MALE,
  })
  gender: PersonGender;

  @IsOptional()
  @IsEnum(PreferredLanguage)
  @ApiProperty({ enum: PreferredLanguage, default: PreferredLanguage.EN_US })
  preferred_language: PreferredLanguage = PreferredLanguage.EN_US;

  constructor(props: SignUpDto) {
    super(props);
    Object.assign(this, props);
  }
}

export class ForgotPasswordDto extends PickType(SignInDto, ['email']) {}
export class ResetPasswordDto {
  @IsString()
  @ApiProperty()
  otp_id: string;

  @Length(5)
  @ApiProperty()
  @IsNumberString()
  otp_code: string;

  @ApiProperty()
  @IsStrongPassword()
  new_password: string;

  constructor(props: ResetPasswordDto) {
    Object.assign(this, props);
  }
}

export class ChangePasswordDto {
  @IsUUID()
  @ApiProperty({
    description: 'Verified One time password ID',
  })
  otp_id: string;

  @IsString()
  @ApiProperty({
    description: 'New password. It must be a strong password',
  })
  @IsStrongPassword()
  new_password: string;

  constructor(props: ChangePasswordDto) {
    Object.assign(this, props);
  }
}

export class AuthTokensDto {
  @IsJWT()
  @IsString()
  @ApiProperty()
  access_token: string;

  @IsJWT()
  @IsString()
  @ApiProperty()
  refresh_token: string;

  @ApiProperty({ type: Number, description: 'Issuance date in milliseconds' })
  issued_at: number;

  constructor(props: AuthTokensDto) {
    Object.assign(this, props);
  }
}

export class AccessTokenResponse extends OmitType(AuthTokensDto, [
  'refresh_token',
]) {
  @ApiProperty({ description: 'token duration in milliseconds' })
  expires_in: number;

  @ApiProperty({ type: 'Bearer' })
  token_type = 'Bearer' as const;

  constructor(props: AccessTokenResponse) {
    super(props);
    Object.assign(this, props);
  }
}
