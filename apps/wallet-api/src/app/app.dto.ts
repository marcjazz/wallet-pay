import { WorkflowBankModel } from '@cybrid/cybrid-api-bank-typescript';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatedWorkFlowDto implements WorkflowBankModel {
  @ApiPropertyOptional()
  guid?: string;

  @ApiPropertyOptional({ nullable: true })
  bank_guid?: string | null;

  @ApiPropertyOptional({ nullable: true })
  customer_guid?: string | null;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiPropertyOptional({ nullable: true })
  failure_code?: string | null;

  @ApiPropertyOptional()
  created_at?: string;

  @ApiPropertyOptional()
  updated_at?: string;

  constructor(props: CreatedWorkFlowDto) {
    Object.assign(this, props);
  }
}
