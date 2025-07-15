'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { toast } from 'sonner';
import { errorHandling } from '../../components/shared/errorHandling';
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
  WorkflowEntity,
} from '../types/AccountTypes';
import { VerificationStatus } from '../types/EnumTypes';
import axios from 'axios';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const accountsService = new AccountService(apiClient);

/**
 * Hook for fetching all Cybrid accounts.
 */
export const useCybridAccounts = () => {
  const { formatMessage } = useIntl();
  const tt = useQuery<CybridAccountEntity[], Error>({
    queryKey: ['cybridAccounts'],
    queryFn: () => accountsService.findAll(),
    initialData: [],
  });
  const { isError, error } = tt;

  let isVerified = true;
  if (
    error &&
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response.data?.message?.includes('Unverified email!')
  ) {
    isVerified = false;
  }

  if (isError) errorHandling({ error, formatMessage });

  return { ...tt, isVerified };
};

/**
 * Hook for fetching all external bank accounts.
 */
export const useExternalAccounts = (
  verificationStatus?: VerificationStatus
) => {
  const { formatMessage } = useIntl();
  const tt = useQuery<ExternalBankAccountEntity[], Error>({
    queryKey: ['externalAccounts', verificationStatus],
    queryFn: () => accountsService.findAllExternals(verificationStatus),
    initialData: [],
  });
  const { isError, error } = tt;
  if (isError) errorHandling({ error, formatMessage });
  return tt;
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
 * Hook for fetching  identity verification.
 */
export const useGetIdentityVerification = (
  identityVerificationGuid: string
) => {
  return useQuery<IdentityVerificationEntity, Error>({
    queryKey: ['getIdentityVerification', identityVerificationGuid],
    queryFn: () =>
      accountsService.getIdentityVerification(identityVerificationGuid),
    enabled: !!identityVerificationGuid,
  });
};

/**
 * Hook for initializing a Plaid connection workflow.
 */
export const useCreateWorkflow = () => {
  return useMutation<WorkflowEntity, Error, CreateWorkflowDto>({
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
