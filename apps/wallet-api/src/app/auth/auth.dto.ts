import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  CybridSupportedCountry,
  PersonGender,
  PreferredLanguage,
} from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUUID,
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

  @IsOptional()
  @IsPhoneNumber()
  @ApiProperty({
    description: 'Valid user phone number',
  })
  phone_number: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ description: 'User date of birth' })
  birthdate: Date;

  @IsOptional()
  @IsEnum(PersonGender)
  @ApiProperty({
    description: 'User gender',
    enum: PersonGender,
    example: PersonGender.MALE,
  })
  gender: PersonGender;

  @IsOptional()
  @IsEnum(PreferredLanguage)
  @ApiProperty({ enum: PreferredLanguage })
  preferred_language: PreferredLanguage = PreferredLanguage.EN_US;

  constructor(props: SignUpDto) {
    super(props);
    Object.assign(this, props);
  }
}

export class RequestOTPDto extends PickType(SignInDto, ['email']) {}

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

export class VerifyOtpDto {
  @IsUUID()
  @ApiProperty({
    description: 'Verified One time password ID',
  })
  otp_id: string;

  constructor(props: VerifyOtpDto) {
    Object.assign(this, props);
  }
}

export class AuthTokensDto {
  @IsString()
  access_token: string;

  @IsString()
  refresh_token: string;

  constructor(props: AuthTokensDto) {
    Object.assign(this, props);
  }
}
