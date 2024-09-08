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
import { useFormik } from 'formik';
import Link from 'next/link';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Mail } from 'react-feather';

export default function EnterEmail() {
  const { formatMessage } = useIntl();
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(formatMessage({ id: 'invalidEmail' }))
      .required(formatMessage({ id: 'requiredField' })),
  });

  const initialValues = {
    email: '',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT email
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

  const preventRouteWhenSubmitting = (event: React.MouseEvent) => {
    if (isSubmitting) {
      event.preventDefault();
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 6, padding: '30px 16px 10px 16px' }}>
      <Box sx={{ display: 'grid', rowGap: 2.5 }}>
        <Typography variant="h1">
          {formatMessage({ id: 'forgotYourPassword' })}
        </Typography>
        <Typography variant="p1r">
          {formatMessage({ id: 'forgotPasswordDescription' })}
        </Typography>
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
            startAdornment={
              <InputAdornment position="start">
                <Mail color={theme.palette.grey[200]} size={18} />
              </InputAdornment>
            }
            {...formik.getFieldProps('email')}
            placeholder={formatMessage({ id: 'enterEmail' })}
            autoFocus
          />
          <FormHelperText>{touched.email && errors.email}</FormHelperText>
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
            {formatMessage({ id: 'sendCode' })}
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
