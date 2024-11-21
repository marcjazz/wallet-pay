'use client';

import { ApiClient } from '@/api/services/ApiClient';
import {
  GetTransactionsQueryParams,
  TransactionService,
} from '@/api/services/TransactionService';
import {
  CybridTransactionEntity,
  InitiateTransferDto,
} from '@/api/types/TransactionTypes';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

const transactionService = new TransactionService(
  new ApiClient(process.env.API_BASE_URL || 'https://api.xafpay.com')
);

/**
 * Hook for fetching transactions with optional filters and sorting.
 * @param params Query parameters for filtering and sorting transactions.
 */
export const useTransactions = (params?: GetTransactionsQueryParams) => {
  return useQuery<CybridTransactionEntity[], Error>({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.findTransactions(params),
    placeholderData: keepPreviousData, // Retains data during pagination or query updates.
  });
};

/**
 * Hook for initiating a transfer.
 */
export const useInitiateTransfer = () => {
  return useMutation<CybridTransactionEntity, Error, InitiateTransferDto>({
    mutationKey: ['initiateTransfer'],
    mutationFn: (payload) => transactionService.initiateTransfer(payload),
  });
};
