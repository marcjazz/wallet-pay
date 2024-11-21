import { SetMetadata } from '@nestjs/common';

export enum RoleEnum {
  CLIENT = 'client',
  ADMIN = 'admin',
}

export enum MetadataEnum {
  ROLES = 'roles',
  IS_PUBLIC = 'isPublic',
}

export const SkipAuth = (bool = true) =>
  SetMetadata(MetadataEnum.IS_PUBLIC, bool);

export const Roles = (...roles: RoleEnum[]) =>
  SetMetadata(MetadataEnum.ROLES, roles);
