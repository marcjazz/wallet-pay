import { ApiClient } from './ApiClient';
import {
  InitiateTransferDto,
  CybridTransactionEntity,
  TransactionStatus,
} from '../types';

export interface GetTransactionsQueryParams {
  /** Search term for filtering transactions. */
  search?: string;
  /** Filter by transaction status. */
  status?: TransactionStatus;
  /** Field to sort transactions by. */
  order_by?: 'date' | 'amount';
  /** Direction of sorting (ascending or descending). */
  order_direction?: 'asc' | 'desc';
}

/**
 * Service for transaction-related API calls.
 */
export class TransactionService {
  constructor(private apiClient: ApiClient) {}

  async initiateAccountFunding(
    payload: InitiateTransferDto
  ): Promise<CybridTransactionEntity> {
    return this.apiClient.post<CybridTransactionEntity>(
      '/api/v1/transactions/fund',
      payload
    );
  }

  async initiateRemittance(
    payload: InitiateTransferDto
  ): Promise<CybridTransactionEntity> {
    return this.apiClient.post<CybridTransactionEntity>(
      '/api/v1/transactions/remit',
      payload
    );
  }


  /**
   * Fetch all transactions with optional query parameters.
   * @param params Optional query parameters for filtering and sorting.
   * @returns Array of transactions.
   */
  async findTransactions(
    params?: GetTransactionsQueryParams
  ): Promise<CybridTransactionEntity[]> {
    return this.apiClient.get<CybridTransactionEntity[]>(
      '/api/v1/transactions',
      params ? { ...params } : {}
    );
  }
}
