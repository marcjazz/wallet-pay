import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  RefreshCcw,
} from 'react-feather';
import { useIntl } from 'react-intl';

import {
  useGetIdentityVerification,
  useVerifyAccount,
} from '../../api/hooks/useAccounts';
import { AccountType, VerificationStatus } from '../../api/types';
import { ExternalBankAccountEntity } from '../../api/types/AccountTypes';
import { ExternalAccountVerificationStatus } from '../../types';

export const kycChipVariants: Record<
  VerificationStatus,
  { color: string; icon: JSX.Element }
> = {
  EXPIRED: {
    color: 'error',
    icon: <AlertTriangle size={12} color="white" />,
  },
  COMPLETED: {
    color: 'primary',
    icon: <CheckCircle size={12} color="#157CFB" />,
  },
  PENDING: {
    color: 'warning',
    icon: <RefreshCcw size={12} />,
  },
  REVIEWING: {
    color: 'warning',
    icon: <RefreshCcw size={12} />,
  },
  STORING: {
    color: 'warning',
    icon: <RefreshCcw size={12} />,
  },
  WAITING: {
    color: 'warning',
    icon: <RefreshCcw size={12} />,
  },
  FAILED: {
    color: 'error',
    icon: <AlertTriangle size={12} color="white" />,
  },
};

interface ExternalAccountCardProps {
  externalAccount: ExternalBankAccountEntity;
  handleSelect: () => void;
  refetchExternalAccounts: () => void;
}
export default function ExternalAccountCard({
  externalAccount,
  handleSelect,
  refetchExternalAccounts,
}: ExternalAccountCardProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const { mutate: handleVerifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();
  const { data: identityVerification } = useGetIdentityVerification(
    externalAccount.identity_verification_guid ?? ''
  );

  const verifyAccount = (cybrid_external_account_id: string) => {
    if (
      externalAccount.verification_status === null ||
      ['FAILED', 'EXPIRED'].includes(
        externalAccount.verification_status as string
      )
    ) {
      handleVerifyAccount(
        {
          account_type: AccountType.EXTERNAL,
          external_bank_account_id: cybrid_external_account_id,
        },
        {
          onSuccess: () => {
            refetchExternalAccounts();
          },
          // TODO: USE alert in case of error. will be replaced with proper notifications later
          onError: (error) => alert(error.message),
        }
      );
    } else if (identityVerification?.persona_hosted_link) {
      const url = encodeURI(
        `${identityVerification.persona_hosted_link}?redirect_uri=${window.location.href}`
      );
      window.open(url, '_self');
    }
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
          <Typography>{externalAccount.name}</Typography>
          <Chip
            onClick={() =>
              verifyAccount(externalAccount.cybrid_external_account_id)
            }
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
                  VerificationStatus.COMPLETED
                    ? 'primary'
                    : externalAccount.verification_status === null
                    ? 'error'
                    : 'secondary'
                ].light,
              color:
                externalAccount.verification_status ===
                VerificationStatus.COMPLETED
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

        <Typography variant="h3" color="#BABDBE">
          {`********${externalAccount.mask}`.replace(/(.{4})(?=.)/g, '$1 ')}
        </Typography>
        {/* </Box> */}
      </Box>

      <Button
        variant="text"
        sx={{ padding: 0, typography: 'p2r' }}
        endIcon={<ChevronRight size={20} />}
        onClick={() => handleSelect()}
      >
        {formatMessage({ id: 'details' })}
      </Button>
    </Box>
  );
}
