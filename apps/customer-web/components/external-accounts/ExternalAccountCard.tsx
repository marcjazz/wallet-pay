import { Box, Button, Chip, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  RefreshCcw,
} from 'react-feather';
import { useIntl } from 'react-intl';
import { ExternalAccount } from '../../app/external-accounts/page';
import { ExternalAccountVerificationStatus } from '../../types';

export const kycChipVariants: Record<
  ExternalAccountVerificationStatus,
  { color: string; icon: JSX.Element }
> = {
  UNVERIFIED: {
    color: 'error',
    icon: <AlertTriangle size={12} color="white" />,
  },
  VERIFIED: {
    color: 'primary',
    icon: <CheckCircle size={12} color="#157CFB" />,
  },
  PENDING: {
    color: 'warning',
    icon: <RefreshCcw size={12} />,
  },
};

interface ExternalAccountCardProps {
  externalAccount: ExternalAccount;
  handleSelect: () => void;
}
export default function ExternalAccountCard({
  externalAccount,
  handleSelect,
}: ExternalAccountCardProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const verifyAccount = (cybrid_external_account_id: string) => {
    //TODO: CALL API HERE TO VERIFY ACCOUNT
    alert('Verifying Account');
  };

  return (
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
          <Typography>{`${formatMessage({ id: 'account' })} ${
            externalAccount.account_currency
          }`}</Typography>
          {/* {externalAccount.is_default && (
            <Chip
              label={formatMessage({ id: 'main' })}
              size="small"
              color="warning"
              sx={{
                bgcolor: theme.palette['secondary'].light,
                color: theme.palette['secondary'].main,
              }}
            />
          )} */}
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

        {/* <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            justifyItems: 'start',
            columnGap: 0.5,
          }}
        >
          <Typography variant="h6" color="#BABDBE">
            {externalAccount.account_currency}
          </Typography> */}
        <Typography variant="h3" color="#BABDBE">
          {`********${externalAccount.account_number}`.replace(
            /(.{4})(?=.)/g,
            '$1 '
          )}
        </Typography>
        {/* </Box> */}
      </Box>

      <Button
        variant="text"
        sx={{ padding: 0, typography: 'p2r' }}
        endIcon={<ChevronRight size={20} />}
        onClick={handleSelect}
      >
        {formatMessage({ id: 'details' })}
      </Button>
    </Box>
  );
}
