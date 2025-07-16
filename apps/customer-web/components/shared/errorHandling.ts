import axios from 'axios';
import { toast } from 'sonner';

export function errorHandling({
  error,
  formatMessage,
}: {
  error: unknown;
  formatMessage: (message: { id: string }) => string;
  redirect?: (link: string) => void;
}) {
  const statusHandler: Record<number, (message: string) => void> = {
    401: (message) =>
      toast.error(formatMessage({ id: message ?? 'unauthorized' })),
    409: (message) => toast.error(formatMessage({ id: message ?? 'conflict' })),
    500: () => toast.error(formatMessage({ id: 'serverError' })),
    404: (message) => toast.error(formatMessage({ id: message ?? 'notFound' })),
    403: (message) => {
      if (message?.includes('Platform not available')) {
        toast.warning(formatMessage({ id: message ?? 'forbidden' }), {
          description: message,
        });
        return;
      }
      toast.error(formatMessage({ id: message ?? 'forbidden' }), {
        description: message,
        closeButton: true,
      });
    },
    400: (message) =>
      toast.error(formatMessage({ id: message ?? 'badRequest' })),
    422: (message) =>
      toast.error(formatMessage({ id: message ?? 'unprocessableEntity' })),
    429: (message) =>
      toast.error(formatMessage({ id: message ?? 'tooManyRequests' })),
    503: (message) =>
      toast.error(formatMessage({ id: message ?? 'serviceUnavailable' })),
    504: (message) =>
      toast.error(formatMessage({ id: message ?? 'gatewayTimeout' })),
  };

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status && statusHandler[status]) {
      if (status === 403 && !toast.getToasts().some((t) => t.id === message)) {
        statusHandler[status](message);
        return;
      }
      statusHandler[status](message);
    } else {
      toast.error(formatMessage({ id: message ?? 'serverError' }));
    }
  } else if (error instanceof Error) {
    toast.error(formatMessage({ id: error.message }));
  } else toast.error(formatMessage({ id: 'networkError' }));
}
