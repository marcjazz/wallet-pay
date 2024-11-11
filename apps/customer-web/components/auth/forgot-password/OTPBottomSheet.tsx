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
import { BottomSheet } from '@tchakoumi/handy-components';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Key } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

interface OTPBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: (isOtpValid: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
}

export default function OTPBottomSheet({
  isOpen,
  closeBottomSheet,
  title,
  description,
  confirmText,
}: OTPBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .matches(/^\d{4}$/, formatMessage({ id: 'invalidOTP' })),
  });

  const initialValues = {
    otp: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT OTP
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        // TODO: if the otp validation was correct, send true, else false
        // TODO: send the otp value to the parent component, to be used in the API call, the parent might have to verify the otp before executing the transaction.
        closeBottomSheet(true);
        resetForm();
      }, 3000);
    },
  });
  const { errors, touched } = formik;

  const [countdown, setCountdown] = useState(60);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  function resendOtp() {
    //TODO: CALL API TO RESEND OTP
    setIsResendingOtp(true);
    setTimeout(() => {
      setIsResendingOtp(false);
      setCountdown(60);
      setIsCountingDown(true);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(interval);
            setIsCountingDown(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }, 3000);
  }

  return (
    <BottomSheet
      open={isOpen}
      closeBottomSheet={() => closeBottomSheet(false)}
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
            {!isSubmitting && (
              <Button
                onClick={resendOtp}
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
              >
                {isCountingDown
                  ? `${formatMessage({ id: 'resendIn' })} (${countdown}s)`
                  : formatMessage({ id: 'resendEmail' })}
              </Button>
            )}
          </Box>
          <OutlinedInput
            id="otp"
            type="number"
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
            onClick={() => closeBottomSheet(false)}
          >
            {formatMessage({ id: 'cancel' })}
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}
