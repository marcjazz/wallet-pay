'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import { useCybridAccounts } from '../../../api/hooks/useAccounts';
import FBOAccountCard from '../../../components/accounts/FBOAccountCard';
import Footer from '../../../components/layout/footer/Footer';

export default function FBOAccounts() {
  const { formatMessage } = useIntl();
  const { push } = useRouter();

  const {
    data: accounts,
    isFetching: isLoadingAccounts,
    refetch: refetchAccounts,
  } = useCybridAccounts();

  return (
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
          gridTemplateRows: 'auto 1fr',
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
            {formatMessage({ id: 'manageAccounts' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', rowGap: 1, alignSelf: 'start' }}>
          {isLoadingAccounts ? (
            <Typography
              variant="p2r"
              sx={{
                color: '#BABDBE',
                textAlign: 'center',
                width: '100%',
                display: 'inline-block',
              }}
            >
              {formatMessage({ id: 'loadingAccounts' })}
            </Typography>
          ) : !accounts.length ? (
            <Typography
              variant="p2r"
              sx={{
                color: '#BABDBE',
                textAlign: 'center',
              }}
            >
              {formatMessage({ id: 'noAccounts' })}
            </Typography>
          ) : (
            accounts.map((account) => (
              <FBOAccountCard
                handleSelect={() => {
                  return null;
                }}
                refetchAccounts={refetchAccounts}
                account={account}
                key={account.cybrid_account_id}
              />
            ))
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
