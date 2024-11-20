import { ApiClient } from './ApiClient';
import {
  InitiateTransferDto,
  CybridTransactionEntity,
} from '../types';

/**
 * Service for transaction-related API calls.
 */
export class TransactionService {
  constructor(private apiClient: ApiClient) {}

  async initiateTransfer(
    payload: InitiateTransferDto
  ): Promise<CybridTransactionEntity> {
    return this.apiClient.post<CybridTransactionEntity>(
      '/api/v1/transactions/initiate',
      payload
    );
  }
}
