import { VerificationStatus } from '../types';
import { useGetIdentityVerification } from './useAccounts';

export function usePoolIdentityVerification(
  identityVerificationGuid: string,
  changeDispatcher: (status: VerificationStatus) => void,
  delay: number
) {
  const { data, refetch: getIdentityVerification } = useGetIdentityVerification(
    identityVerificationGuid
  );

  const pool = setInterval(() => {
    if (data) {
      if (['FAILED', 'COMPLETED'].includes(data?.state as string)) {
        clearInterval(pool);
      } else if (data?.persona_hosted_link) {
        const url = encodeURI(
          `${data.persona_hosted_link}?redirect_uri=${window.location.href}`
        );
        window.open(url, '_self');
      }

      changeDispatcher(data.state);
    }

    // fetch again
    getIdentityVerification();
  }, delay);

  return pool;
}