import { Avatar, Box, Button, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { CheckCircle } from 'react-feather';
import { useIntl } from 'react-intl';
import { getUsernameInitials } from '../../shared/utilities';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import { PhoneNetworkIcon } from './PhoneNetworkIcon';
import { Receiver } from './ReceiverStep';

interface ReceiverCardProps {
  receiver: Receiver;
  selectedPayoutMethod: SupportedPayoutMethod;
  selectedReceiver?: Receiver;
  setSelectedReceiver: (receiver?: Receiver) => void;
}
export default function RecipientCard({
  receiver,
  selectedReceiver,
  setSelectedReceiver,
  selectedPayoutMethod,
}: ReceiverCardProps) {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const isSelected = selectedReceiver?.receiver_id === receiver.receiver_id;
  return (
    <Box
      component={Button}
      variant="text"
      key={receiver.receiver_id}
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
        {/* {selectedPayoutMethod === SupportedPayoutMethod.bank ? (
          <Box sx={{ display: 'grid', rowGap: 0.5 }}>
            <Typography variant="l2r" color="#797A7B">
              {(receiver as BankReceiver)?.bank_name ??
                `${formatMessage({ id: 'bank' })}: ${formatMessage({
                  id: 'notAvailable',
                })}`}
            </Typography>

            <Typography
              variant="l3r"
              color="#797A7B"
              sx={{ textAlign: 'left' }}
            >
              {(receiver as BankReceiver)?.IBAN?.replace(
                /^([A-Z]{2})(\d{2})(\d{5})(\d{5})(\d{11})(\d{2})$/,
                '$1$2 $3 $4 $5 $6'
              ) ??
                `${formatMessage({ id: 'iban' })}: ${formatMessage({
                  id: 'notAvailable',
                })}`}
            </Typography>
          </Box>
        ) :
        ( */}
        <Box sx={{ display: 'grid', rowGap: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
              columnGap: 1,
            }}
          >
            <Typography variant="l2r" color="#797A7B">
              {`+237 ${receiver.phone_number.replace(/(.{3})(?=.)/g, '$1 ')}`}
            </Typography>
            {PhoneNetworkIcon(receiver.phone_number)}
          </Box>
          {selectedPayoutMethod === SupportedPayoutMethod.cash && (
            <Typography
              variant="l2r"
              color="#797A7B"
              sx={{ justifySelf: 'start' }}
            >
              {`${formatMessage({ id: 'nid' })} ${
                receiver.national_id_number ?? 'N/A'
              }`}
            </Typography>
          )}
        </Box>
        {/* )} */}
      </Box>
      {isSelected && <CheckCircle />}
    </Box>
  );
}
