'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import {
  GetTransactionsQueryParams,
  TransactionService,
} from '../services/TransactionService';
import {
  CybridTransactionEntity,
  InitiateTransferDto,
} from '../types/TransactionTypes';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const transactionService = new TransactionService(apiClient);

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
