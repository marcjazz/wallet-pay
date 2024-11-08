import { Box, Button, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import BottomSheet from '../shared/BottomSheet';
import { SupportedPayoutMethod } from './SendAmountStep';
import { ArrowRight, CheckCircle } from 'react-feather';
import { useTheme } from '@xafpay/theme';

interface PayoutMethodBottomSheetProps {
  isOpen: boolean;
  closeBottomSheet: () => void;
  selectedPayoutMethod?: SupportedPayoutMethod;
  onSelect: (selectedPayoutMethod: SupportedPayoutMethod) => void;
  onNext: () => void;
}
export default function PayoutMethodBottomSheet({
  isOpen,
  closeBottomSheet,
  onSelect: selectPayoutMethod,
  selectedPayoutMethod,
  onNext,
}: PayoutMethodBottomSheetProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  return (
    <BottomSheet
      open={isOpen}
      closeBottomSheet={closeBottomSheet}
      disableSwipeToClose
    >
      <Box sx={{ display: 'grid', rowGap: 6 }}>
        <Typography variant="h2">
          {formatMessage({ id: 'selectPayoutMethod' })}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            rowGap: 2,
          }}
        >
          {Object.entries(SupportedPayoutMethod).map(([key, payoutMethod]) => (
            <Button
              key={key}
              variant={
                selectedPayoutMethod === payoutMethod ? 'contained' : 'outlined'
              }
              startIcon={
                selectedPayoutMethod === payoutMethod ? (
                  <CheckCircle size={20} />
                ) : null
              }
              onClick={() => selectPayoutMethod(payoutMethod)}
              sx={{
                transition: 'all 0.3s',
                '&.MuiButtonBase-root': {
                  ...(selectedPayoutMethod === payoutMethod
                    ? {
                        bgcolor: '#E8F2FF',
                        color: theme.palette.primary.main,
                        border: '1px solid #157CFB',
                      }
                    : {
                        color: '#B1ACA5',
                        border: '1px solid #C7C7C7',
                      }),
                },
              }}
            >
              {formatMessage({ id: `${payoutMethod}` })}
            </Button>
          ))}
        </Box>

        {selectedPayoutMethod && (
          <Button onClick={onNext} endIcon={<ArrowRight />}>
            {formatMessage({ id: 'next' })}
          </Button>
        )}
      </Box>
    </BottomSheet>
  );
}
