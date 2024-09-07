import {
  ApiHideProperty,
  ApiProperty,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsISO8601, IsString } from 'class-validator';
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
  subdomain: string | null;

  @Exclude()
  @ApiHideProperty()
  is_active: boolean;

  @IsISO8601()
  @ApiProperty()
  created_at: Date;

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

export class UpdateProfileDto extends PartialType(Profile) {}
