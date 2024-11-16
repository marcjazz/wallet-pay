'use client';

import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { ChevronLeft, Plus } from 'react-feather';
import { useIntl } from 'react-intl';
import { CurrencyEnum } from '../../components/Home/MainCard';
import ExternalAccountCard from '../../components/external-accounts/ExternalAccountCard';
import ExternalAccountDetailsBottomSheet from '../../components/external-accounts/ExternalAccountDetailsBottomSheet';
import NewExternalAccountBottomSheet from '../../components/external-accounts/NewExternalAccountBottomSheet';
import Footer from '../../components/layout/footer/Footer';
import { ExternalAccountVerificationStatus } from '../../types';

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

  const [areExternalAccountsLoading, setAreExternalAccountsLoading] =
    useState(false);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>(
    []
  );

  useEffect(() => {
    setAreExternalAccountsLoading(true);
    setTimeout(() => {
      setAreExternalAccountsLoading(false);
      setExternalAccounts([
        {
          cybrid_external_account_id: '1',
          verification_status: ExternalAccountVerificationStatus.VERIFIED,
          account_currency: CurrencyEnum.USD,
          account_number: '1234',
          total_deposited: 1000,
          total_withdrawn: 500,
          is_default: true,
          is_enabled: true,
          account_balance: 500,
        },
        {
          cybrid_external_account_id: '2',
          verification_status: ExternalAccountVerificationStatus.UNVERIFIED,
          account_currency: CurrencyEnum.CAD,
          account_number: '4321',
          total_deposited: 500,
          total_withdrawn: 200,
          is_default: false,
          is_enabled: true,
          account_balance: 300,
        },
        {
          cybrid_external_account_id: '2',
          verification_status: ExternalAccountVerificationStatus.PENDING,
          account_currency: CurrencyEnum.CAD,
          account_number: '9876',
          total_deposited: 500,
          total_withdrawn: 200,
          is_default: false,
          is_enabled: true,
          account_balance: 300,
        },
      ]);
    }, 3000);
  }, []);

  const [selectedExternalAccount, setSelectedExternalAccount] =
    useState<ExternalAccount>();

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
          ) : externalAccounts.length ? (
            <Scrollbars universal autoHide>
              {externalAccounts.map((externalAccount) => (
                <ExternalAccountCard
                  key={externalAccount.cybrid_external_account_id}
                  externalAccount={externalAccount}
                  handleSelect={() =>
                    setSelectedExternalAccount(externalAccount)
                  }
                />
              ))}
            </Scrollbars>
          ) : (
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
          )}

          <Button
            variant="outlined"
            startIcon={<Plus />}
            onClick={() => setIsAddNewExternalAccountBottomSheetOpen(true)}
          >
            {formatMessage({ id: 'addExternalAccount' })}
          </Button>
        </Box>
        <Footer />
      </Box>
    </>
  );
}
