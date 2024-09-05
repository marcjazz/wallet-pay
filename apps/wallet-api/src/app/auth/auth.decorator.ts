import { SetMetadata } from '@nestjs/common';

export enum RoleEnum {
  CLIENT = 'client',
}

export enum MetadataEnum {
  ROLES = 'roles',
  IS_PUBLIC = 'isPublic',
}

export const IsPublic = () => SetMetadata(MetadataEnum.IS_PUBLIC, true);

export const Roles = (...roles: RoleEnum[]) =>
  SetMetadata(MetadataEnum.ROLES, roles);
