import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsISO8601,
  IsOptional,
  IsPhoneNumber,
  IsString
} from 'class-validator';
import { SignUpDto } from '../../app/auth/auth.dto';

export class UserEntity extends OmitType(SignUpDto, ['country']) {
  @Exclude({ toPlainOnly: true })
  @ApiHideProperty()
  password: string;

  @IsString()
  @ApiProperty()
  user_id: string;

  @Exclude()
  @ApiHideProperty()
  person_id: string;

  @Exclude()
  @ApiHideProperty()
  is_active: boolean;

  @IsISO8601()
  @ApiProperty()
  created_at: Date;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  cybrid_verified?: boolean;

  constructor(props: UserEntity) {
    super(props);
    Object.assign(this, props);
  }
}

export class Profile extends PickType(UserEntity, [
  'gender',
  'last_name',
  'first_name',
  'phone_number',
  'preferred_language',
]) {}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'User first name (editable only if not cybrid verified)',
    required: false,
  })
  first_name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'User last name (editable only if not cybrid verified)',
    required: false,
  })
  last_name?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({
    description: 'User email address (always editable)',
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  @ApiProperty({
    description: 'User phone number (always editable)',
    required: false,
  })
  phone_number?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    description: 'User date of birth (editable only if not cybrid verified)',
    required: false,
  })
  birthdate?: string;

  constructor(props: UpdateProfileDto) {
    Object.assign(this, props);
  }
}
