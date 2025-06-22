'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { ReceiverService } from '../services/ReceiverService';
import { CreateReceiverDto, ReceiverEntity } from '../types';
import { useIntl } from 'react-intl';
import { errorHandling } from '../../components/shared/errorHandling';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const receiverService = new ReceiverService(apiClient);

/**
 * Hook for fetching receivers.
 */
export const useReceivers = (search?: string) => {
  const { formatMessage } = useIntl();

  const tt = useQuery<ReceiverEntity[], Error>({
    queryKey: ['receivers'],
    queryFn: () => receiverService.findReceivers(search),

    initialData: [],
  });
  const { isError, error } = tt;
  if (isError) errorHandling({ error, formatMessage });
  return tt;
};

/**
 * Hook for fetching a specific receiver by its ID.
 */
export const useReceiver = (id: string) => {
  const { formatMessage } = useIntl();

  const tt = useQuery<ReceiverEntity, Error>({
    queryKey: ['receiver', id],
    enabled: !!id,
    queryFn: () => receiverService.findReceiverById(id),
  });
  const { isError, error } = tt;
  if (isError) errorHandling({ error, formatMessage });

  return tt;
};

/**
 * Hook for creating a new receiver.
 */
export const useCreateReceiver = () => {
  const tt = useMutation<ReceiverEntity, Error, CreateReceiverDto>({
    mutationKey: ['createReceiver'],
    mutationFn: (receiverData: CreateReceiverDto) =>
      receiverService.createReceiver(receiverData),
  });
  const { isError, error } = tt;
  if (isError) console.error(error);
  return tt;
};
