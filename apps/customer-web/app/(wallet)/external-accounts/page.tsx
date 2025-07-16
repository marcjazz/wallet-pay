'use client';

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Scrollbars from 'rc-scrollbars';
import { useState } from 'react';
import { ChevronLeft, Plus } from 'react-feather';
import { useIntl } from 'react-intl';
import {
  useCreateWorkflow,
  useExternalAccounts,
} from '../../../api/hooks/useAccounts';
import { ExternalBankAccountEntity } from '../../../api/types/AccountTypes';
import { CurrencyEnum } from '../../../components/Home/MainCard';
import ExternalAccountCard from '../../../components/external-accounts/ExternalAccountCard';
import ExternalAccountDetailsBottomSheet from '../../../components/external-accounts/ExternalAccountDetailsBottomSheet';
import NewExternalAccountBottomSheet from '../../../components/external-accounts/NewExternalAccountBottomSheet';
import Plaid from '../../../components/external-accounts/Plaid';
import Footer from '../../../components/layout/footer/Footer';
import { ExternalAccountVerificationStatus } from '../../../types';
import { errorHandling } from '../../../components/shared/errorHandling';

export interface ExternalAccount {
  cybrid_external_account_id: string;
  verification_status: ExternalAccountVerificationStatus;
  account_currency: CurrencyEnum;
  account_number: string;
  total_deposited: number;
  total_withdrawn: number;
  is_default: boolean;
  is_enabled: boolean;
  account_balance: number;
}

export default function ExternalAccounts() {
  const { formatMessage } = useIntl();
  const { push } = useRouter();

  const { mutate: createWorkflow, isPending: isCreateWorkflowLoading } =
    useCreateWorkflow();
  const [plaidLinkToken, setPlaidLinkToken] = useState<
    string | null | undefined
  >();
  const [isConnectingPlaid, setIsConnectingPlaid] = useState(false);
  const {
    data: externalAccounts,
    isLoading: areExternalAccountsLoading,
    refetch: refetchExternalAccounts,
  } = useExternalAccounts();

  const [selectedExternalAccount, setSelectedExternalAccount] =
    useState<ExternalBankAccountEntity>();

  const [
    isAddNewExternalAccountBottomSheetOpen,
    setIsAddNewExternalAccountBottomSheetOpen,
  ] = useState(false);

  return (
    <>
      {!!selectedExternalAccount && (
        <ExternalAccountDetailsBottomSheet
          closeBottomSheet={() => setSelectedExternalAccount(undefined)}
          externalAccount={selectedExternalAccount}
          isOpen={!!selectedExternalAccount}
          refetchAccounts={refetchExternalAccounts}
        />
      )}
      {isConnectingPlaid && plaidLinkToken && (
        <Plaid
          plaidPublicToken={plaidLinkToken}
          handleSuccess={() => {
            refetchExternalAccounts();
            setIsConnectingPlaid(false);
            setPlaidLinkToken(undefined);
          }}
        />
      )}
      <NewExternalAccountBottomSheet
        closeBottomSheet={() =>
          setIsAddNewExternalAccountBottomSheetOpen(false)
        }
        isOpen={isAddNewExternalAccountBottomSheetOpen}
      />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2,
          height: '100%',
          gridTemplateRows: '1fr auto',
        }}
      >
        <Box
          sx={{
            padding: 2,
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            rowGap: 5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              columnGap: 2,
            }}
          >
            <Tooltip title={formatMessage({ id: 'back' })}>
              <IconButton
                size="small"
                onClick={() => push('/')}
                sx={{
                  padding: 0,
                }}
              >
                <ChevronLeft color="#1F2223" />
              </IconButton>
            </Tooltip>

            <Typography variant="h3">
              {formatMessage({ id: 'manageFiatAccounts' })}
            </Typography>
          </Box>
          {areExternalAccountsLoading ? (
            // TODO: MAKE SKELETON SCREENS LATER
            <Typography
              variant="p2r"
              sx={{
                color: '#BABDBE',
                textAlign: 'center',
                width: '100%',
                display: 'inline-block',
              }}
            >
              {formatMessage({ id: 'loadingExternalAccounts' })}
            </Typography>
          ) : !externalAccounts || !externalAccounts.length ? (
            <Typography
              variant="p2r"
              sx={{
                color: '#BABDBE',
                textAlign: 'center',
                width: '100%',
                display: 'inline-block',
              }}
            >
              {formatMessage({ id: 'noExternalAccounts' })}
            </Typography>
          ) : (
            <Scrollbars universal autoHide>
              {externalAccounts.map((externalAccount) => (
                <ExternalAccountCard
                  key={externalAccount.cybrid_external_account_id}
                  externalAccount={externalAccount}
                  handleSelect={() =>
                    setSelectedExternalAccount(externalAccount)
                  }
                  refetchExternalAccounts={refetchExternalAccounts}
                />
              ))}
            </Scrollbars>
          )}

          <Button
            variant="outlined"
            startIcon={<Plus />}
            disabled={isCreateWorkflowLoading || isConnectingPlaid}
            endIcon={
              (isCreateWorkflowLoading || isConnectingPlaid) && (
                <CircularProgress size={20} thickness={23} />
              )
            }
            onClick={() => {
              setIsConnectingPlaid(true);
              createWorkflow(
                {},
                {
                  onSuccess: (data) => setPlaidLinkToken(data.plaid_link_token),
                  onError: (error) => errorHandling({ error, formatMessage }),
                }
              );
            }}
          >
            {formatMessage({ id: 'addExternalAccount' })}
          </Button>
        </Box>
        <Footer />
      </Box>
    </>
  );
}
