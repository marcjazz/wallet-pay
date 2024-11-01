import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useState } from 'react';
import {
  ArrowUpRight as ArrowUpRightIcon,
  ChevronDown as ChevronDownIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import AccountMenu from './AccountMenu';

enum CurrencyEnum {
  USD = 'USD',
  CAD = 'CAD',
}

export interface Account {
  cybrid_account_id: string;
  currency: CurrencyEnum;
}

interface ActiveAccount extends Account {
  account_balance: number;
  xaf_conversion_rate: number;
}

export default function MainCard() {
  const { formatNumber, formatMessage } = useIntl();

  const [accounts, setAccounts] = useState<Account[]>([
    {
      cybrid_account_id: '1',
      currency: CurrencyEnum['USD'],
    },
    {
      cybrid_account_id: '2',
      currency: CurrencyEnum['CAD'],
    },
  ]);

  const [isActiveAccountLoading, setIsActiveAccountLoading] =
    useState<boolean>(false);
  const [activeAccount, setActiveAccount] = useState<ActiveAccount>({
    cybrid_account_id: '',
    currency: CurrencyEnum['USD'],
    account_balance: 352479.9,
    xaf_conversion_rate: 600,
  });

  const majorActions = [
    {
      icon: <ArrowUpRightIcon size={28} color="white" />,
      title: formatMessage({ id: 'send' }),
      action: () => null,
    },
    {
      icon: <PlusIcon size={28} color="white" />,
      title: formatMessage({ id: 'deposit' }),
      action: () => null,
    },
    {
      icon: <MinusIcon size={28} color="white" />,
      title: formatMessage({ id: 'withdraw' }),
      action: () => null,
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  function changeActiveAccount(selected_cybrid_account_id: string) {
    setIsAccountMenuOpen(false);
    setAnchorEl(null);
    const selectedAccount = accounts.find(
      (account) => account.cybrid_account_id === selected_cybrid_account_id
    );
    if (
      selectedAccount &&
      selected_cybrid_account_id !== activeAccount.cybrid_account_id
    ) {
      setIsActiveAccountLoading(true);
      setActiveAccount((prev) => ({
        ...prev,
        ...selectedAccount,
      }));
      //TODO: CALL API TO FETCH DATA FOR SELECTED ACCOUNT
      setTimeout(() => {
        setIsActiveAccountLoading(false);
      }, 3000);
    }
  }

  return (
    <>
      <AccountMenu
        closeMenu={() => setIsAccountMenuOpen(false)}
        anchorEl={anchorEl}
        isOpen={isAccountMenuOpen}
        onSelect={changeActiveAccount}
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
                formatNumber(activeAccount.account_balance, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              )}
            </Typography>
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1 }}>
          <Typography
            variant="p1m"
            sx={{ color: 'white', fontWeight: 700 }}
          >{`1${activeAccount.currency} = ${
            isActiveAccountLoading ? '... ' : activeAccount.xaf_conversion_rate
          }XAF`}</Typography>
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
            {majorActions.map((action, index) => (
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
              >
                {action.icon}
                <Typography variant="p1m" sx={{ color: 'white' }}>
                  {action.title}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
