'use client';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { toast } from 'sonner';
import { useVerifyEmail } from '../../api/hooks/useAuth';
import { useUserProfile } from '../../api/hooks/useUser';
import OTPBottomSheet from '../../components/auth/forgot-password/OTPBottomSheet';
import { errorHandling } from '../../components/shared/errorHandling';
import { ApiClient } from '../../api/services/ApiClient';
import { API_BASE_URL } from '../../api/constants';

interface IEmailVerificationState {
  isBottomSheetOpen: boolean;
  otpId?: string;
}

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { formatMessage } = useIntl();
  const { data: user, isFetched } = useUserProfile();

  const [emailVerificationState, setEmailVerificationState] =
    useState<IEmailVerificationState>({
      isBottomSheetOpen: false,
    });

  useEffect(() => {
    if (isFetched && !user?.is_verified) {
      const apiClient = ApiClient.getInstance(API_BASE_URL);
      const authToken = apiClient.getAuthToken();
      setEmailVerificationState({
        isBottomSheetOpen: true,
        otpId: authToken?.otp_id,
      });
    }
  }, [isFetched, user?.is_verified]);

  // set up verify email bottom sheet if the user has an unverified email
  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();
  function submitOTP(otp?: string) {
    if (!otp)
      return setEmailVerificationState((prev) => ({
        ...prev,
        isBottomSheetOpen: false,
      }));

    verifyEmail(
      { code: otp },
      {
        onSuccess: () => {
          toast.success(formatMessage({ id: 'emailVerified' }));
          setEmailVerificationState({
            isBottomSheetOpen: false,
          });
        },
        onError: (error) => {
          errorHandling({ error, formatMessage });
          setEmailVerificationState((prev) => ({
            ...prev,
            isBottomSheetOpen: true,
          }));
        },
      }
    );
  }
  return (
    <>
      <OTPBottomSheet
        otpId={emailVerificationState.otpId}
        isOpen={emailVerificationState.isBottomSheetOpen}
        isSubmitting={isVerifyingEmail}
        closeBottomSheet={submitOTP}
        confirmText={formatMessage({ id: 'confirmEmail' })}
        description={formatMessage({ id: 'confirmEmailDescription' })}
        title={formatMessage({ id: 'confirmEmail' })}
      />
      {children}
    </>
  );
}
