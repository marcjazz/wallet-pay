'use client';

import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import styles from './login.module.css';

export default function Login() {
  const { formatMessage } = useIntl();
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(formatMessage({ id: 'invalidEmail' }))
      .required(formatMessage({ id: 'requiredField' })),
    password: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .min(3, formatMessage({ id: 'minPasswordCharacters' })),
  });

  const initialValues = {
    email: '',
    password: '',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT LOGIN
      //TODO: USE alert in case of error. will be replaced with proper notifications later
      console.log(values);
      setIsSubmitting(true);
      setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
      }, 3000);
    },
  });
  const { errors, touched } = formik;
  const theme = useTheme();

  function handleGoogleLogin() {
    //TODO: CALL API HERE TO LOGIN WITH GOOGLE
    console.log('Google login');
  }

  const preventRouteWhenSubmitting = (event: React.MouseEvent) => {
    if (isSubmitting) {
      event.preventDefault();
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 6, padding: '30px 16px 10px 16px' }}>
      <Box sx={{ display: 'grid', rowGap: 2.25 }}>
        <Typography variant="h1">
          {formatMessage({ id: 'accessAccountBy' })}
          <Typography
            variant="h1"
            component="span"
            sx={{ color: theme.palette.primary.main }}
          >
            {formatMessage({ id: 'loggingIn' })}
          </Typography>
          .
        </Typography>
        <Typography variant="p1r">
          {formatMessage({ id: 'loginDescription' })}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', rowGap: 4.5 }}>
        <Button
          onClick={handleGoogleLogin}
          variant="outlined"
          size="medium"
          color="inherit"
          disabled={isSubmitting}
          startIcon={
            <Image
              src="/assets/google.svg"
              alt="google"
              height={24}
              width={24}
              loading="lazy"
              style={{ transition: 'filter 0.3s ease, opacity 0.3s ease' }}
              className={isSubmitting ? styles.disabledIcon : ''}
            />
          }
        >
          {formatMessage({ id: 'continueWithGoogle' })}
        </Button>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            columnGap: 1,
            alignItems: 'center',
          }}
        >
          <Divider />
          <Typography variant="l1r" sx={{ color: theme.palette.grey[200] }}>
            {formatMessage({ id: 'or' })}
          </Typography>
          <Divider />
        </Box>

        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: 'grid', gap: 3 }}
        >
          <FormControl
            disabled={isSubmitting}
            required
            error={!!(touched.email && errors.email)}
          >
            <FormLabel htmlFor="email">
              {formatMessage({ id: 'email' })}
            </FormLabel>
            <OutlinedInput
              id="email"
              type="email"
              {...formik.getFieldProps('email')}
              placeholder={formatMessage({ id: 'enterEmail' })}
              autoFocus
            />
            <FormHelperText>{touched.email && errors.email}</FormHelperText>
          </FormControl>
          <Box sx={{ display: 'grid', justifyItems: 'end' }}>
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
                placeholder={formatMessage({ id: 'enterPassword' })}
              />
              <FormHelperText>
                {touched.password && errors.password}
              </FormHelperText>
            </FormControl>
            <Typography
              variant="p3r"
              sx={{
                color: theme.palette.primary.main,
                paddingRight: '6px',
                textDecoration: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
              component={Link}
              href="/forgot-password"
              onClick={preventRouteWhenSubmitting}
            >
              {formatMessage({ id: 'forgotYourPassword' })}
            </Typography>
          </Box>
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
              {formatMessage({ id: 'login' })}
            </Button>
            <Typography variant="p2r">
              {formatMessage({ id: 'dontHaveAnAccount' })}
              <Typography
                variant="p2r"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  textDecoration: 'none',
                }}
                href="/register"
                component={Link}
                onClick={preventRouteWhenSubmitting}
              >
                {formatMessage({ id: 'register' })}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
