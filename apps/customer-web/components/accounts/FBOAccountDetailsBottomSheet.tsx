import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { AlertTriangle } from 'react-feather';
import { useIntl } from 'react-intl';
import { useVerifyAccount } from '../../api/hooks/useAccounts';
import { AccountType, VerificationStatus } from '../../api/types';
import { CybridAccountEntity } from '../../api/types/AccountTypes';
import { ExternalAccountVerificationStatus } from '../../types';
import { kycChipVariants } from '../external-accounts/ExternalAccountCard';
import BottomSheet from '../shared/BottomSheet';
import { errorHandling } from '../shared/errorHandling';

interface FBOAccountDetailsBottomSheetProps {
  closeBottomSheet: () => void;
  isOpen: boolean;
  account: CybridAccountEntity;
  refetchAccounts: () => void;
}
export default function FBOAccountDetailsBottomSheet({
  account,
  closeBottomSheet,
  isOpen,
  refetchAccounts,
}: FBOAccountDetailsBottomSheetProps) {
  const { formatMessage, formatNumber } = useIntl();
  const theme = useTheme();

  const { mutate: handleVerifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();

  const verifyAccount = () => {
    handleVerifyAccount(
      {
        account_type: AccountType.FIAT,
      },
      {
        onSuccess: () => refetchAccounts(),
        onError: (error) => errorHandling({ error, formatMessage }),
      }
    );
  };

  return (
    <BottomSheet open={isOpen} closeBottomSheet={closeBottomSheet}>
      <Typography variant="h1">{`${account.name}'s ${formatMessage({
        id: 'details',
      })}`}</Typography>

      <Box sx={{ display: 'grid', rowGap: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
          }}
        >
          <Typography variant="l3r">
            {formatMessage({ id: 'currentBalance' })}
          </Typography>
          <Typography
            variant="h4"
            color="#BABDBE"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 0.5,
              alignItems: 'center',
              justifyItems: 'start',
            }}
          >
            ${account.currency}
            <Typography variant="h2" color="black">
              {formatNumber(account.balance, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
          }}
        >
          <Typography variant="l3r">
            {formatMessage({ id: 'totalDeposited' })}
          </Typography>
          <Typography
            variant="h4"
            color="#BABDBE"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 0.5,
              alignItems: 'center',
              justifyItems: 'start',
            }}
          >
            ${account.currency}
            <Typography variant="h2" color="black">
              {/* TODO: FETCH THE ACCOUNT'S TOTAL DEPOSITED HERE */}
              {formatNumber(0, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
          }}
        >
          <Typography variant="l3r">
            {formatMessage({ id: 'totalTransfered' })}
          </Typography>
          <Typography
            variant="h4"
            color="#BABDBE"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 0.5,
              alignItems: 'center',
              justifyItems: 'start',
            }}
          >
            ${account.currency}
            <Typography variant="h2" color="black">
              {/* TODO: FETCH THE ACCOUNT'S TOTAL DEPOSITED HERE */}
              {formatNumber(0, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'end',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              columnGap: 0.5,
            }}
          >
            <Typography variant="l3r">
              {formatMessage({ id: 'kycStatus' })}
            </Typography>
          </Box>
          <Chip
            onClick={() => {
              if (account.verification_status === null) verifyAccount();
            }}
            label={formatMessage({
              id:
                account.verification_status ||
                ExternalAccountVerificationStatus.UNVERIFIED,
            })}
            size="small"
            sx={{
              typography: 'l3r',
              bgcolor:
                theme.palette[
                  account.verification_status === VerificationStatus.PASSED
                    ? 'primary'
                    : account.verification_status === null
                    ? 'error'
                    : 'secondary'
                ].light,
              color:
                account.verification_status === VerificationStatus.PASSED
                  ? theme.palette['primary'].main
                  : account.verification_status === null
                  ? 'white'
                  : 'default',
            }}
            icon={
              isVerifyingAccount ? (
                <CircularProgress size={12} thickness={4} />
              ) : !account.verification_status ? (
                <AlertTriangle size={12} color="white" />
              ) : (
                kycChipVariants[account.verification_status].icon
              )
            }
          />
        </Box>

        <Typography variant="l3r" sx={{ textAlign: 'center' }}>
          This is your main account
        </Typography>
      </Box>
    </BottomSheet>
  );
}
