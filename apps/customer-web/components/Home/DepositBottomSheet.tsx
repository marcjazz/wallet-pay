import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useExternalAccounts } from '../../api/hooks/useAccounts';
import { useRequestOtp } from '../../api/hooks/useOtp';
import { useInitiateTransfer } from '../../api/hooks/useTransaction';
import {
  Currency,
  OTPUsage,
  TransferType,
  VerificationStatus,
} from '../../api/types';
import OTPBottomSheet from '../auth/forgot-password/OTPBottomSheet';
import BottomSheet from '../shared/BottomSheet';

interface DepositBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
}
export default function DepositBottomSheet({
  closeBottomSheet,
  isOpen,
}: DepositBottomSheetProps) {
  const { formatMessage } = useIntl();

  const { data: externalAccounts, isFetching: isLoadingExternalAccounts } =
    useExternalAccounts(VerificationStatus.COMPLETED);

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required(formatMessage({ id: 'enterAmount' }))
      .positive(formatMessage({ id: 'invalidAmount' }))
      .integer(formatMessage({ id: 'cannotBeFraction' }))
      .min(10, formatMessage({ id: 'minAmount' })),
    selectedAccount: Yup.string()
      .required(formatMessage({ id: 'externalAccountRequired' }))
      .oneOf(
        externalAccounts.map((account) => account.cybrid_external_account_id),
        formatMessage({ id: 'invalidAccount' })
      ),
  });

  const initialValues = {
    amount: 100,
    selectedAccount: '',
  };

  const [otpId, setOtpId] = useState('');
  const [isOtpBottomSheetOpen, setIsOtpBottomSheetOpen] = useState(false);

  const { mutate: requestOtp, isPending: isRequestingOtp } = useRequestOtp();
  const { mutate: initiateTransfer, isPending: isSubmitting } =
    useInitiateTransfer();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT deposit
      requestOtp(
        {
          usage: OTPUsage.TRANSFER,
        },
        {
          onSuccess: (data) => {
            setOtpId(data.otp_id);
            setIsOtpBottomSheetOpen(true);
          },
          onError: (error) => {
            //TODO: USE alert in case of error. will be replaced with proper notifications later
            alert(error.message);
          },
        }
      );
    },
  });
  const { errors, touched } = formik;

  const handleAddExternalAccount = () => {
    //TODO: call api to add external account
    alert('Feature Is Coming Soon');
  };

  return (
    <>
      <OTPBottomSheet
        closeBottomSheet={(code) => {
          if (code) {
            initiateTransfer(
              {
                amount: formik.values.amount,
                currency: Currency.USD,
                transfer_type: TransferType.INSTANT_FUNDING,
                cybrid_source_account_id: formik.values.selectedAccount,
                otp: {
                  code: code,
                  otp_id: otpId,
                },
              },
              {
                onSuccess: () => {
                  formik.resetForm();
                  setIsOtpBottomSheetOpen(false);
                  closeBottomSheet();
                  alert('hello');
                },
                onError: (error) => {
                  //TODO: USE alert in case of error. will be replaced with proper notifications later
                  alert(error.message);
                  setIsOtpBottomSheetOpen(false);
                },
              }
            );
          } else {
            setIsOtpBottomSheetOpen(false);
          }
        }}
        isSubmitting={isRequestingOtp}
        isOpen={isOtpBottomSheetOpen}
        otpUsage={OTPUsage.TRANSFER}
        title={formatMessage({ id: 'confirmTransaction' })}
        confirmText={formatMessage({ id: 'confirmDeposit' })}
        description={formatMessage({ id: 'confirmDepositDescription' })}
      />
      <BottomSheet
        open={isOpen && !isOtpBottomSheetOpen}
        closeBottomSheet={closeBottomSheet}
      >
        <Typography variant="h2">{formatMessage({ id: 'deposit' })}</Typography>

        {!isLoadingExternalAccounts && !externalAccounts.length ? (
          <Box
            sx={{
              display: 'grid',
              rowGap: 3,
            }}
          >
            <Typography
              variant="p2r"
              sx={{
                color: '#BABDBE',
                textAlign: 'center',
              }}
            >
              {formatMessage({ id: 'noExternalAccount' })}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddExternalAccount}
            >
              {formatMessage({ id: 'addExternalAccount' })}
            </Button>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ display: 'grid', rowGap: 6 }}
          >
            <Box sx={{ display: 'grid', rowGap: 3 }}>
              <FormControl
                error={Boolean(touched.amount && errors.amount)}
                required
                fullWidth
                disabled={
                  isSubmitting || isRequestingOtp || isLoadingExternalAccounts
                }
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
                      typography: 'h3',
                      textAlign: 'end',
                    },
                    backgroundColor: 'rgba(232, 242, 255, 0.50)',
                  }}
                  type="number"
                  {...formik.getFieldProps('amount')}
                  placeholder={formatMessage({ id: 'amount' })}
                  autoFocus
                  startAdornment={
                    <InputAdornment position="start">
                      <Typography variant="p1m" sx={{ color: '#415058' }}>
                        {externalAccounts.find(
                          (account) =>
                            account.cybrid_external_account_id ===
                            formik.values.selectedAccount
                        )?.name ?? '...'}
                      </Typography>
                    </InputAdornment>
                  }
                />
                <FormHelperText error>
                  {touched.amount && errors.amount}
                </FormHelperText>
              </FormControl>

              <FormControl
                error={Boolean(
                  touched.selectedAccount && errors.selectedAccount
                )}
                required
                disabled={
                  isSubmitting || isRequestingOtp || isLoadingExternalAccounts
                }
              >
                <FormLabel htmlFor="cybrid-account">
                  {formatMessage({ id: 'selectAccount' })}
                </FormLabel>
                <Select
                  id="cybrid-account"
                  IconComponent={ChevronDown}
                  sx={{
                    '& .MuiSelect-icon': {
                      top: 'inherit',
                    },
                  }}
                  {...formik.getFieldProps('selectedAccount')}
                  autoFocus
                >
                  {externalAccounts.map((account) => (
                    <MenuItem
                      key={account.cybrid_external_account_id}
                      value={account.cybrid_external_account_id}
                    >
                      {`${`********${account.mask}`.replace(
                        /(.{4})(?=.)/g,
                        '$1 '
                      )} (${account.name})`}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText error>
                  {touched.selectedAccount && errors.selectedAccount}
                </FormHelperText>
              </FormControl>
            </Box>

            <Button
              variant="contained"
              color="primary"
              disabled={
                isSubmitting || isRequestingOtp || isLoadingExternalAccounts
              }
              type="submit"
              endIcon={
                isSubmitting ||
                (isRequestingOtp && (
                  <CircularProgress size={20} thickness={23} />
                ))
              }
            >
              {formatMessage({ id: 'confirm' })}
            </Button>
          </Box>
        )}
      </BottomSheet>
    </>
  );
}
