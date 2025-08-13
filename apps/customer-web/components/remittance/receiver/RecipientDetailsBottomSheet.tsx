import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import { FormikErrors, FormikTouched, useFormik } from 'formik';
import { ChevronDown } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import {
  useCreateReceiver,
  useUpdateReciever
} from '../../../api/hooks/useReciever';
import {
  CameroonRegions,
  CreateReceiverDto,
  ReceiverEntity,
} from '../../../api/types';
import BottomSheet from '../../shared/BottomSheet';
import { errorHandling } from '../../shared/errorHandling';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import { PhoneNetworkIcon } from './PhoneNetworkIcon';
import { BankReceiver, MomoReceiver, Receiver } from './ReceiverStep';

interface RecipientBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
  selectedPayoutMethod: SupportedPayoutMethod;
  selectedReceiver?: ReceiverEntity;
  handleNext: (receiverData: ReceiverEntity) => void;
  setHasToUpdate: (hasToUpdate: boolean) => void;
  hasToUpdate: boolean;
}
export default function RecipientDetailsBottomSheet({
  isOpen,
  closeBottomSheet,
  selectedPayoutMethod,
  selectedReceiver,
  handleNext,
  setHasToUpdate,
  hasToUpdate
}: RecipientBottomSheetProps) {
  const { formatMessage } = useIntl();
  const isBank = selectedPayoutMethod === SupportedPayoutMethod.bank;

  const momoInitialValues: Receiver = {
    receiver_id: (selectedReceiver as ReceiverEntity)?.receiver_id || '',
    fullname: selectedReceiver?.fullname || '',
    phone_number: selectedReceiver?.phone_number || '',
    national_id_number: selectedReceiver?.national_id_number || '',
    created_at: (selectedReceiver as ReceiverEntity)?.created_at || '',
    receiver_guid: (selectedReceiver as ReceiverEntity)?.receiver_guid || '',
    address: {
      city: '',
      street: '',
      subdivision: CameroonRegions.LITTORAL,
    },
  };

  // const bankInitialValues: BankReceiver = {
  //   receiver_payout_info_id: selectedReceiver?.receiver_id || '',
  //   fullname: selectedReceiver?.fullname || '',
  //   bank_name: selectedReceiver?.bank_name || '',
  //   IBAN: (selectedReceiver as BankReceiver)?.IBAN || '',
  // };

  const addressSchema = Yup.object().shape(
    {
      city: Yup.string().required(formatMessage({ id: 'requiredField' })),
      street: Yup.string().required(formatMessage({ id: 'requiredField' })),
      subdivision: Yup.string()
        .required(formatMessage({ id: 'requiredField' }))
        .oneOf(
          Object.values(CameroonRegions),
          formatMessage({ id: 'invalidCountry' })
        ),
    }
    //   {
    //   city: Yup.string().required('City is required'),
    //   street: Yup.string().required('Street is required'),
    //   subdivision: Yup.string()
    //     .oneOf([CameroonRegions.LITTORAL], 'Invalid subdivision')
    //     .required('Subdivision is required'),
    // }
  );

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required(formatMessage({ id: 'requiredField' })),
    // ...(isBank
    //   ? {
    //       bank_name: Yup.string().required(
    //         formatMessage({ id: 'requiredField' })
    //       ),
    //       IBAN: Yup.string()
    //         .min(27, formatMessage({ id: '27Characters' }))
    //         .max(27, formatMessage({ id: '27Characters' }))
    //         .matches(
    //           /^CM\d{2}\d{5}\d{5}\d{11}\d{2}$/,
    //           formatMessage({ id: 'invalidIBAN' })
    //         )
    //         .required('Required field'),
    //     }
    //   :
    // {
    national_id_number: Yup.string()
      .min(9, formatMessage({ id: '9CharactersMin' }))
      .max(10, formatMessage({ id: '10CharactersMax' }))
      .nullable(),
    phone_number: Yup.string()
      .matches(/^(6)(5|[7-9])[0-9]{7}$/gm, '(6|2) (2|3|[5-9])x xxx xxx')
      .required(formatMessage({ id: 'requiredField' })),
    ...(selectedReceiver
      ? {}
      : {
          address: addressSchema,
        }),
  });

  const { mutate: createReceiver, isPending: isCreatingReceiver } =
    useCreateReceiver();
  const { mutate: updateReceiver, isPending: isUpdatingReceiver } =
    useUpdateReciever();

  const formik = useFormik({
    // initialValues: isBank ? bankInitialValues : momoInitialValues,
    initialValues: momoInitialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (selectedReceiver && !hasToUpdate) {
        handleNext({
          ...(values as ReceiverEntity),
          phone_number: values.phone_number,
        });
        resetForm();
      } else if (selectedReceiver && hasToUpdate) {
        updateReceiver(
          {
            ...values,
            phone_number: `+237${values.phone_number}`,
            address: {
              ...(values as CreateReceiverDto).address,
              country_code: 'CM'
            }
          },
          {
            onSuccess: (data) => {
              handleNext({
                ...data,
                phone_number: data.phone_number.split('+237')[1]
              });
              resetForm();
            },
            onError: (error) => {
              errorHandling({ error, formatMessage });
            }
          }
        );
      } else {
        createReceiver(
          {
            fullname: values.fullname,
            phone_number: `+237${values.phone_number}`,
            national_id_number: values.national_id_number,
            address: {
              ...(values as CreateReceiverDto).address,
              country_code: 'CM',
            },
          },
          {
            onSuccess: (data) => {
              handleNext({
                ...data,
                phone_number: data.phone_number.split('+237')[1],
              });
              resetForm();
            },
            onError: (error) => {
              errorHandling({ error, formatMessage });
            },
          }
        );
      }
    },
  });

  const { touched, errors, values } = formik;
  const isVerificationPassed =
    selectedReceiver && selectedReceiver?.verification_status !== 'PASSED';
  return (
    <BottomSheet open={isOpen} closeBottomSheet={closeBottomSheet}>
      <Typography variant="h2">
        {formatMessage({
          id: isBank ? 'receiversBankDetails' : 'receiversDetails',
        })}
      </Typography>

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: 'grid', rowGap: 3 }}
        id="recipient-details-form"
      >
        {isBank ? (
          <>
            <FormControl
              error={Boolean(
                (touched as FormikTouched<BankReceiver>).bank_name &&
                  (errors as FormikErrors<BankReceiver>).bank_name
              )}
              required
              fullWidth
            >
              <FormLabel htmlFor="bank_name">
                {formatMessage({ id: 'bankName' })}
              </FormLabel>
              <OutlinedInput
                id="bank_name"
                {...formik.getFieldProps('bank_name')}
                placeholder={formatMessage({ id: 'bankName' })}
              />
              <FormHelperText error>
                {(touched as FormikTouched<BankReceiver>).bank_name &&
                  (errors as FormikErrors<BankReceiver>).bank_name}
              </FormHelperText>
            </FormControl>

            <FormControl
              error={Boolean(touched.fullname && errors.fullname)}
              required
              fullWidth
            >
              <FormLabel htmlFor="fullname">
                {formatMessage({ id: 'holdersName' })}
              </FormLabel>
              <OutlinedInput
                id="fullname"
                {...formik.getFieldProps('fullname')}
                placeholder={formatMessage({ id: 'holdersName' })}
              />
              <FormHelperText error>
                {touched.fullname && errors.fullname}
              </FormHelperText>
            </FormControl>

            <FormControl
              error={Boolean(
                (touched as FormikTouched<BankReceiver>).IBAN &&
                  (errors as FormikErrors<BankReceiver>).IBAN
              )}
              required
              fullWidth
            >
              <FormLabel htmlFor="IBAN">
                {formatMessage({ id: 'IBANNumber' })}
              </FormLabel>
              <OutlinedInput
                id="IBAN"
                {...formik.getFieldProps('IBAN')}
                placeholder={'CMxx xxxxx xxxxx xxxx xxxx xxx xx'}
              />
              <FormHelperText error>
                {(touched as FormikTouched<BankReceiver>).IBAN &&
                  (errors as FormikErrors<BankReceiver>).IBAN}
              </FormHelperText>
            </FormControl>
          </>
        ) : (
          <>
            <Box sx={{
              display: 'grid',
              rowGap: 1
            }}>
              <Typography
                variant="p2r"
                color='#63757f'
              >
                {formatMessage({ id: 'momoWarningNumber' })}
              </Typography>
              <FormControl
                error={Boolean(
                  (touched as FormikTouched<MomoReceiver>).phone_number &&
                  (errors as FormikErrors<MomoReceiver>).phone_number
                )}
                required
                fullWidth
              >
                <FormLabel htmlFor="phone_number">
                  {formatMessage({ id: 'phoneNumber' })}
                </FormLabel>
                <OutlinedInput
                  id="phone_number"
                  {...formik.getFieldProps('phone_number')}
                  placeholder={formatMessage({ id: 'phoneNumber' })}
                  autoFocus
                  startAdornment={
                    <InputAdornment position="start">+237</InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      {values.phone_number &&
                        PhoneNetworkIcon(values.phone_number)}
                    </InputAdornment>
                  }
                />
                <FormHelperText error>
                  {(touched as FormikTouched<MomoReceiver>).phone_number &&
                    (errors as FormikErrors<MomoReceiver>).phone_number}
                </FormHelperText>
              </FormControl>
            </Box>
            <Box sx={{
              display: 'grid',
              rowGap: 1
            }}>
              <Typography
                variant="p2r"
                color='#63757f'
              >
                {formatMessage({ id: 'receiverNameWarning' })}
              </Typography>
              <FormControl
                error={Boolean(touched.fullname && errors.fullname)}
                required
                fullWidth
                disabled={!!selectedReceiver && !hasToUpdate}
              >
                <FormLabel htmlFor="fullname">
                  {formatMessage({ id: 'fullname' })}
                </FormLabel>
                <OutlinedInput
                  id="fullname"
                  {...formik.getFieldProps('fullname')}
                  placeholder={formatMessage({ id: 'fullname' })}
                />
                <FormHelperText error>
                  {touched.fullname && errors.fullname}
                </FormHelperText>
              </FormControl>
            </Box>

            {(!selectedReceiver || hasToUpdate) && (
              <>
                <FormControl
                  error={Boolean(
                    (touched as FormikTouched<CreateReceiverDto>).address
                      ?.subdivision &&
                      (errors as FormikErrors<CreateReceiverDto>).address
                        ?.subdivision
                  )}
                  required
                >
                  <FormLabel htmlFor="region">
                    {formatMessage({ id: 'selectRegion' })}
                  </FormLabel>
                  <Select
                    id="region"
                    IconComponent={ChevronDown}
                    sx={{
                      '& .MuiSelect-icon': {
                        top: 'inherit',
                      },
                    }}
                    {...formik.getFieldProps('address.subdivision')}
                    autoFocus
                  >
                    {Object.entries(CameroonRegions).map(([key, value]) => (
                      <MenuItem key={value} value={value}>
                        {formatMessage({ id: key })}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText error>
                    {(touched as FormikTouched<CreateReceiverDto>).address
                      ?.subdivision &&
                      (errors as FormikErrors<CreateReceiverDto>).address
                        ?.subdivision}
                  </FormHelperText>
                </FormControl>

                <FormControl
                  error={Boolean(
                    (touched as FormikTouched<CreateReceiverDto>).address
                      ?.city &&
                      (errors as FormikErrors<CreateReceiverDto>).address?.city
                  )}
                  required
                  fullWidth
                >
                  <FormLabel htmlFor="city">
                    {formatMessage({ id: 'city' })}
                  </FormLabel>
                  <OutlinedInput
                    id="city"
                    {...formik.getFieldProps('address.city')}
                    placeholder={formatMessage({ id: 'city' })}
                  />
                  <FormHelperText error>
                    {(touched as FormikTouched<CreateReceiverDto>).address
                      ?.city &&
                      (errors as FormikErrors<CreateReceiverDto>).address?.city}
                  </FormHelperText>
                </FormControl>
                <FormControl
                  error={Boolean(
                    (touched as FormikTouched<CreateReceiverDto>).address
                      ?.street &&
                      (errors as FormikErrors<CreateReceiverDto>).address
                        ?.street
                  )}
                  required
                  fullWidth
                >
                  <FormLabel htmlFor="street">
                    {formatMessage({ id: 'street' })}
                  </FormLabel>
                  <OutlinedInput
                    id="street"
                    {...formik.getFieldProps('address.street')}
                    placeholder={formatMessage({ id: 'street' })}
                  />
                  <FormHelperText error>
                    {(touched as FormikTouched<CreateReceiverDto>).address
                      ?.street &&
                      (errors as FormikErrors<CreateReceiverDto>).address
                        ?.street}
                  </FormHelperText>
                </FormControl>
              </>
            )}

            {selectedPayoutMethod === SupportedPayoutMethod.cash && (
              <FormControl
                error={Boolean(
                  (touched as FormikTouched<MomoReceiver>).national_id_number &&
                    (errors as FormikErrors<MomoReceiver>).national_id_number
                )}
                required
                fullWidth
              >
                <FormLabel htmlFor="national_id_number">
                  {formatMessage({ id: 'nationalIdNumber' })}
                </FormLabel>
                <OutlinedInput
                  id="national_id_number"
                  {...formik.getFieldProps('national_id_number')}
                  placeholder="xxx xxx xxx"
                />
                <FormHelperText error>
                  {(touched as FormikTouched<MomoReceiver>)
                    .national_id_number &&
                    (errors as FormikErrors<MomoReceiver>).national_id_number}
                </FormHelperText>
              </FormControl>
            )}
          </>
        )}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns:
            !selectedReceiver || hasToUpdate ? '1fr' : '1fr 1fr',
          columnGap: 1
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          disabled={isCreatingReceiver}
          onClick={() => {
            setHasToUpdate(true);
          }}
          sx={{
            display: !selectedReceiver || hasToUpdate ? 'none' : 'block'
          }}
        >
          {formatMessage({ id: 'update' })}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          form="recipient-details-form"
          disabled={
            isCreatingReceiver ||
            isUpdatingReceiver ||
            (isVerificationPassed && !hasToUpdate)
          }
          endIcon={
            (isCreatingReceiver || isUpdatingReceiver) && (
              <CircularProgress size={20} thickness={23} />
            )
          }
        >
          {formatMessage({
            id: selectedReceiver && hasToUpdate ? 'update' : 'confirm'
          })}
        </Button>
      </Box>
    </BottomSheet>
  );
}
