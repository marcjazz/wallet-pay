import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';


export class SearchQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  constructor(props: SearchQueryDto) {
    Object.assign(this, props);
  }
}