import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { AlertTriangle } from 'react-feather';
import { useIntl } from 'react-intl';
import { useVerifyAccount } from '../../api/hooks/useAccounts';
import { AccountType, VerificationStatus } from '../../api/types';
import { ExternalBankAccountEntity } from '../../api/types/AccountTypes';
import { ExternalAccountVerificationStatus } from '../../types';
import BottomSheet from '../shared/BottomSheet';
import { kycChipVariants } from './ExternalAccountCard';
import { errorHandling } from '../shared/errorHandling';

interface ExternalAccountDetailsBottomSheetProps {
  closeBottomSheet: () => void;
  isOpen: boolean;
  refetchAccounts: () => void;
  externalAccount: ExternalBankAccountEntity;
}
export default function ExternalAccountDetailsBottomSheet({
  externalAccount,
  closeBottomSheet,
  isOpen,
  refetchAccounts,
}: ExternalAccountDetailsBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const { mutate: handleVerifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();

  const verifyAccount = (cybrid_external_account_id: string) => {
    handleVerifyAccount(
      {
        account_type: AccountType.EXTERNAL,
        external_bank_account_id: cybrid_external_account_id,
      },
      {
        onSuccess: () => refetchAccounts(),
        onError: (error) => errorHandling({ error, formatMessage }),
      }
    );
  };

  return (
    <BottomSheet open={isOpen} closeBottomSheet={closeBottomSheet}>
      <Typography variant="h1">{`${formatMessage({
        id: 'externalAccountDetails',
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
            {formatMessage({ id: 'accountName' })}
          </Typography>
          <Typography variant="h4" color="#BABDBE">
            {externalAccount.name}
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
            {formatMessage({ id: 'accountNumber' })}
          </Typography>
          <Typography variant="h4" color="#BABDBE">
            {`********${externalAccount.mask}`.replace(/(.{4})(?=.)/g, '$1 ')}
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
              if (externalAccount.verification_status === null)
                verifyAccount(externalAccount.cybrid_external_account_id);
            }}
            label={formatMessage({
              id:
                externalAccount.verification_status ||
                ExternalAccountVerificationStatus.UNVERIFIED,
            })}
            size="small"
            sx={{
              typography: 'l3r',
              bgcolor:
                theme.palette[
                  externalAccount.verification_status ===
                  VerificationStatus.PASSED
                    ? 'primary'
                    : externalAccount.verification_status === null
                    ? 'error'
                    : 'secondary'
                ].light,
              color:
                externalAccount.verification_status ===
                VerificationStatus.PASSED
                  ? theme.palette['primary'].main
                  : externalAccount.verification_status === null
                  ? 'white'
                  : 'default',
            }}
            icon={
              isVerifyingAccount ? (
                <CircularProgress size={12} thickness={4} />
              ) : !externalAccount.verification_status ? (
                <AlertTriangle size={12} color="white" />
              ) : (
                kycChipVariants[externalAccount.verification_status].icon
              )
            }
          />
        </Box>
      </Box>
    </BottomSheet>
  );
}
