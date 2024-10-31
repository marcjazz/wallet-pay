import { Box, Button, Typography } from '@mui/material';
import { ChevronRight as ChevronRightIcon } from 'react-feather';
import TransactionHistoryCard from '../transaction/TransactionHistoryCard';

export default function TransactionSection() {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
        }}
      >
        <Typography variant="l1r" sx={{ color: '#8E9090' }}>
          Transactions
        </Typography>
        <Button
          variant="text"
          endIcon={<ChevronRightIcon size={20} />}
          sx={{
            typography: 'l1r',
            padding: 0,
          }}
        >
          See all
        </Button>
      </Box>

      <Box>
        <TransactionHistoryCard />
      </Box>
    </Box>
  );
}
