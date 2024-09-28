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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Key } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';

interface OTPBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
}

export default function OTPBottomSheet({
  isOpen,
  closeBottomSheet,
}: OTPBottomSheetProps) {
  const { formatMessage } = useIntl();
  const { push } = useRouter();
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
        closeBottomSheet();
        resetForm();
        push('/reset-password');
        console.log(values);
      }, 3000);
    },
  });
  const { errors, touched } = formik;
  const theme = useTheme();
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
          {formatMessage({ id: 'enterYourOTP' })}
        </Typography>
        <Typography variant="p1r">
          {formatMessage({ id: 'otpDescription' })}
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
          <FormLabel htmlFor="otp">{formatMessage({ id: 'otp' })}</FormLabel>
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
            {formatMessage({ id: 'submit' })}
          </Button>
          <Button
            size="small"
            variant="text"
            disabled={isSubmitting}
            onClick={closeBottomSheet}
          >
            {formatMessage({ id: 'cancel' })}
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}
