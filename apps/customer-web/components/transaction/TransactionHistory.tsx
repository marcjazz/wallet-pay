import {
  Box,
  Dialog,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Tooltip,
  Typography,
} from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import {
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon,
  Sliders as SlidersIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import { RemittanceTransaction } from '../../app/remittance/page';
import { TransactionStatus } from '../../types';
import { CurrencyEnum } from '../Home/MainCard';
import { SupportedPayoutMethod } from '../remittance/amount/SendAmountStep';
import { UpDialogTransition } from '../shared/dialog-transition';
import TransactionList from './TransactionList';

interface TransactionHistoryProps {
  isMenuOpen: boolean;
  handleClose: () => void;
}
export default function TransactionHistory({
  isMenuOpen,
  handleClose,
}: TransactionHistoryProps) {
  const { formatMessage } = useIntl();

  const [transactions, setTransactions] = useState<RemittanceTransaction[]>([]);
  const [areTransactionsLoading, setAreTransactionsLoading] =
    useState<boolean>(false);
  useEffect(() => {
    // TODO: CALL API TO FETCH TRANSACTIONS
    if (isMenuOpen) {
      setAreTransactionsLoading(true);
      setTimeout(() => {
        setAreTransactionsLoading(false);
        setTransactions([
          {
            amount_received: 28.98,
            amount_sent: 50,
            cybrid_transaction_id: '1',
            exchange_rate: 600,
            initial_currency: CurrencyEnum.USD,
            initiated_at: new Date().toISOString(),
            payout_method: SupportedPayoutMethod.bank,
            transaction_fee: 2,
            settled_at: new Date().toISOString(),

            receiver: {
              bank_name: 'UBA',
              fullname: 'John Doe',
              IBAN: 'CM2110005000031234567898764',
              national_id_number: '000316122',
              phone_number: '657140183',
              receiver_payout_info_id: '1',
            },
            status: TransactionStatus.FAILED,
          },
        ]);
      }, 3000);
    }
  }, [isMenuOpen]);

  return (
    <Dialog
      open={isMenuOpen}
      onClose={handleClose}
      fullScreen
      TransitionComponent={UpDialogTransition}
      sx={{
        '& .MuiPaper-root': {
          padding: 2,
        },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          rowGap: 5,
          gridTemplateRows: 'auto 1fr',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          <Tooltip title={formatMessage({ id: 'close' })}>
            <IconButton onClick={handleClose} size="small">
              <ChevronLeftIcon size={24} color="black" />
            </IconButton>
          </Tooltip>
          <Typography variant="h3">
            {formatMessage({ id: 'allTransactions' })}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', rowGap: 3, gridTemplateRows: 'auto 1fr' }}>
          <OutlinedInput
            size="small"
            inputProps={{
              inputMode: 'search',
            }}
            fullWidth
            placeholder={formatMessage({ id: 'searchName' })}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon size={20} color="#C8CDD0" />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <SlidersIcon size={20} color="#C8CDD0" />
              </InputAdornment>
            }
            sx={{
              '&.MuiInputBase-root': {
                borderRadius: '10px',
              },
            }}
          />

          <Scrollbars universal autoHide>
            <TransactionList
              transactions={transactions}
              areTransactionsLoading={areTransactionsLoading}
            />
          </Scrollbars>
        </Box>
      </Box>
    </Dialog>
  );
}
