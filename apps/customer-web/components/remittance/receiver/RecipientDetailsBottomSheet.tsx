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
import {
  CameroonRegions,
  ReceiverEntity
} from 'apps/customer-web/api/types';
import { FormikErrors, FormikTouched, useFormik } from 'formik';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import { useCreateReceiver } from '../../../api/hooks/useReciever';
import BottomSheet from '../../shared/BottomSheet';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import { PhoneNetworkIcon } from './PhoneNetworkIcon';
import { BankReceiver, MomoReceiver, Receiver } from './ReceiverStep';

interface RecipientBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
  selectedPayoutMethod: SupportedPayoutMethod;
  selectedReceiver?: ReceiverEntity;
  handleNext: (receiverData: ReceiverEntity) => void;
}
export default function RecipientDetailsBottomSheet({
  isOpen,
  closeBottomSheet,
  selectedPayoutMethod,
  selectedReceiver,
  handleNext,
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
    // }),
  });

  const { mutate: createReceiver, isPending: isCreatingReceiver } =
    useCreateReceiver();

  const formik = useFormik({
    // initialValues: isBank ? bankInitialValues : momoInitialValues,
    initialValues: momoInitialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      if (selectedReceiver) {
        handleNext({
          ...(values as ReceiverEntity),
          phone_number: values.phone_number,
        });
        resetForm();
      } else {
        createReceiver(
          {
            fullname: values.fullname,
            phone_number: `+237${values.phone_number}`,
            national_id_number: values.national_id_number,
            address: {
              city: 'Bangangte',
              street: 'Noutong',
              subdivision: CameroonRegions.LITTORAL,
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
              //TODO: USE alert in case of error. will be replaced with proper notifications later
              alert(error.message);
            },
          }
        );
      }
    },
  });

  const { touched, errors, values } = formik;

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
            <FormControl
              error={Boolean(touched.fullname && errors.fullname)}
              required
              fullWidth
              disabled={!!selectedReceiver}
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

      <Button
        type="submit"
        variant="contained"
        color="primary"
        form="recipient-details-form"
        disabled={isCreatingReceiver}
        endIcon={
          isCreatingReceiver && <CircularProgress size={20} thickness={23} />
        }
      >
        {formatMessage({ id: 'confirm' })}
      </Button>
    </BottomSheet>
  );
}
