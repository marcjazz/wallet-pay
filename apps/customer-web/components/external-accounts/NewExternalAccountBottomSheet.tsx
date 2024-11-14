import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useState } from 'react';
import { CheckCircle } from 'react-feather';
import { useIntl } from 'react-intl';
import { CurrencyEnum } from '../Home/MainCard';
import BottomSheet from '../shared/BottomSheet';

interface NewExternalAccountBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
}
export default function NewExternalAccountBottomSheet({
  isOpen,
  closeBottomSheet,
}: NewExternalAccountBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEnum>();

  const [isConnectingToPlaid, setIsConnectingToPlaid] = useState(false);
  function addExternalAccount() {
    setIsConnectingToPlaid(true);
    setTimeout(() => {
      setIsConnectingToPlaid(false);
      closeBottomSheet();
    }, 3000);
  }

  return (
    <BottomSheet open={isOpen} closeBottomSheet={closeBottomSheet}>
      <Typography variant="h1">{`${formatMessage({
        id: 'selectBankCountry',
      })}`}</Typography>

      <FormControl>
        <RadioGroup
          name="controlled-radio-buttons-group"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value as CurrencyEnum)}
        >
          {Object.values(CurrencyEnum).map((currency) => (
            <FormControlLabel
              key={currency}
              value={currency}
              control={<Radio checkedIcon={<CheckCircle />} />}
              label={`${currency} - ${formatMessage({
                id: `${currency}Country`,
              })}`}
              sx={{
                '& .MuiTypography-root': {
                  color:
                    selectedCurrency === currency
                      ? theme.palette.primary.main
                      : 'initial',
                },
              }}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Button
        disabled={!selectedCurrency || isConnectingToPlaid}
        onClick={addExternalAccount}
        endIcon={
          isConnectingToPlaid && <CircularProgress size={20} thickness={23} />
        }
      >
        {formatMessage({ id: 'confirm' })}
      </Button>
    </BottomSheet>
  );
}
