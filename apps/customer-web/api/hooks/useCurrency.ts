import { useQuery } from '@tanstack/react-query';
import { API_BASE_URL } from '../constants';
import { ApiClient } from '../services/ApiClient';
import { CurrencyService } from '../services/CurrencyService';
import { CurrencyEntity } from '../types';

const apiClient = ApiClient.getInstance(API_BASE_URL);
const currencyService = new CurrencyService(apiClient);

/**
 * Hook for fetching all Cybrid accounts.
 */
export const useCurrencies = () => {
  const tt = useQuery<CurrencyEntity[], Error>({
    queryKey: ['supportedCurrencies'],
    queryFn: () => currencyService.getCurrencies(true),
    initialData: [],
  });
  const { isError, error } = tt;
  //TODO: USE alert in case of error. will be replaced with proper notifications later
  if (isError) alert(error.message);
  return tt;
};
