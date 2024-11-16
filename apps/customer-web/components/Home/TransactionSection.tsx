import { Box, Button, Typography } from '@mui/material';
import Scrollbars from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { ChevronRight as ChevronRightIcon } from 'react-feather';
import { useIntl } from 'react-intl';
import { RemittanceTransaction } from '../../app/remittance/page';
import { TransactionStatus } from '../../types';
import { SupportedPayoutMethod } from '../remittance/amount/SendAmountStep';
import TransactionList from '../transaction/TransactionList';
import { CurrencyEnum } from './MainCard';

interface TransactionSectionProps {
  openAllHistory: () => void;
}
export default function TransactionSection({
  openAllHistory,
}: TransactionSectionProps) {
  const { formatMessage } = useIntl();

  const [transactions, setTransactions] = useState<RemittanceTransaction[]>([]);
  const [areTransactionsLoading, setAreTransactionsLoading] =
    useState<boolean>(false);
  useEffect(() => {
    // TODO: CALL API TO FETCH TRANSACTIONS
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
          status: TransactionStatus.SETTLED,
        },
      ]);
    }, 3000);
  }, []);

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
