import { Avatar, Box, Button, Typography } from '@mui/material';
import { CheckCircle } from 'react-feather';
import { getUsernameInitials } from '../shared/utilities';
import { useTheme } from '@xafpay/theme';
import { Receiver } from './ReceiverStep';

interface ReceiverCardProps {
  receiver: Receiver;
  selectedReceiver?: Receiver;
  setSelectedReceiver: (receiver?: Receiver) => void;
}
export default function RecipientCard({
  receiver,
  selectedReceiver,
  setSelectedReceiver,
}: ReceiverCardProps) {
  const theme = useTheme();

  const isSelected =
    selectedReceiver?.receiver_payout_info_id ===
    receiver.receiver_payout_info_id;
  return (
    <Box
      component={Button}
      variant="text"
      key={receiver.receiver_payout_info_id}
      onClick={() => {
        isSelected
          ? setSelectedReceiver(undefined)
          : setSelectedReceiver(receiver);
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        columnGap: 1,
        alignItems: 'center',
        bgcolor: isSelected ? '#DBEAFE' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? '#DBEAFE' : 'transparent',
        },
      }}
    >
      <Avatar
        sx={{
          height: '50px',
          width: '50px',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        }}
      >
        {getUsernameInitials(receiver.fullname)}
      </Avatar>
      <Box sx={{ display: 'grid', rowGap: 0.5, justifyItems: 'start' }}>
        <Typography variant="l1b" color="black">
          {receiver.fullname}
        </Typography>
        <Typography variant="p2r" color="#B1ACA5">
          {'phone_number' in receiver
            ? receiver.phone_number
            : receiver.bank_name}
        </Typography>
      </Box>
      {isSelected && <CheckCircle />}
    </Box>
  );
}
