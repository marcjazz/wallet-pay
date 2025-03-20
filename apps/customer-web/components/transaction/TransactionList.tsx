import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { CybridTransactionEntity } from '../../api/types';
import TransactionDetailsBottomSheet from './TransactionDetailsBottomSheet';
import TransactionHistoryCard from './TransactionHistoryCard';

interface TransactionListProps {
  transactions: CybridTransactionEntity[];
  areTransactionsLoading: boolean;
}
export default function TransactionList({
  transactions,
  areTransactionsLoading,
}: TransactionListProps) {
  const { formatMessage } = useIntl();

  const [selectedTransaction, setSelectedTransaction] =
    useState<CybridTransactionEntity>();

  return (
    <>
      {selectedTransaction && (
        <TransactionDetailsBottomSheet
          closeBottomSheet={() => setSelectedTransaction(undefined)}
          selectedTransaction={selectedTransaction}
        />
      )}
      <Box sx={{ display: 'grid', rowGap: 2 }}>
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
              handleSelectTransaction={(transaction) => {
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
