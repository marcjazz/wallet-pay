import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Account, CurrencyEnum } from '../Home/MainCard';
import ChangeCurrencyMenu from './ChangeCurrencyMenu';
import PayoutMethodBottomSheet from './PayoutMethodBottomSheet';

export enum SupportedPayoutMethod {
  cash = 'cash_pickup',
  bank = 'bank_deposit',
  mobile = 'mobile_money',
}

export interface AmountStepData {
  sendingAmount: number;
  sendingAccount: Account;
  payoutMethod: SupportedPayoutMethod;
}

interface SendAmountStepProps {
  handleNext: (data: AmountStepData) => void;
  amountStepData: Partial<AmountStepData>;
}
export default function SendAmountStep({
  handleNext,
  amountStepData,
}: SendAmountStepProps) {
  //TODO: CALL API TO FETCH LIMITS
  const MAX_SENDING_AMOUNT = 1000;
  const MIN_SENDING_AMOUNT = 10;

  const { formatMessage, formatNumber } = useIntl();
  const theme = useTheme();

  enum SupportedPaymentMethod {
    fiat = 'fiat',
    card = 'card',
  }

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<SupportedPaymentMethod>(SupportedPaymentMethod.fiat);

  const paymentMethods: Record<
    SupportedPaymentMethod,
    { title: string; action: () => void }
  > = {
    [SupportedPaymentMethod.fiat]: {
      title: formatMessage({ id: 'fiat' }),
      action: () => setSelectedPaymentMethod(SupportedPaymentMethod.fiat),
    },
    [SupportedPaymentMethod.card]: {
      title: formatMessage({ id: 'card' }),
      action: () => alert('Feature Is Coming Soon'),
    },
  };

  const [sendingAccount, setSendingAccount] = useState<Account | undefined>(
    amountStepData.sendingAccount
  );
  const [isChangeCurrencyMenuOpen, setIsChangeCurrencyMenuOpen] =
    useState(false);
  const [sendingCurrencyAnchorEl, setSendingCurrencyAnchorEl] =
    useState<HTMLElement | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false);

  useEffect(() => {
    //TODO: CALL API TO FETCH ACCOUNTS
    setIsLoadingAccounts(true);
    setTimeout(() => {
      const cybridAccounts: Account[] = [
        {
          cybrid_account_id: '1',
          currency: CurrencyEnum['USD'],
          account_balance: 352479.9,
          xaf_conversion_rate: 567.56,
          account_number: '7815',
        },
        {
          cybrid_account_id: '2',
          currency: CurrencyEnum['CAD'],
          account_balance: 2479.9,
          xaf_conversion_rate: 373.5,
          account_number: '1588',
        },
      ];
      setAccounts(cybridAccounts);
      if (cybridAccounts.length > 0) setSendingAccount(cybridAccounts[0]);
      //TODO: REPLACE WITH PROPER NOTIFICATION
      else alert('No FBO accounts found');
      setIsLoadingAccounts(false);
    }, 3000);
  }, []);

  const validationSchema = Yup.object({
    sendingAmount: Yup.number()
      .required(formatMessage({ id: 'enterAmount' }))
      .positive(formatMessage({ id: 'invalidAmount' }))
      .integer(formatMessage({ id: 'cannotBeFraction' }))
      .max(MAX_SENDING_AMOUNT, formatMessage({ id: 'maxRemitAmount' }))
      .min(MIN_SENDING_AMOUNT, formatMessage({ id: 'minRemitAmount' }))
      .test(
        'max-available-balance',
        formatMessage({
          id: sendingAccount ? 'maxBalanceExceeded' : 'noFboAccount',
        }),
        function (value) {
          if (!sendingAccount) return false;
          if (value > sendingAccount.account_balance) {
            return false;
          }
          return true;
        }
      ),
  });

  const [isPayoutMethodBottomSheetOpen, setIsPayoutMethodBottomSheetOpen] =
    useState(!!amountStepData.payoutMethod);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<
    SupportedPayoutMethod | undefined
  >(amountStepData.payoutMethod);

  const initialValues = {
    sendingAmount: amountStepData.sendingAmount || 100,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      setIsPayoutMethodBottomSheetOpen(true);
    },
  });
  const { errors, touched } = formik;

  function onNext() {
    if (!selectedPayoutMethod) {
      alert('Please select a payout method');
      return;
    }
    if (!sendingAccount) {
      alert('Please select a sending account');
      return;
    }
    handleNext({
      sendingAmount: formik.values.sendingAmount,
      sendingAccount,
      payoutMethod: selectedPayoutMethod!,
    });
    setIsPayoutMethodBottomSheetOpen(false);
  }

  return (
    <>
      <ChangeCurrencyMenu
        isOpen={isChangeCurrencyMenuOpen}
        closeMenu={() => setIsChangeCurrencyMenuOpen(false)}
        anchorEl={sendingCurrencyAnchorEl}
        accounts={accounts}
        onSelect={(account: Account) => {
          setSendingAccount(account);
          setIsChangeCurrencyMenuOpen(false);
        }}
      />

      <PayoutMethodBottomSheet
        isOpen={isPayoutMethodBottomSheetOpen}
        closeBottomSheet={() => setIsPayoutMethodBottomSheetOpen(false)}
        onSelect={(payoutMethod: SupportedPayoutMethod) => {
          setSelectedPayoutMethod(payoutMethod);
        }}
        selectedPayoutMethod={selectedPayoutMethod}
        onNext={onNext}
      />

      <Box sx={{ display: 'grid', rowGap: 5, gridTemplateRows: 'auto 1fr' }}>
        <Typography variant="h2">
          {formatMessage({ id: 'enterAmount' })}
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{
            display: 'grid',
            rowGap: 2,
            height: '100%',
            gridTemplateRows: 'auto auto 1fr',
            alignItems: 'end',
            paddingBottom: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              columnGap: 2,
              justifyItems: 'start',
            }}
          >
            {Object.entries(paymentMethods).map(([key, { action, title }]) => (
              <Typography
                key={key}
                onClick={action}
                variant="h5"
                sx={{
                  color: key === selectedPaymentMethod ? 'inherit' : '#BABDBE',
                  padding: '0.5px 1px',
                  position: 'relative',
                  '&::after': {
                    content: '" "',
                    position: 'absolute',
                    width: '100%',
                    backgroundColor: theme.palette.primary.main,
                    height: key === selectedPaymentMethod ? '3px' : '0',
                    bottom: '-8.5px',
                    left: '0',
                    borderRadius: '10px',
                  },
                }}
              >
                {title}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'grid', rowGap: 1.5 }}>
            <FormControl
              error={Boolean(touched.sendingAmount && errors.sendingAmount)}
              required
              fullWidth
              disabled={isLoadingAccounts || !accounts.length}
            >
              <OutlinedInput
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-error': {
                    border: '1px solid #EE2B2B',
                  },
                  '& .MuiInputBase-input': {
                    typography: 'h2',
                    textAlign: 'end',
                  },
                  backgroundColor: 'rgba(232, 242, 255, 0.50)',
                }}
                type="number"
                {...formik.getFieldProps('sendingAmount')}
                placeholder={formatMessage({ id: 'amount' })}
                autoFocus
                endAdornment={
                  <InputAdornment position="end">
                    {sendingAccount && (
                      <Box sx={{ display: 'grid' }}>
                        <Typography variant="h6" sx={{ color: '#BABDBE' }}>
                          {formatNumber(sendingAccount.account_balance, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            currency: sendingAccount.currency,
                            style: 'currency',
                          })}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            formik.setFieldValue(
                              'sendingAmount',
                              sendingAccount.account_balance >
                                MAX_SENDING_AMOUNT
                                ? MAX_SENDING_AMOUNT
                                : sendingAccount.account_balance
                            );
                          }}
                          sx={{
                            typography: 'p3m',
                            color: theme.palette.secondary.main,
                          }}
                        >
                          {formatMessage({ id: 'max' })}
                        </IconButton>
                      </Box>
                    )}
                  </InputAdornment>
                }
                startAdornment={
                  <InputAdornment position="start">
                    <Box>
                      <Typography variant="h6" sx={{ color: '#BABDBE' }}>
                        {formatMessage({ id: 'from' })}
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridAutoFlow: 'column',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="p1m" sx={{ color: '#415058' }}>
                          {isLoadingAccounts || !sendingAccount ? (
                            <Skeleton variant="text" width={50} />
                          ) : (
                            sendingAccount.currency
                          )}
                        </Typography>
                        <Tooltip
                          title={formatMessage({ id: 'changeCurrency' })}
                        >
                          <IconButton
                            size="small"
                            // disabled={isLoadingAccounts || !accounts.length}
                            onClick={(event) => {
                              setSendingCurrencyAnchorEl(event.currentTarget);
                              setIsChangeCurrencyMenuOpen(true);
                            }}
                          >
                            <ChevronDown color="#1F2223" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </InputAdornment>
                }
              />
              <FormHelperText error>
                {touched.sendingAmount && errors.sendingAmount}
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth disabled>
              <OutlinedInput
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-error': {
                    border: '1px solid #EE2B2B',
                  },
                  '& .MuiInputBase-input': {
                    typography: 'h2',
                    textAlign: 'end',
                    '&:disabled': {
                      WebkitTextFillColor: 'black',
                    },
                  },
                  backgroundColor: 'rgba(232, 242, 255, 0.50)',
                }}
                value={
                  sendingAccount
                    ? formatNumber(
                        formik.values.sendingAmount *
                          sendingAccount.xaf_conversion_rate,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : 0
                }
                startAdornment={
                  <InputAdornment position="start">
                    <Box>
                      <Typography variant="h6" sx={{ color: '#BABDBE' }}>
                        {formatMessage({ id: 'to' })}
                      </Typography>
                      <Typography variant="p1m" sx={{ color: '#415058' }}>
                        XAF
                      </Typography>
                    </Box>
                  </InputAdornment>
                }
              />
            </FormControl>

            {sendingAccount && (
              <Typography
                variant="l2r"
                sx={{ color: '#BABDBE', justifySelf: 'center' }}
              >{`1${sendingAccount.currency} = ${sendingAccount.xaf_conversion_rate}XAF`}</Typography>
            )}
          </Box>

          {(!isLoadingAccounts || !accounts.length) && (
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight size="24" />}
            >
              {formatMessage({ id: 'next' })}
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
