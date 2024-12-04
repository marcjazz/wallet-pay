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
import {
  ChevronLeft as ChevronLeftIcon,
  Search as SearchIcon,
  Sliders as SlidersIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import { useTransactions } from '../../api/hooks/useTransaction';
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

  const { data: transactions, isPending: areTransactionsLoading } =
    useTransactions();

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
