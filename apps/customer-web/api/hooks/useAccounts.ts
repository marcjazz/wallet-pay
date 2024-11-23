'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { AccountService } from '../services/AccountService';
import { ApiClient } from '../services/ApiClient';
import {
  CreateExternalAccountDto,
  CreateWorkflowDto,
  CybridAccountEntity,
  ExternalBankAccountEntity,
  IdentityVerificationEntity,
  VerifyCybridAccountDto,
} from '../types/AccountTypes';

//TODO: REMOVE LOCAL LINK
const apiClient = ApiClient.getInstance(API_BASE_URL);
const accountsService = new AccountService(apiClient);

/**
 * Hook for fetching all Cybrid accounts.
 */
export const useCybridAccounts = () => {
  return useQuery<CybridAccountEntity[], Error>({
    queryKey: ['cybridAccounts'],
    queryFn: () => accountsService.findAll(),
  });
};

/**
 * Hook for fetching all external bank accounts.
 */
export const useExternalAccounts = () => {
  return useQuery<ExternalBankAccountEntity[], Error>({
    queryKey: ['externalAccounts'],
    queryFn: () => accountsService.findAllExternals(),
  });
};

/**
 * Hook for verifying an account.
 */
export const useVerifyAccount = () => {
  return useMutation<IdentityVerificationEntity, Error, VerifyCybridAccountDto>(
    {
      mutationKey: ['verifyAccount'],
      mutationFn: (payload) => accountsService.verifyAccount(payload),
    }
  );
};

/**
 * Hook for initializing a Plaid connection workflow.
 */
export const useCreateWorkflow = () => {
  return useMutation<void, Error, CreateWorkflowDto>({
    mutationKey: ['createWorkflow'],
    mutationFn: (payload) => accountsService.createWorkflow(payload),
  });
};

/**
 * Hook for creating a new external bank account.
 */
export const useCreateExternalAccount = () => {
  return useMutation<
    ExternalBankAccountEntity,
    Error,
    CreateExternalAccountDto
  >({
    mutationKey: ['createExternalAccount'],
    mutationFn: (payload) => accountsService.createExternalAccount(payload),
  });
};
