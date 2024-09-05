import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { PreferredLanguage } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID } from 'class-validator';
import { randomUUID } from 'crypto';
import { SignUpDto } from '../../app/auth/auth.dto';

export class PersonEntity extends OmitType(SignUpDto, ['password']) {
  @IsUUID()
  @ApiProperty({
    description: 'User person id',
    example: randomUUID(),
  })
  person_id: string;

  @IsEnum(PreferredLanguage)
  @ApiProperty({
    description: 'User preffered language.',
    default: 'en',
    enum: PreferredLanguage,
  })
  preferred_language: PreferredLanguage;

  @IsNumber()
  @ApiProperty({
    description: 'Account creation datetime in milleseconds.',
    example: Date.now(),
  })
  created_at: number;
}

export class Profile extends PickType(PersonEntity, [
  'email',
  'gender',
  'country',
  'phone_number',
  'preferred_language',
]) {}

export class UpdateProfileDto extends PartialType(Profile) {}
