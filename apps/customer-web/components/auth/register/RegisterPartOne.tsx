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
import { DatePicker } from '@mui/x-date-pickers';
import { useTheme } from '@xafpay/theme';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import Link from 'next/link';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  User as UserIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { PersonalInfo } from '../../../app/(auth)/register/page';
import { preventRouteWhenSubmitting } from '../../shared/utilities';

interface RegisterPartOneProps {
  personalInfo?: PersonalInfo;
  handleNext: (data: PersonalInfo) => void;
  isSubmitting: boolean;
}
export default function RegisterPartOne({
  handleNext,
  personalInfo,
  isSubmitting,
}: RegisterPartOneProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const initialValues: PersonalInfo = {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    USNumber: '',
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required(formatMessage({ id: 'requiredField' })),
    lastName: Yup.string().required(formatMessage({ id: 'requiredField' })),
    email: Yup.string()
      .email(formatMessage({ id: 'invalidEmail' }))
      .required(formatMessage({ id: 'requiredField' })),
    dateOfBirth: Yup.date()
      .typeError(formatMessage({ id: 'invalidDateFormat' })) // Custom error message for invalid date formats
      .max(new Date(), formatMessage({ id: 'dateOfBirthCannotBeFuture' })) // Ensures the date is not after today
      .required(formatMessage({ id: 'requiredField' })),

    USNumber: Yup.string()
      .matches(
        /^(\+1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
        formatMessage({ id: 'invalidUSNumber' })
      )
      .required(formatMessage({ id: 'requiredField' })),
  });

  const formik = useFormik({
    initialValues: personalInfo ?? initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleNext(values);
      console.log(values);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ display: 'grid', rowGap: 3 }}
    >
      <Box
        sx={{
          display: 'grid',
          rowGap: 1,
        }}
      >
        <FormControl
          required
          error={Boolean(formik.touched.firstName && formik.errors.firstName)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="firstName">
            {formatMessage({ id: 'firstName' })}
          </FormLabel>
          <OutlinedInput
            id="firstName"
            startAdornment={
              <InputAdornment position="start">
                <UserIcon color={theme.palette.grey[200]} size={18} />
              </InputAdornment>
            }
            placeholder={formatMessage({ id: 'firstName' })}
            {...formik.getFieldProps('firstName')}
            autoFocus
          />
          <FormHelperText>
            {formik.touched.firstName && formik.errors.firstName}
          </FormHelperText>
        </FormControl>
        <FormControl
          required
          error={Boolean(formik.touched.lastName && formik.errors.lastName)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="lastName">
            {formatMessage({ id: 'lastName' })}
          </FormLabel>
          <OutlinedInput
            id="lastName"
            startAdornment={
              <InputAdornment position="start">
                <UserIcon color={theme.palette.grey[200]} size={18} />
              </InputAdornment>
            }
            placeholder={formatMessage({ id: 'lastName' })}
            {...formik.getFieldProps('lastName')}
          />
          <FormHelperText>
            {formik.touched.lastName && formik.errors.lastName}
          </FormHelperText>
        </FormControl>

        <FormControl
          required
          error={Boolean(formik.touched.email && formik.errors.email)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="email">
            {formatMessage({ id: 'email' })}
          </FormLabel>
          <OutlinedInput
            id="email"
            type="email"
            startAdornment={
              <InputAdornment position="start">
                <MailIcon color={theme.palette.grey[200]} size={18} />
              </InputAdornment>
            }
            placeholder={formatMessage({ id: 'email' })}
            {...formik.getFieldProps('email')}
          />
          <FormHelperText>
            {formik.touched.email && formik.errors.email}
          </FormHelperText>
        </FormControl>
        <FormControl
          required
          error={Boolean(
            formik.touched.dateOfBirth && formik.errors.dateOfBirth
          )}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="dateOfBirth">
            {formatMessage({ id: 'dateOfBirth' })}
          </FormLabel>

          <DatePicker
            {...formik.getFieldProps('dateOfBirth')}
            value={dayjs(
              formik.values.dateOfBirth
                ? new Date(formik.values.dateOfBirth)
                : new Date()
            )}
            maxDate={dayjs(new Date())}
            sx={{
              marginTop: theme.spacing(1.125),
              width: '100%',
            }}
            onChange={(newDate) => {
              if (newDate)
                formik.setFieldValue('dateOfBirth', newDate.format());
            }}
          />

          <FormHelperText>
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth}
          </FormHelperText>
        </FormControl>
        <FormControl
          required
          error={Boolean(formik.touched.USNumber && formik.errors.USNumber)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="USNumber">
            {formatMessage({ id: 'USNumber' })}
          </FormLabel>
          <OutlinedInput
            id="USNumber"
            startAdornment={
              <InputAdornment position="start">
                <PhoneIcon color={theme.palette.grey[200]} size={18} />
              </InputAdornment>
            }
            placeholder={formatMessage({ id: 'USNumber' })}
            {...formik.getFieldProps('USNumber')}
          />
          <FormHelperText>
            {formik.touched.USNumber && formik.errors.USNumber}
          </FormHelperText>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'grid',
          rowGap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2.25,
          }}
        >
          <Button
            variant="text"
            size="medium"
            sx={{ justifySelf: 'start' }}
            disabled
            startIcon={
              <ArrowLeftIcon color={theme.palette.primary.light} size="24" />
            }
          >
            {formatMessage({ id: 'back' })}
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="medium"
            sx={{ justifySelf: 'end' }}
            disabled={isSubmitting}
            endIcon={<ArrowRightIcon size="24" />}
          >
            {formatMessage({ id: 'next' })}
          </Button>
        </Box>

        <Typography variant="p2r" sx={{ justifySelf: 'center' }}>
          {formatMessage({ id: 'alreadyHaveAnAccount' })}
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
            onClick={(event) => preventRouteWhenSubmitting(event, isSubmitting)}
          >
            {formatMessage({ id: 'login' })}
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
}
