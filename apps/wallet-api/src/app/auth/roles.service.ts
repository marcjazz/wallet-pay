import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create({
    created_by,
    ...payload
  }: Prisma.RoleCreateManyInput): Promise<Role> {
    return this.prismaService.role.create({
      data: {
        ...payload,
        CreatedBy: { connect: { person_has_role_id: created_by } },
      },
    });
  }

  async findOne(roleId: string): Promise<Role | null> {
    return this.prismaService.role.findUnique({ where: { role_id: roleId } });
  }

  async findByTitleAndSubdomain(
    title: string,
    subdomain: string
  ): Promise<Role | null> {
    return this.prismaService.role.findUnique({ where: { title, subdomain } });
  }
}
