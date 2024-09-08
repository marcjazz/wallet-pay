'use client';

import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import Link from 'next/link';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

export default function ResetPassword() {
  const { formatMessage } = useIntl();
  const validationSchema = Yup.object({
    password: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .min(3, formatMessage({ id: 'minPasswordCharacters' })),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref('password')],
      formatMessage({ id: 'passwordsMustMatch' })
    ),
  });

  const initialValues = {
    password: '',
    confirmPassword: '',
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT reset password
      //TODO: USE alert in case of error. will be replaced with proper notifications later
      setIsSubmitting(true);
      setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
        console.log(values);
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
