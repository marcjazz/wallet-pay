import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight as ArrowUpRightIcon,
  ChevronDown as ChevronDownIcon,
  Minus as MinusIcon,
  Plus as PlusIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import {
  useCybridAccounts,
  useVerifyAccount,
} from '../../api/hooks/useAccounts';
import { useCurrencies } from '../../api/hooks/useCurrency';
import { AccountType, VerificationStatus } from '../../api/types';
import { CybridAccountEntity } from '../../api/types/AccountTypes';
import AccountMenu from './AccountMenu';
import DepositBottomSheet from './DepositBottomSheet';

// TODO: LOOK AT DELETING THIS INTERFACE AND CHANGE INSTANCES TO Currency from api types
export enum CurrencyEnum {
  USD = 'USD',
  CAD = 'CAD',
}

// TODO: LOOK AT DELETING THIS INTERFACE and change instances to CybridAccountEntity from api types
export interface Account {
  cybrid_account_id: string;
  currency: CurrencyEnum;
  account_balance: number;
  xaf_conversion_rate: number;
  account_number: string;
}

export default function MainCard() {
  const { formatNumber, formatMessage } = useIntl();
  const { push } = useRouter();

  const {
    data: accounts,
    isLoading: isActiveAccountLoading,
    refetch: refetchAccounts,
  } = useCybridAccounts();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setActiveAccount(accounts[0]);
    }
  }, [accounts]);

  const { data: currencies, isLoading: areCurrenciesLoading } = useCurrencies();
  const [activeAccount, setActiveAccount] = useState<CybridAccountEntity>();

  const majorActions = [
    {
      icon: <ArrowUpRightIcon size={28} color="white" />,
      title: formatMessage({ id: 'send' }),
      action: () => push('/remittance'),
    },
    {
      icon: <PlusIcon size={28} color="white" />,
      title: formatMessage({ id: 'deposit' }),
      action: () => setIsDepositBottomSheetOpen(true),
    },
    {
      icon: <MinusIcon size={28} color="white" />,
      title: formatMessage({ id: 'withdraw' }),
      action: () => alert('Feature Is Coming Soon'),
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const [isDepositBottomSheetOpen, setIsDepositBottomSheetOpen] =
    useState(false);

  const { mutate: verifyAccount, isPending: isVerifyingAccount } =
    useVerifyAccount();

  return (
    <>
      <DepositBottomSheet
        isOpen={isDepositBottomSheetOpen}
        closeBottomSheet={() => setIsDepositBottomSheetOpen(false)}
      />
      <AccountMenu
        closeMenu={() => setIsAccountMenuOpen(false)}
        anchorEl={anchorEl}
        isOpen={isAccountMenuOpen}
        onSelect={(newActiveAccount) => {
          setIsAccountMenuOpen(false);
          setAnchorEl(null);
          setActiveAccount(newActiveAccount);
        }}
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
        {/* TODO: ADD SKELETON SCREEN FOR WHEN ACTIVE ACCT IS NOT PRESENT (DATA IS LOADING) */}
        {activeAccount && (
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
                  formatNumber(activeAccount.balance, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                )}
              </Typography>
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1 }}>
          {activeAccount && (
            <Typography
              variant="p1m"
              sx={{ color: 'white', fontWeight: 700 }}
            >{`1${activeAccount.currency} = ${
              areCurrenciesLoading
                ? '... '
                : currencies?.find(
                    (currency) => currency.currency === activeAccount.currency
                  )?.xaf_rate ?? '...'
            }XAF`}</Typography>
          )}
          {activeAccount &&
            (activeAccount.verification_status ===
            VerificationStatus.COMPLETED ? (
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
                {majorActions.map(({ action, icon, title }, index) => (
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
                    onClick={action}
                  >
                    {icon}
                    <Typography variant="p1m" sx={{ color: 'white' }}>
                      {title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              // TODO: REMOVE LATER AND PUT IN MANAGE ACCOUNTS PAGE
              <Button
                color="warning"
                fullWidth
                onClick={() =>
                  verifyAccount(
                    { account_type: AccountType.FIAT },
                    {
                      onSuccess: () => refetchAccounts(),
                      // TODO: USE alert in case of error. will be replaced with proper notifications later
                      onError: (error) => alert(error.message),
                    }
                  )
                }
                disabled={
                  (activeAccount.verification_status !==
                    VerificationStatus.EXPIRED &&
                    activeAccount.verification_status !==
                      VerificationStatus.FAILED) ||
                  isVerifyingAccount
                }
                endIcon={
                  isVerifyingAccount && (
                    <CircularProgress size={20} thickness={23} />
                  )
                }
              >
                Verify Now
              </Button>
            ))}
        </Box>
      </Box>
    </>
  );
}
