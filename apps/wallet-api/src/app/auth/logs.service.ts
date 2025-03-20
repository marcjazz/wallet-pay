import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Log, Prisma } from '@prisma/client';

@Injectable()
export class LogsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create({
    person_has_role_id,
    ...payload
  }: Prisma.LogCreateManyInput): Promise<Log> {
    return this.prismaService.log.create({
      data: { ...payload, PersonHasRole: { connect: { person_has_role_id } },  },
    });
  }

  /**
   * Invalidates a refresh token
   * @param identifier log or user ID, or refresh token
   */
  async invalidate(identifier: string) {
    await this.prismaService.log.update({
      where: { log_id: identifier },
      data: { logout_at: new Date() },
    });
  }

  async findOne(logId: string): Promise<Log | null> {
    return this.prismaService.log.findUnique({ where: { log_id: logId } });
  }
}
