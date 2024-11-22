'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { AccountService } from '../api/services/AccountService';
import {
  CybridAccountEntity,
  ExternalBankAccountEntity,
  VerifyCybridAccountDto,
  IdentityVerificationEntity,
  CreateWorkflowDto,
  CreateExternalAccountDto,
} from '../api/types/AccountTypes';
import { ApiClient } from '../api/services/ApiClient';

const accountsService = new AccountService(
  new ApiClient(process.env.API_BASE_URL || 'https://api.xafpay.com')
);

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
