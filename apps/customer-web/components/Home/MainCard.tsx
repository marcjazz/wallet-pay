import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight as ArrowUpRightIcon,
  ChevronDown as ChevronDownIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';

import {
  useCybridAccounts,
  useGetIdentityVerification,
  useVerifyAccount,
} from '../../api/hooks/useAccounts';
import { useCurrencies } from '../../api/hooks/useCurrency';
import { AccountType, VerificationStatus } from '../../api/types';
import { CybridAccountEntity } from '../../api/types/AccountTypes';
import { errorHandling } from '../shared/errorHandling';
import AccountMenu from './AccountMenu';
import DepositBottomSheet from './DepositBottomSheet';
import axios from 'axios';
import OTPBottomSheet from '../auth/forgot-password/OTPBottomSheet';
import { useVerifyEmail } from '../../api/hooks/useAuth';
import { toast } from 'react-toastify';

// TODO: LOOK AT DELETING THIS INTERFACE AND CHANGE INSTANCES TO Currency from api types
export enum CurrencyEnum {
  USD = 'USD',
  CAD = 'CAD',
}

export default function MainCard() {
  const { formatNumber, formatMessage } = useIntl();
  const { push } = useRouter();

  const {
    data: accounts,
    isLoading: isActiveAccountLoading,
    refetch: refetchAccounts,
    error,
  } = useCybridAccounts();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setActiveAccount(accounts[0]);
    }
  }, [accounts]);

  const [activeAccount, setActiveAccount] = useState<CybridAccountEntity>();
  const { data: currencies, isLoading: areCurrenciesLoading } = useCurrencies();

  const majorActions = [
    {
      icon: <ArrowUpRightIcon size={28} color="white" />,
      title: formatMessage({ id: 'send' }),
      action: () => push('/remittance'),
    },
    {
      icon: <PlusIcon size={28} color="white" />,
      title: formatMessage({ id: 'deposit' }),
      action: () => setIsDepositBottomSheetOpen(true),
    },
    {
      icon: <MinusIcon size={28} color="white" />,
      title: formatMessage({ id: 'withdraw' }),
      action: () => alert('Feature Is Coming Soon'),
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const [isDepositBottomSheetOpen, setIsDepositBottomSheetOpen] =
    useState(false);

  const { mutate: verifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();
  const { data: identityVerification } = useGetIdentityVerification(
    activeAccount?.identity_verification_guid ?? ''
  );

  const handleAccountVerification = () => {
    if (
      activeAccount?.verification_status === null ||
      ['FAILED', 'EXPIRED'].includes(
        activeAccount?.verification_status as string
      )
    ) {
      verifyAccount(
        { account_type: AccountType.FIAT },
        {
          onSuccess: (data) => {
            setActiveAccount((prev) =>
              prev
                ? {
                    ...prev,
                    identity_verification_guid: data.identity_verification_guid,
                  }
                : undefined
            );
          },
          onError: (error) => errorHandling({ error, formatMessage }),
        }
      );
    } else if (identityVerification?.persona_hosted_link) {
      const url = encodeURI(
        `${identityVerification.persona_hosted_link}&redirect-uri=${window.location.href}`
      );
      window.open(url, '_self');
    }
  };

  useEffect(() => {
    if (
      identityVerification?.state === VerificationStatus.WAITING &&
      identityVerification?.persona_hosted_link
    ) {
      const url = encodeURI(
        `${identityVerification.persona_hosted_link}&redirect-uri=${window.location.href}`
      );
      window.open(url, '_self');
    }
  }, [identityVerification]);

  // Check if email is verified
  const [isEmailNotVerified, setIsEmailNotVerified] = useState<boolean>(false);
  const [isConfirmEmailBottomSheetOpen, setIsConfirmEmailBottomSheetOpen] =
    useState<boolean>(false);

  // set up verify email bottom sheet if the user has an unverified email
  if (
    error &&
    axios.isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response.data?.message?.includes('Unverified email!') &&
    !isEmailNotVerified
  ) {
    setIsEmailNotVerified(true);
  }

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();
  function submitOTP(otp?: string) {
    if (!otp) return setIsConfirmEmailBottomSheetOpen(true);
    verifyEmail(
      { code: otp },
      {
        onSuccess: () => {
          toast.success(formatMessage({ id: 'emailVerified' }));
          setIsConfirmEmailBottomSheetOpen(true);
        },
        onError: (error) => errorHandling({ error, formatMessage }),
      }
    );
  }

  return (
    <>
      <OTPBottomSheet
        otpId={JSON.parse(localStorage.getItem('authToken') || '""').otp_id}
        isOpen={isEmailNotVerified && !isConfirmEmailBottomSheetOpen}
        isSubmitting={isVerifyingEmail}
        closeBottomSheet={submitOTP}
        confirmText={formatMessage({ id: 'confirmEmail' })}
        description={formatMessage({ id: 'confirmEmailDescription' })}
        title={formatMessage({ id: 'confirmEmail' })}
      />
      <DepositBottomSheet
        isOpen={isDepositBottomSheetOpen}
        closeBottomSheet={() => {
          refetchAccounts();
          setIsDepositBottomSheetOpen(false);
        }}
      />
      <AccountMenu
        closeMenu={() => setIsAccountMenuOpen(false)}
        anchorEl={anchorEl}
        isOpen={isAccountMenuOpen}
        onSelect={(newActiveAccount) => {
          setIsAccountMenuOpen(false);
          setAnchorEl(null);
          setActiveAccount(newActiveAccount);
        }}
        accounts={accounts}
      />
      <Box
        sx={{
          borderRadius: 2,
          background:
            'radial-gradient(135.19% 101.42% at 5.92% 7.81%, #0F5DBE 0%, #072B58 64%)',
          color: 'white',
          padding: 3,
          display: 'grid',
          rowGap: 4,
        }}
      >
        {/* TODO: ADD SKELETON SCREEN FOR WHEN ACTIVE ACCT IS NOT PRESENT (DATA IS LOADING) */}
        {activeAccount && (
          <Box
            sx={{
              display: 'grid',
              justifyItems: 'center',
            }}
          >
            <Button
              variant="text"
              color="inherit"
              endIcon={<ChevronDownIcon size={20} />}
              size="small"
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
              onClick={(event) => {
                setAnchorEl(event.currentTarget);
                setIsAccountMenuOpen(true);
              }}
            >{`${formatMessage({ id: 'account' })} ${
              activeAccount.currency
            }`}</Button>
            <Typography
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                columnGap: 1,
                color: '#BABDBE',
              }}
              variant="h4"
            >
              {activeAccount.currency}
              <Typography variant="h1" sx={{ color: 'white' }} component="span">
                {isActiveAccountLoading ? (
                  <Skeleton
                    sx={{
                      minWidth: '100px',
                      backgroundColor: 'rgb(179 167 167 / 12%)',
                    }}
                  />
                ) : (
                  formatNumber(activeAccount.balance, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )}
              </Typography>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1 }}>
          {activeAccount && (
            <Typography
              variant="p1m"
              sx={{ color: 'white', fontWeight: 700 }}
            >{`1${activeAccount.currency} = ${
              areCurrenciesLoading
                ? '... '
                : currencies?.find(
                    (currency) => currency.currency === activeAccount.currency
                  )?.xaf_rate ?? '...'
            }XAF`}</Typography>
          )}
          {activeAccount &&
            (activeAccount.verification_status === VerificationStatus.PASSED ? (
              <Box
                sx={{
                  backgroundColor: '#157CFB',
                  padding: '24px 16px',
                  borderRadius: 1.5,
                  justifySelf: 'stretch',
                  display: 'grid',
                  gridAutoFlow: 'column',
                }}
              >
                {majorActions.map(({ action, icon, title }, index) => (
                  <Box
                    component={Button}
                    variant="text"
                    key={index}
                    sx={{
                      display: 'grid',
                      justifyItems: 'center',
                      padding: 0,
                      '&:hover': {
                        background: 'transparent',
                      },
                    }}
                    onClick={action}
                  >
                    {icon}
                    <Typography variant="p1m" sx={{ color: 'white' }}>
                      {title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              // TODO: REMOVE LATER AND PUT IN MANAGE ACCOUNTS PAGE
              <Button
                color="warning"
                fullWidth
                onClick={handleAccountVerification}
                disabled={
                  isVerifyingAccount ||
                  activeAccount.verification_status ===
                    VerificationStatus.STORING
                }
                endIcon={
                  isVerifyingAccount && (
                    <CircularProgress size={20} thickness={23} />
                  )
                }
              >
                {formatMessage({
                  id:
                    !activeAccount.verification_status ||
                    activeAccount.verification_status ===
                      VerificationStatus.FAILED ||
                    activeAccount.verification_status ===
                      VerificationStatus.EXPIRED
                      ? 'verifyNow'
                      : activeAccount.verification_status ===
                        VerificationStatus.WAITING
                      ? 'completeNow'
                      : 'waitAminute',
                })}
              </Button>
            ))}
        </Box>
      </Box>
    </>
  );
}
