import axios from 'axios';
import { toast } from 'react-toastify';

export function errorHandling({
  error,
  formatMessage,
  redirect,
}: {
  error: unknown;
  formatMessage: (message: { id: string }) => string;
  redirect?: (link: string) => void;
}) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      toast.error(formatMessage({ id: message ?? 'unauthorized' }));
      if (redirect) redirect('/login');
    }
    if (status === 409) {
      toast.error(formatMessage({ id: message ?? 'conflict' }));
    }
    if (status === 500) {
      toast.error(formatMessage({ id: 'serverError' }));
    }
    if (status === 404) {
      toast.error(formatMessage({ id: message ?? 'notFound' }));
    }
    if (status === 403) {
      toast.error(formatMessage({ id: message ?? 'forbidden' }));
      if (redirect) redirect('/login');
    }
    if (status === 400) {
      toast.error(formatMessage({ id: message ?? 'badRequest' }));
    }
    if (status === 422) {
      // TODO: remove this after launch
      if (message.includes('pilot active')) {
        alert(message);
      }
      toast.error(formatMessage({ id: message ?? 'unprocessableEntity' }));
    }
    if (status === 429) {
      toast.error(formatMessage({ id: message ?? 'tooManyRequests' }));
    }
    if (status === 503) {
      toast.error(formatMessage({ id: message ?? 'serviceUnavailable' }));
    }
    if (status === 504) {
      toast.error(formatMessage({ id: message ?? 'gatewayTimeout' }));
    }
  } else toast.error(formatMessage({ id: 'networkError' }));
}
