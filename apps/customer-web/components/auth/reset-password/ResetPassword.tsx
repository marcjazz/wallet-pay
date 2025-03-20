'use client';

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
import { useResendOTP } from '../../../api/hooks/useOtp';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Key } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import {
  useResetPassword
} from '../../../api/hooks/useAuth';

export default function ResetPassword() {
  const { formatMessage } = useIntl();
  const { push } = useRouter();
  const query = useSearchParams();
  const otpId = query.get('otp_id');

  useEffect(() => {
    if (!otpId) {
      push('/forgot-password');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpId]);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .matches(/^\d{5}$/, formatMessage({ id: 'invalidOTP' })),
    password: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .min(3, formatMessage({ id: 'minPasswordCharacters' })),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref('password')],
      formatMessage({ id: 'passwordsMustMatch' })
    ),
  });

  const initialValues = {
    otp: '',
    password: '',
    confirmPassword: '',
  };

  const { mutate: resetPassword, isPending: isSubmitting } = useResetPassword();
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      resetPassword(
        {
          otp_code: values.otp,
          new_password: values.password,
          otp_id: otpId as string,
        },
        {
          onSuccess: () => {
            resetForm();
            push('/login');
          },
          //TODO: USE alert in case of error. will be replaced with proper notifications later
          onError: (error) => alert(error.message),
        }
      );
    },
  });
  const { errors, touched } = formik;
  const theme = useTheme();

  const preventRouteWhenSubmitting = (event: React.MouseEvent) => {
    if (isSubmitting) {
      event.preventDefault();
    }
  };

  const [countdown, setCountdown] = useState(60 * 5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const { mutate: resendOTP, isPending: isResendingOtp } = useResendOTP();
  function resendOtp(otpId: string) {
    resendOTP(
      { otp_id: otpId },
      {
        onSuccess(otp) {
          const countdown = new Date(otp.expires_at).getTime() - Date.now();
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
    <Box sx={{ display: 'grid', gap: 6, padding: '30px 16px 10px 16px' }}>
      <Box sx={{ display: 'grid', rowGap: 2.25 }}>
        <Typography variant="h1">
          {formatMessage({ id: 'resetYourPassword' })}
        </Typography>
        <Typography variant="p1r">
          {formatMessage({ id: 'resetYourPasswordDescription' })}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: 'grid', gap: 3 }}
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
              >
                {isCountingDown
                  ? `${formatMessage({ id: 'resendIn' })} (${countdown}s)`
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

        <FormControl
          disabled={isSubmitting}
          required
          error={!!(touched.password && errors.password)}
        >
          <FormLabel htmlFor="password">
            {formatMessage({ id: 'password' })}
          </FormLabel>
          <OutlinedInput
            id="password"
            type="password"
            {...formik.getFieldProps('password')}
            placeholder={formatMessage({ id: 'enterNewPassword' })}
          />
          <FormHelperText>{touched.password && errors.password}</FormHelperText>
        </FormControl>
        <FormControl
          disabled={isSubmitting}
          required
          error={!!(touched.confirmPassword && errors.confirmPassword)}
        >
          <FormLabel htmlFor="confirmPassword">
            {formatMessage({ id: 'confirmPassword' })}
          </FormLabel>
          <OutlinedInput
            id="confirmPassword"
            type="password"
            {...formik.getFieldProps('confirmPassword')}
            placeholder={formatMessage({ id: 'confirmPassword' })}
            autoFocus
          />
          <FormHelperText>
            {touched.confirmPassword && errors.confirmPassword}
          </FormHelperText>
        </FormControl>

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1.5 }}>
          <Button
            fullWidth
            size="medium"
            type="submit"
            disabled={isSubmitting}
            endIcon={
              isSubmitting && <CircularProgress size={20} thickness={23} />
            }
          >
            {formatMessage({ id: 'reset' })}
          </Button>
          <Typography variant="p2r">
            {formatMessage({ id: 'backTo' })}
            <Typography
              variant="p2r"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textDecoration: 'none',
              }}
              href="/login"
              component={Link}
              onClick={preventRouteWhenSubmitting}
            >
              {formatMessage({ id: 'login' })}
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
