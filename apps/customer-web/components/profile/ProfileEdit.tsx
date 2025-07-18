'use client';

import { Box, Button, CircularProgress, FormControl, FormHelperText, FormLabel, OutlinedInput, Typography, Grid } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { toast } from 'sonner';
import { UserEntity, UpdateProfileDto } from '../../api/types';
import { useUpdateProfile } from '../../api/hooks/useUser';
import { errorHandling } from '../shared/errorHandling';

interface ProfileEditProps {
  user: UserEntity;
  onSaveSuccess: () => void;
}

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  helperText?: string;
}

/**
 * Read-only field component for locked fields.
 */
function ReadOnlyField({ label, value, helperText }: ReadOnlyFieldProps) {
  const theme = useTheme();
  
  return (
    <FormControl fullWidth disabled>
      <FormLabel
        sx={{
          color: theme.palette.grey[600],
          marginBottom: '8px',
          fontSize: '14px',
        }}
      >
        {label}
      </FormLabel>
      <OutlinedInput
        value={value}
        readOnly
        sx={{
          backgroundColor: theme.palette.grey[50],
          '& .MuiOutlinedInput-input': {
            color: theme.palette.grey[600],
          },
        }}
      />
      {helperText && (
        <FormHelperText sx={{ color: theme.palette.grey[500] }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}

/**
 * Edit tab component with form for updating user information.
 */
export default function ProfileEdit({ user, onSaveSuccess }: ProfileEditProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const { mutate: updateProfile, isPending: isUpdateProfilPending } =
    useUpdateProfile();

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(formatMessage({ id: 'invalidEmail' }))
      .required(formatMessage({ id: 'requiredField' })),
    phone_number: Yup.string()
      .matches(/^\+[1-9]\d{1,14}$/, formatMessage({ id: 'invalidPhoneNumber' }))
      .required(formatMessage({ id: 'requiredField' })),
    first_name: Yup.string()
      .min(2, formatMessage({ id: 'minCharacters', values: { count: 2 } }))
      .max(50, formatMessage({ id: 'maxCharacters', values: { count: 50 } }))
      .required(formatMessage({ id: 'requiredField' })),
    last_name: Yup.string()
      .min(2, formatMessage({ id: 'minCharacters', values: { count: 2 } }))
      .max(50, formatMessage({ id: 'maxCharacters', values: { count: 50 } }))
      .required(formatMessage({ id: 'requiredField' })),
    birthdate: Yup.date()
      .max(new Date(), formatMessage({ id: 'invalidBirthdate' }))
      .required(formatMessage({ id: 'requiredField' })),
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isValid
  } = useFormik({
    initialValues: {
      email: user.email,
      phone_number: user.phone_number,
      first_name: user.first_name,
      last_name: user.last_name,
      birthdate: new Date(user.birthdate).toISOString().split('T')[0]
    },
    validationSchema,
    onSubmit: (values) => {
      const payload: UpdateProfileDto = {
        email: values.email,
        phone_number: values.phone_number,
      };

      // Only include restricted fields if user is not cybrid verified
      if (!user.cybrid_verified) {
        payload.first_name = values.first_name;
        payload.last_name = values.last_name;
        payload.birthdate = values.birthdate;
      }

      updateProfile(payload, {
        onSuccess: () => {
          toast.success(formatMessage({ id: 'profileUpdatedSuccessfully' }));
          onSaveSuccess();
        },
        onError: (error) => {
          errorHandling({ error, formatMessage });
        },
      });
    },
  });

  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: 'white',
        display: 'grid',
        rowGap: '32px'
      }}
    >
      <Typography variant="p1m" sx={{ color: 'rgba(177, 172, 165, 1)' }}>
        {formatMessage({ id: 'editInformations' })}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container direction="column" spacing={2}>
          {/* Always editable fields */}
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={!!(touched.email && errors.email)}
              disabled={isUpdateProfilPending}
            >
              <FormLabel
                htmlFor="email"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '14px'
                }}
              >
                {formatMessage({ id: 'email' })} *
              </FormLabel>
              <OutlinedInput
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={formatMessage({ id: 'enterEmail' })}
                sx={{ backgroundColor: 'white' }}
              />
              <FormHelperText>
                {touched.email && errors.email}
              </FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={!!(touched.phone_number && errors.phone_number)}
              disabled={isUpdateProfilPending}
            >
              <FormLabel
                htmlFor="phone_number"
                sx={{
                  color: theme.palette.text.primary,
                  fontSize: '14px'
                }}
              >
                {formatMessage({ id: 'phoneNumber' })} *
              </FormLabel>
              <OutlinedInput
                name="phone_number"
                type="tel"
                value={values.phone_number}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={formatMessage({ id: 'enterPhoneNumber' })}
                sx={{ backgroundColor: 'white' }}
              />
              <FormHelperText>
                {touched.phone_number && errors.phone_number}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Conditionally editable fields */}
          <Grid item xs={12} sm={6}>
            {user.cybrid_verified ? (
              <ReadOnlyField
                label={formatMessage({ id: 'firstName' })}
                value={user.first_name}
                helperText={formatMessage({ id: 'fieldLockedCybridVerified' })}
              />
            ) : (
              <FormControl
                fullWidth
                error={!!(touched.first_name && errors.first_name)}
                disabled={isUpdateProfilPending}
              >
                <FormLabel
                  htmlFor="first_name"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '14px'
                  }}
                >
                  {formatMessage({ id: 'firstName' })} *
                </FormLabel>
                <OutlinedInput
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={formatMessage({ id: 'enterFirstName' })}
                  sx={{ backgroundColor: 'white' }}
                />
                <FormHelperText>
                  {touched.first_name && errors.first_name}
                </FormHelperText>
              </FormControl>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {user.cybrid_verified ? (
              <ReadOnlyField
                label={formatMessage({ id: 'lastName' })}
                value={user.last_name}
                helperText={formatMessage({ id: 'fieldLockedCybridVerified' })}
              />
            ) : (
              <FormControl
                fullWidth
                error={!!(touched.last_name && errors.last_name)}
                disabled={isUpdateProfilPending}
              >
                <FormLabel
                  htmlFor="last_name"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '14px'
                  }}
                >
                  {formatMessage({ id: 'lastName' })} *
                </FormLabel>
                <OutlinedInput
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={formatMessage({ id: 'enterLastName' })}
                  sx={{ backgroundColor: 'white' }}
                />
                <FormHelperText>
                  {touched.last_name && errors.last_name}
                </FormHelperText>
              </FormControl>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            {user.cybrid_verified ? (
              <ReadOnlyField
                label={formatMessage({ id: 'dateOfBirth' })}
                value={new Date(user.birthdate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
                helperText={formatMessage({ id: 'fieldLockedCybridVerified' })}
              />
            ) : (
              <FormControl
                fullWidth
                error={!!(touched.birthdate && errors.birthdate)}
                disabled={isUpdateProfilPending}
              >
                <FormLabel
                  htmlFor="birthdate"
                  sx={{
                    color: theme.palette.text.primary,
                    fontSize: '14px'
                  }}
                >
                  {formatMessage({ id: 'dateOfBirth' })} *
                </FormLabel>
                <OutlinedInput
                  name="birthdate"
                  type="date"
                  value={values.birthdate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  sx={{ backgroundColor: 'white' }}
                />
                <FormHelperText>
                  {touched.birthdate && errors.birthdate}
                </FormHelperText>
              </FormControl>
            )}
          </Grid>
        </Grid>

        {/* Save button */}
        <Box sx={{ marginTop: '32px' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isUpdateProfilPending || !isValid}
            sx={{
              height: '48px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 600,
            }}
            endIcon={
              isUpdateProfilPending && (
                <CircularProgress size={20} thickness={23} />
              )
            }
          >
            {isUpdateProfilPending
              ? formatMessage({ id: 'saving' })
              : formatMessage({ id: 'saveChanges' })
            }
          </Button>
        </Box>
      </form>
    </Box>
  );
}