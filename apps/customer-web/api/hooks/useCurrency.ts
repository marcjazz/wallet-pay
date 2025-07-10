import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { CurrencyService } from '../services/CurrencyService';
import { CurrencyEntity } from '../types';
import { errorHandling } from '../../components/shared/errorHandling';
import { useIntl } from 'react-intl';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const currencyService = new CurrencyService(apiClient);

/**
 * Hook for fetching all Cybrid accounts.
 */
export const useCurrencies = () => {
  const { formatMessage } = useIntl();
  const tt = useQuery<CurrencyEntity[], Error>({
    queryKey: ['supportedCurrencies'],
    queryFn: () => currencyService.getCurrencies(true),
    initialData: [],
  });
  const { isError, error } = tt;
  if (isError) errorHandling({ error, formatMessage });
  return tt;
};
