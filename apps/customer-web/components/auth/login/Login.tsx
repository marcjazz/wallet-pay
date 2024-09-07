'use client';

import {
  Box,
  Button,
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
import * as Yup from 'yup';

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

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      //TODO: CALL API HERE TO SUBMIT LOGIN
      console.log(values);
    },
  });
  const { errors, touched } = formik;
  const theme = useTheme();

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
          variant="outlined"
          size="medium"
          color="inherit"
          startIcon={
            <Image
              src="/assets/google.svg"
              alt="google"
              height={24}
              width={24}
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
          <FormControl required error={!!(touched.email && errors.email)}>
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
              sx={{ color: theme.palette.primary.main, paddingRight: '6px' }}
            >
              Forgot your password?
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1.5 }}>
            <Button fullWidth size="medium" type="submit">
              Login
            </Button>
            <Typography variant="p2r">
              Don&rsquo;t have an account?
              <Typography
                variant="p2r"
                sx={{ color: theme.palette.primary.main, fontWeight: 500 }}
                component="span"
              >
                {' '}
                Register
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
