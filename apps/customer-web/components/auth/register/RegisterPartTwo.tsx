import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useFormik } from 'formik';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { Country } from '../../../api/types';
import { SecurityInfo } from '../../../app/(auth)/register/page';
import { preventRouteWhenSubmitting } from '../../shared/utilities';

interface RegisterPartTwoProps {
  securityInfo?: SecurityInfo;
  handleBack: (data: SecurityInfo) => void;
  handleNext: (data: SecurityInfo) => void;
  isSubmitting: boolean;
}
export default function RegisterPartTwo({
  handleNext,
  handleBack,
  securityInfo,
  isSubmitting,
}: RegisterPartTwoProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const initialValues: SecurityInfo = {
    password: '',
    username: '',
    country: Country.USA,
    hasAcceptedTerms: false,
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .min(3, formatMessage({ id: 'minPasswordCharacters' })),
    username: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .min(3, formatMessage({ id: 'minUsernameCharacters' })),
    country: Yup.string()
      .required(formatMessage({ id: 'requiredField' }))
      .oneOf(Object.values(Country)),
    hasAcceptedTerms: Yup.boolean().oneOf(
      [true],
      formatMessage({ id: 'acceptTerms' })
    ),
  });

  const formik = useFormik({
    initialValues: securityInfo ?? initialValues,
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
          error={Boolean(formik.touched.username && formik.errors.username)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="username">
            {formatMessage({ id: 'username' })}
          </FormLabel>
          <OutlinedInput
            id="username"
            placeholder={formatMessage({ id: 'username' })}
            {...formik.getFieldProps('username')}
            autoFocus
          />
          <FormHelperText>
            {formik.touched.username && formik.errors.username}
          </FormHelperText>
        </FormControl>
        <FormControl
          required
          error={Boolean(formik.touched.password && formik.errors.password)}
          disabled={isSubmitting}
        >
          <FormLabel htmlFor="password">
            {formatMessage({ id: 'password' })}
          </FormLabel>
          <OutlinedInput
            id="password"
            type="password"
            placeholder={formatMessage({ id: 'password' })}
            {...formik.getFieldProps('password')}
          />
          <FormHelperText>
            {formik.touched.password && formik.errors.password}
          </FormHelperText>
        </FormControl>

        <FormControl
          required
          error={Boolean(formik.touched.country && formik.errors.country)}
          disabled
        >
          <FormLabel htmlFor="country">
            {formatMessage({ id: 'country' })}
          </FormLabel>
          <OutlinedInput
            id="country"
            type="country"
            startAdornment={
              <InputAdornment position="start">
                <Image src="/assets/usa.svg" alt="USA" height={16} width={16} />
              </InputAdornment>
            }
            placeholder={formatMessage({ id: 'country' })}
            {...formik.getFieldProps('country')}
          />
          <FormHelperText>
            {formik.touched.country && formik.errors.country}
          </FormHelperText>
        </FormControl>
        <FormControl
          required
          error={Boolean(
            formik.touched.hasAcceptedTerms && formik.errors.hasAcceptedTerms
          )}
        >
          <FormControlLabel
            onChange={(_, checked: boolean) =>
              formik.setFieldValue('hasAcceptedTerms', checked)
            }
            control={<Checkbox checked={formik.values.hasAcceptedTerms} />}
            label={
              <Typography variant="p2r">
                {formatMessage({ id: 'accept' })}
                <Typography
                  variant="p2r"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  component="a"
                  href="https://policy.xafshop.com"
                  target="_blank"
                >
                  {formatMessage({ id: 'our' })}
                </Typography>
                {formatMessage({ id: 'and' })}
                <Typography
                  variant="p2r"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  component="a"
                  href="https://cybrid.xyz/hubfs/Legal/Cybrid_User_Agreement.pdf"
                  target="_blank"
                >
                  {formatMessage({ id: 'partners' })}
                </Typography>
                {formatMessage({ id: 'termsAndConditions2' })}
              </Typography>
            }
          />
          <FormHelperText>
            {formik.touched.hasAcceptedTerms && formik.errors.hasAcceptedTerms}
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
            onClick={() => handleBack(formik.values)}
            variant="text"
            size="medium"
            sx={{ justifySelf: 'start' }}
            disabled={isSubmitting}
            startIcon={
              <ArrowLeftIcon color={theme.palette.primary.main} size="24" />
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
            endIcon={
              isSubmitting ? (
                <CircularProgress size={20} thickness={23} />
              ) : (
                <ArrowRightIcon size="24" />
              )
            }
          >
            {formatMessage({ id: 'createAccount' })}
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
