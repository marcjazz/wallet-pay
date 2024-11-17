import { SearchQueryDto } from '../../app/app.dto';
import { PrismaService } from '../../prisma/prisma.service';

export class CounterpartiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query?: SearchQueryDto) {
    return this.prismaService.cybridCounterparty.findMany({
      where: {
        OR: [
          { fullname: { search: query?.search } },
          { phone_number: { search: query?.search } },
          { national_id_number: { search: query?.search } },
        ],
      },
    });
  }

  async findOne(counterpartyId: string) {
    return this.prismaService.cybridCounterparty.findUnique({
      where: { cybrid_counterparty_id: counterpartyId },
    });
  }
}
