import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import { Key } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import BottomSheet from '../../shared/BottomSheet';

interface OTPBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
}

export default function OTPBottomSheet({
  isOpen,
  closeBottomSheet,
}: OTPBottomSheetProps) {
  const { formatMessage } = useIntl();

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
      console.log('hello');
    },
  });
  const { errors, touched } = formik;
  const theme = useTheme();
  return (
    <BottomSheet
      open={isOpen}
      closeBottomSheet={closeBottomSheet}
      disableSwipeToClose
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
          <Button type="submit" size="medium">
            {formatMessage({ id: 'submit' })}
          </Button>
          <Button size="small" variant="text" onClick={closeBottomSheet}>
            {formatMessage({ id: 'cancel' })}
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
}
