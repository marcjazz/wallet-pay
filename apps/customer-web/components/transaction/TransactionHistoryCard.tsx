import { Avatar, Box, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import Image from 'next/image';
import { AlertCircle, CheckCircle, RefreshCcw } from 'react-feather';
import { useIntl } from 'react-intl';
import {
  RemittanceTransaction,
  TransactionStatus,
} from '../../app/remittance/[remittance_id]/page';

interface TransactionHistoryCardProps {
  transaction: RemittanceTransaction;
  hadleSelectTransaction: (transaction: RemittanceTransaction) => void;
}
export default function TransactionHistoryCard({
  hadleSelectTransaction,
  transaction,
}: TransactionHistoryCardProps) {
  const theme = useTheme();
  const { formatDate, formatNumber } = useIntl();

  const statusIcon: Record<TransactionStatus, React.ReactNode> = {
    FAILED: <AlertCircle size={13} color={theme.palette.error.dark} />,
    PENDING: <RefreshCcw color="black" size={13} />,
    SETTLED: <CheckCircle size={13} color={theme.palette.success.dark} />,
  };

  return (
    <Box
      onClick={() => hadleSelectTransaction(transaction)}
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
            bgcolor: theme.palette.primary.dark,
            height: '50px',
            width: '50px',
          }}
        >
          <Image
            src="/assets/remittanceIcon.svg"
            alt="transaction"
            width={30}
            height={30}
          />
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
        <Typography variant="p1m">{transaction.receiver.fullname}</Typography>
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
        <Typography variant="h4">{`${formatNumber(transaction.amount_received, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} XAF`}</Typography>
        <Typography variant="l3r" color="#797A7B">
          {`${formatNumber(transaction.amount_sent, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${transaction.initial_currency}`}
        </Typography>
      </Box>
    </Box>
  );
}
