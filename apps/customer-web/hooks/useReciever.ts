'use client';

import { ApiClient } from '../api/services/ApiClient';
import { ReceiverService } from '../api/services/ReceiverService';
import { ReceiverEntity } from '../api/types';
import { useQuery } from '@tanstack/react-query';

const apiClient = new ApiClient(process.env.API_BASE_URL || 'https://api.xafpay.com');
const receiverService = new ReceiverService(apiClient);

/**
 * Hook for fetching receivers.
 */
export const useReceivers = (search?: string) =>
  useQuery<ReceiverEntity[], Error>({
    queryKey: ['receivers', search],
    queryFn: () => receiverService.findReceivers(search),
  });
