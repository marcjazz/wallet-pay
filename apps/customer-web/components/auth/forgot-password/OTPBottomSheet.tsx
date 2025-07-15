import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Key } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useResendOTP } from '../../../api/hooks/useOtp';
import BottomSheet from '../../shared/BottomSheet';

interface OTPBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: (isOtpValid?: string) => void;
  title?: string;
  otpId?: string;
  description?: string;
  confirmText?: string;
  isSubmitting?: boolean;
}

export default function OTPBottomSheet({
  isOpen,
  closeBottomSheet,
  title,
  otpId,
  description,
  confirmText,
  isSubmitting,
}: OTPBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .matches(/^\d{5}$/, formatMessage({ id: 'invalidOTP' })),
  });

  const initialValues = {
    otp: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      closeBottomSheet(values.otp);
      resetForm();
    },
  });
  const { errors, touched } = formik;

  const [countdown, setCountdown] = useState<number>(20);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const { mutate: resendOTP, isPending: isResendingOtp } = useResendOTP();
  function resendOtp(otpId: string) {
    resendOTP(
      { otp_id: otpId },
      {
        onSuccess(otp) {
          const countdown = (new Date(otp.expires_at).getTime() - Date.now()) / 1000;
          setCountdown(countdown);
          setIsCountingDown(true);
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev === 0) {
                clearInterval(interval);
                setIsCountingDown(false);
                return countdown;
              }
              return prev - 1;
            });
          }, 1000);
        },
      }
    );
  }

  return (
    <BottomSheet
      open={isOpen}
      closeBottomSheet={closeBottomSheet}
      disableSwipeToClose
      sx={{
        backgroundColor: 'green',
      }}
    >
      <Box sx={{ display: 'grid', rowGap: 2.25 }}>
        <Typography variant="h1">
          {title ?? formatMessage({ id: 'enterYourOTP' })}
        </Typography>
        <Typography variant="p1r">
          {description ?? formatMessage({ id: 'otpDescription' })}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: 'grid', rowGap: 3 }}
      >
        <FormControl
          error={Boolean(touched.otp && errors.otp)}
          required
          fullWidth
          disabled={isSubmitting}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              justifyItems: 'end',
              alignItems: 'end',
            }}
          >
            <FormLabel htmlFor="otp">{formatMessage({ id: 'otp' })}</FormLabel>
            {!isSubmitting && otpId && (
              <Button
                onClick={() => resendOtp(otpId)}
                variant="text"
                size="small"
                disabled={isResendingOtp || isCountingDown}
                sx={{
                  typography: 'l3r',
                  color: theme.palette.primary.main,
                  cursor: 'pointer',
                  py: 0,
                  '&:disabled': {
                    color: 'black',
                  },
                }}
                endIcon={
                  isResendingOtp && (
                    <CircularProgress size={15} thickness={23} />
                  )
                }
              >
                {isCountingDown
                  ? `${formatMessage({ id: 'expiredIn' })} (${countdown}s)`
                  : formatMessage({ id: 'resendEmail' })}
              </Button>
            )}
          </Box>
          <OutlinedInput
            id="otp"
            {...formik.getFieldProps('otp')}
            placeholder={formatMessage({ id: 'enterOtp' })}
            autoFocus
            endAdornment={
              <InputAdornment position="end">
                <Key size="20" color={theme.palette.grey[200]} />
              </InputAdornment>
            }
          />
          <FormHelperText error>{touched.otp && errors.otp}</FormHelperText>
        </FormControl>

        <Box sx={{ display: 'grid', rowGap: 2 }}>
          <Button
            type="submit"
            size="medium"
            disabled={isSubmitting}
            endIcon={
              isSubmitting && <CircularProgress size={20} thickness={23} />
            }
          >
            {confirmText ?? formatMessage({ id: 'submit' })}
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={isSubmitting}
            onClick={() => closeBottomSheet()}
          >
            {formatMessage({ id: 'cancel' })}
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}
