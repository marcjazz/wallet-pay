import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useIntl } from 'react-intl';
import {
  ExternalAccount,
  ExternalAccountVerificationStatus,
} from '../../app/external-accounts/page';
import BottomSheet from '../shared/BottomSheet';
import { kycChipVariants } from './ExternalAccountCard';

interface ExternalAccountDetailsBottomSheetProps {
  closeBottomSheet: () => void;
  isOpen: boolean;
  externalAccount: ExternalAccount;
}
export default function ExternalAccountDetailsBottomSheet({
  externalAccount,
  closeBottomSheet,
  isOpen,
}: ExternalAccountDetailsBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const verifyAccount = (cybrid_external_account_id: string) => {
    //TODO: CALL API HERE TO VERIFY ACCOUNT
    alert('Verifying Account');
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
            {formatMessage({ id: 'accountCurrency' })}
          </Typography>
          <Typography variant="h4" color="#BABDBE">
            {externalAccount.account_currency}
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
            {`********${externalAccount.account_number}`.replace(
              /(.{4})(?=.)/g,
              '$1 '
            )}
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
              if (
                externalAccount.verification_status ===
                ExternalAccountVerificationStatus.UNVERIFIED
              )
                verifyAccount(externalAccount.cybrid_external_account_id);
            }}
            label={formatMessage({ id: externalAccount.verification_status })}
            size="small"
            sx={{
              typography: 'l3r',
              bgcolor:
                theme.palette[
                  externalAccount.verification_status ===
                  ExternalAccountVerificationStatus.VERIFIED
                    ? 'primary'
                    : externalAccount.verification_status ===
                      ExternalAccountVerificationStatus.UNVERIFIED
                    ? 'error'
                    : 'secondary'
                ].light,
              color:
                externalAccount.verification_status ===
                ExternalAccountVerificationStatus.VERIFIED
                  ? theme.palette['primary'].main
                  : externalAccount.verification_status ===
                    ExternalAccountVerificationStatus.UNVERIFIED
                  ? 'white'
                  : 'default',
            }}
            icon={kycChipVariants[externalAccount.verification_status].icon}
          />
        </Box>
      </Box>
    </BottomSheet>
  );
}
