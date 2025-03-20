import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'react-feather';
import { useIntl } from 'react-intl';
import { useVerifyAccount } from '../../api/hooks/useAccounts';
import { AccountType, VerificationStatus } from '../../api/types';
import { CybridAccountEntity } from '../../api/types/AccountTypes';
import { ExternalAccountVerificationStatus } from '../../types';
import { kycChipVariants } from '../external-accounts/ExternalAccountCard';
import FBOAccountDetailsBottomSheet from './FBOAccountDetailsBottomSheet';

interface FBOAccountCardProps {
  account: CybridAccountEntity;
  handleSelect: () => void;
  refetchAccounts: () => void;
}
export default function FBOAccountCard({
  account,
  handleSelect,
  refetchAccounts,
}: FBOAccountCardProps) {
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
        // TODO: USE alert in case of error. will be replaced with proper notifications later
        onError: (error) => alert(error.message),
      }
    );
  };

  const [
    isFBOAccountDetailsBottomSheetOpen,
    setIsFBOAccountDetailsBottomSheetOpen,
  ] = useState(false);

  return (
    <>
      <FBOAccountDetailsBottomSheet
        account={account}
        closeBottomSheet={() => setIsFBOAccountDetailsBottomSheetOpen(false)}
        isOpen={isFBOAccountDetailsBottomSheetOpen}
        refetchAccounts={refetchAccounts}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'start',
          py: 2,
          borderBottom: '1px solid #E8F2FF',
        }}
      >
        <Box sx={{ display: 'grid', rowGap: 1.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr',
              columnGap: 1,
              alignItems: 'center',
              justifyItems: 'start',
            }}
          >
            <Typography>{account.name}</Typography>
            <Chip
              label={formatMessage({ id: 'main' })}
              size="small"
              color="warning"
              sx={{
                bgcolor: '#FEF7EC',
                color: '#F1AC42',
              }}
            />
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

          <Typography
            variant="h6"
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
            <Typography variant="h3" color="black">
              {formatNumber(account.balance, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Typography>
        </Box>

        <Button
          variant="text"
          sx={{ padding: 0, typography: 'p2r' }}
          endIcon={<ChevronRight size={20} />}
          onClick={() => setIsFBOAccountDetailsBottomSheetOpen(true)}
        >
          {formatMessage({ id: 'details' })}
        </Button>
      </Box>
    </>
  );
}
