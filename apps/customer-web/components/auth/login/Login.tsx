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
import * as Yup from 'yup';
import styles from './login.module.css';

export default function Login() {
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string()
      .required('Required')
      .min(3, 'Must be at least 3 characters'),
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
      <Box sx={{ display: 'grid', rowGap: 2.5 }}>
        <Typography variant="h1">
          Access your account by
          <Typography
            variant="h1"
            component="span"
            sx={{ color: theme.palette.primary.main }}
          >
            {' '}
            logging in
          </Typography>
          .
        </Typography>
        <Typography variant="p1r">
          Enter your credentials to login and enjoy your offers{' '}
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
          Continue with Google
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
            or
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
            <FormLabel htmlFor="email">Email</FormLabel>
            <OutlinedInput
              id="email"
              {...formik.getFieldProps('email')}
              placeholder="Enter your email"
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
              <FormLabel htmlFor="password">Password</FormLabel>
              <OutlinedInput
                id="password"
                type="password"
                {...formik.getFieldProps('password')}
                placeholder="Enter your password"
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
              Forgot your password?
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
              Login
            </Button>
            <Typography variant="p2r">
              Don&rsquo;t have an account?{' '}
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
                Register
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
