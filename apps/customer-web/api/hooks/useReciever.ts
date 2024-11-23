'use client';

import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { ReceiverService } from '../services/ReceiverService';
import { ReceiverEntity } from '../types';

//TODO: REMOVE LOCAL LINK
const apiClient = ApiClient.getInstance(API_BASE_URL);
const receiverService = new ReceiverService(apiClient);

/**
 * Hook for fetching receivers.
 */
export const useReceivers = (search?: string) =>
  useQuery<ReceiverEntity[], Error>({
    queryKey: ['receivers', search],
    queryFn: () => receiverService.findReceivers(search),
  });
