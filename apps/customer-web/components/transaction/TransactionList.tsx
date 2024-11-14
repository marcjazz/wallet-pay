import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { RemittanceTransaction } from '../../app/remittance/[remittance_id]/page';
import TransactionDetailsBottomSheet from './TransactionDetailsBottomSheet';
import TransactionHistoryCard from './TransactionHistoryCard';

interface TransactionListProps {
  transactions: RemittanceTransaction[];
  areTransactionsLoading: boolean;
  // hadleSelectTransaction: (transaction: RemittanceTransaction) => void;
}
export default function TransactionList({
  transactions,
  areTransactionsLoading,
}: TransactionListProps) {
  const { formatMessage } = useIntl();

  const [selectedTransaction, setSelectedTransaction] =
    useState<RemittanceTransaction>();

  return (
    <>
      {selectedTransaction && (
        <TransactionDetailsBottomSheet
          closeBottomSheet={() => setSelectedTransaction(undefined)}
          selectedTransaction={selectedTransaction}
        />
      )}
      <Box>
        {areTransactionsLoading ? (
          // TODO: MAKE SKELETON SCREENS LATER
          <Typography
            variant="p2r"
            sx={{
              color: '#BABDBE',
              textAlign: 'center',
              width: '100%',
              display: 'inline-block',
            }}
          >
            {formatMessage({ id: 'loadingTransactions' })}
          </Typography>
        ) : transactions.length ? (
          transactions.map((transaction, index) => (
            <TransactionHistoryCard
              key={index}
              transaction={transaction}
              hadleSelectTransaction={(transaction: RemittanceTransaction) => {
                setSelectedTransaction(transaction);
              }}
            />
          ))
        ) : (
          <Typography
            variant="p2r"
            sx={{
              color: '#BABDBE',
              textAlign: 'center',
              width: '100%',
              display: 'inline-block',
            }}
          >
            {formatMessage({ id: 'noTransactionsYet' })}
          </Typography>
        )}
      </Box>
    </>
  );
}
