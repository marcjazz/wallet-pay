import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'react-feather';
import { useIntl } from 'react-intl';
import * as Yup from 'yup';
import BottomSheet from '../shared/BottomSheet';

interface ExternalAccount {
  external_account_id: string;
  currency: string;
  account_number: string;
}

interface DepositBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
}
export default function DepositBottomSheet({
  closeBottomSheet,
  isOpen,
}: DepositBottomSheetProps) {
  const { formatMessage } = useIntl();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExternalAccounts, setIsLoadingExternalAccounts] =
    useState<boolean>(false);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>(
    []
  );

  useEffect(() => {
    if (isOpen) {
      setIsLoadingExternalAccounts(true);
      //TODO: CALL API TO FETCH EXTERNAL ACCOUNTS
      setTimeout(() => {
        setIsLoadingExternalAccounts(false);
        setExternalAccounts([
          {
            external_account_id: '1',
            currency: 'USD',
            account_number: '****OY6U',
          },
          {
            external_account_id: '2',
            currency: 'CAD',
            account_number: '****OY6U',
          },
        ]);
      }, 3000);
    }
  }, [isOpen]);

  const validationSchema = Yup.object({
    amount: Yup.number()
      .required(formatMessage({ id: 'enterAmount' }))
      .positive(formatMessage({ id: 'invalidAmount' }))
      .integer(formatMessage({ id: 'cannotBeFraction' }))
      .min(10, formatMessage({ id: 'minAmount' })),
    selectedAccount: Yup.string()
      .required(formatMessage({ id: 'externalAccountRequired' }))
      .oneOf(
        externalAccounts.map((account) => account.external_account_id),
        formatMessage({ id: 'invalidAccount' })
      ),
  });

  const initialValues = {
    amount: 100,
    selectedAccount: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      //TODO: CALL API HERE TO SUBMIT deposit
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        closeBottomSheet();
        resetForm();
        console.log(values);
      }, 3000);
    },
  });
  const { errors, touched } = formik;

  const handleAddExternalAccount = () => {
    //TODO: call api to add external account
    alert('Feature Is Coming Soon');
  };

  return (
    <BottomSheet open={isOpen} closeBottomSheet={closeBottomSheet}>
      <Typography variant="h2">{formatMessage({ id: 'deposit' })}</Typography>

      {!isLoadingExternalAccounts && !externalAccounts.length ? (
        <Box
          sx={{
            display: 'grid',
            rowGap: 3,
          }}
        >
          <Typography
            variant="p2r"
            sx={{
              color: '#BABDBE',
              textAlign: 'center',
            }}
          >
            {formatMessage({ id: 'noExternalAccount' })}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddExternalAccount}
          >
            {formatMessage({ id: 'addExternalAccount' })}
          </Button>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: 'grid', rowGap: 6 }}
        >
          <Box sx={{ display: 'grid', rowGap: 3 }}>
            <FormControl
              error={Boolean(touched.amount && errors.amount)}
              required
              fullWidth
              disabled={isSubmitting || isLoadingExternalAccounts}
            >
              <OutlinedInput
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&.Mui-error': {
                    border: '1px solid #EE2B2B',
                  },
                  '& .MuiInputBase-input': {
                    typography: 'h3',
                    textAlign: 'end',
                  },
                  backgroundColor: 'rgba(232, 242, 255, 0.50)',
                }}
                type="number"
                {...formik.getFieldProps('amount')}
                placeholder={formatMessage({ id: 'amount' })}
                autoFocus
                startAdornment={
                  <InputAdornment position="start">
                    <Typography variant="p1m" sx={{ color: '#415058' }}>
                      {externalAccounts.find(
                        (account) =>
                          account.external_account_id ===
                          formik.values.selectedAccount
                      )?.currency ?? '...'}
                    </Typography>
                  </InputAdornment>
                }
              />
              <FormHelperText error>
                {touched.amount && errors.amount}
              </FormHelperText>
            </FormControl>

            <FormControl
              error={Boolean(touched.selectedAccount && errors.selectedAccount)}
              required
              disabled={isSubmitting || isLoadingExternalAccounts}
            >
              <FormLabel htmlFor="cybrid-account">
                {formatMessage({ id: 'selectAccount' })}
              </FormLabel>
              <Select
                id="cybrid-account"
                IconComponent={ChevronDown}
                sx={{
                  '& .MuiSelect-icon': {
                    top: 'inherit',
                  },
                }}
                {...formik.getFieldProps('selectedAccount')}
                autoFocus
              >
                {externalAccounts.map((account) => (
                  <MenuItem
                    key={account.external_account_id}
                    value={account.external_account_id}
                  >
                    {`${account.account_number} (${account.currency})`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText error>
                {touched.selectedAccount && errors.selectedAccount}
              </FormHelperText>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting || isLoadingExternalAccounts}
            type="submit"
          >
            {formatMessage({ id: 'confirm' })}
          </Button>
        </Box>
      )}
    </BottomSheet>
  );
}
