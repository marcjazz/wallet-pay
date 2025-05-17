'use client';

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import {
  GetTransactionsQueryParams,
  TransactionService,
} from '../services/TransactionService';
import { TransactionType } from '../types';
import {
  CybridTransactionEntity,
  InitiateFundingTransferDto,
  InitiateRemittanceTransferDto,
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
    queryFn: () => {
      return transactionService
        .findTransactions({
          ...params,
          transaction_types: [
            TransactionType.FUNDING,
            TransactionType.INSTANT_FUNDING,
            TransactionType.REMITTANCE,
          ],
        })
        .then((transactions) => {
          return transactions.map((transaction) => {
            return {
              ...transaction,
              // TODO: hardcoded because we endure the fees for now.
              fees: 0,
            };
          });
        });
    },
    initialData: [],
    placeholderData: keepPreviousData, // Retains data during pagination or query updates.
  });
};

/**
 * Hook for initiating a transfer.
 */
export const useInitiateFunding = () => {
  return useMutation<
    CybridTransactionEntity,
    Error,
    InitiateFundingTransferDto
  >({
    mutationKey: ['initiateTransfer'],
    mutationFn: (payload) => transactionService.initiateAccountFunding(payload),
  });
};

/**
 * Hook for initiating a transfer.
 */
export const useInitiateRemittance = () => {
  return useMutation<
    CybridTransactionEntity,
    Error,
    InitiateRemittanceTransferDto
  >({
    mutationKey: ['initiateFunding'],
    mutationFn: (payload) => transactionService.initiateRemittance(payload),
  });
};

/**
 * Hook for fetching a specific transaction by its ID.
 * @param id Unique ID of the transaction.
 */
export const useTransaction = (id: string) => {
  const tt = useQuery<CybridTransactionEntity, Error>({
    queryKey: ['transaction', id],
    queryFn: () =>
      transactionService.findTransactionById(id).then((transaction) => {
        return {
          ...transaction,
          // TODO: hardcoded because we endure the fees for now.
          fees: 0,
        };
      }),
  });
  const { isError, error } = tt;
  // TODO: Use alert in case of error. Will be replaced with proper notifications later.
  if (isError) alert(error.message);

  return tt;
};
