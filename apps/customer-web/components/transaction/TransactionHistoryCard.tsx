import { Avatar, Box, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import Image from 'next/image';
import { AlertCircle, ArrowDown, CheckCircle, RefreshCcw } from 'react-feather';
import { useIntl } from 'react-intl';
import {
  CybridTransactionEntity,
  TransactionStatus,
  TransactionType,
} from '../../api/types';

interface TransactionHistoryCardProps {
  transaction: CybridTransactionEntity;
  handleSelectTransaction: (transaction: CybridTransactionEntity) => void;
}
export default function TransactionHistoryCard({
  handleSelectTransaction,
  transaction: {
    initial_currency_amount,
    initial_currency,
    conversion_rate,
    recipient_fullname,
    transaction_type,
  },
  transaction,
}: TransactionHistoryCardProps) {
  const theme = useTheme();
  const { formatDate, formatNumber, formatMessage } = useIntl();

  const statusIcon: Record<TransactionStatus, React.ReactNode> = {
    FAILED: <AlertCircle size={13} color={theme.palette.error.dark} />,
    STORING: <RefreshCcw color="black" size={13} />,
    REVIEWING: <RefreshCcw color="black" size={13} />,
    PENDING: <RefreshCcw color="black" size={13} />,
    COMPLETED: <CheckCircle size={13} color={theme.palette.success.dark} />,
  };

  return (
    <Box
      onClick={() => handleSelectTransaction(transaction)}
      sx={{
        display: 'grid',
        alignItems: 'center',
        gridTemplateColumns: 'auto 1fr auto',
        columnGap: 1.5,
      }}
    >
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <Avatar
          sx={{
            bgcolor:
              transaction_type === TransactionType.INSTANT_FUNDING
                ? theme.palette.secondary.main
                : theme.palette.primary.dark,
            height: '50px',
            width: '50px',
          }}
        >
          {transaction_type === TransactionType.INSTANT_FUNDING ? (
            <ArrowDown size={30} color="white" />
          ) : (
            <Image
              src="/assets/remittanceIcon.svg"
              alt="transaction"
              width={30}
              height={30}
            />
          )}
        </Avatar>
        <Avatar
          sx={{
            height: '20px',
            width: '20px',
            bgcolor: 'white',
            position: 'absolute',
            bottom: 0,
            right: '-5px',
          }}
        >
          {statusIcon[transaction.status]}
        </Avatar>
      </Box>
      <Box sx={{ display: 'grid', rowGap: 0.5 }}>
        <Typography variant="p1m">
          {transaction_type === TransactionType.INSTANT_FUNDING
            ? formatMessage({ id: transaction_type })
            : recipient_fullname}
        </Typography>
        <Typography variant="l3r" color="#797A7B">
          {formatDate(transaction.initiated_at, {
            year: '2-digit',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', rowGap: 0.5, justifyItems: 'end' }}>
        <Typography variant="h4">{`${formatNumber(
          initial_currency_amount * (conversion_rate || 1),
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} XAF`}</Typography>
        <Typography variant="l3r" color="#797A7B">
          {`${formatNumber(transaction.initial_currency_amount, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${initial_currency}`}
        </Typography>
      </Box>
    </Box>
  );
}
