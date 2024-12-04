import { Box, Button, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { ChevronRight as ChevronRightIcon } from 'react-feather';
import { useIntl } from 'react-intl';
import { useTransactions } from '../../api/hooks/useTransaction';
import TransactionList from '../transaction/TransactionList';

interface TransactionSectionProps {
  openAllHistory: () => void;
}
export default function TransactionSection({
  openAllHistory,
}: TransactionSectionProps) {
  const { formatMessage } = useIntl();

  const { data: transactions, isPending: areTransactionsLoading } =
    useTransactions();

  return (
    <Box sx={{ display: 'grid', rowGap: 2, gridTemplateRows: 'auto 1fr' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
        }}
      >
        <Typography variant="l1r" sx={{ color: '#8E9090' }}>
          {formatMessage({ id: 'transactions' })}
        </Typography>
        <Button
          variant="text"
          endIcon={<ChevronRightIcon size={20} />}
          sx={{
            typography: 'l1r',
            padding: 0,
          }}
          onClick={openAllHistory}
        >
          {formatMessage({ id: 'seeAll' })}
        </Button>
      </Box>

      <Scrollbars universal autoHide>
        <TransactionList
          transactions={transactions}
          areTransactionsLoading={areTransactionsLoading}
        />
      </Scrollbars>
    </Box>
  );
}
