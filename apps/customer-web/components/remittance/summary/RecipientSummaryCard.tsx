import { Avatar, Box, Button, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useIntl } from 'react-intl';
import { getUsernameInitials } from '../../shared/utilities';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import { PhoneNetworkIcon } from '../receiver/PhoneNetworkIcon';
import { Receiver } from '../receiver/ReceiverStep';

interface ReceiverCardProps {
  receiver: Receiver;
  selectedPayoutMethod: SupportedPayoutMethod;
  handleBack: () => void;
}
export default function RecipientSummaryCard({
  receiver,
  selectedPayoutMethod,
  handleBack,
}: ReceiverCardProps) {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        columnGap: 1.5,
        alignItems: 'center',
      }}
    >
      <Avatar
        sx={{
          height: '50px',
          width: '50px',
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
          fontWeight: 'bold',
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
              {(receiver as BankReceiver).bank_name}
            </Typography>

            <Typography
              variant="l3r"
              color="#797A7B"
              sx={{ textAlign: 'left' }}
            >
              {(receiver as BankReceiver).IBAN?.replace(
                /^([A-Z]{2})(\d{2})(\d{5})(\d{5})(\d{11})(\d{2})$/,
                '$1$2 $3 $4 $5 $6'
              )}
            </Typography>
          </Box>
        ) : ( */}
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
              {receiver.phone_number.replace(/(.{3})(?=.)/g, '$1 ')}
            </Typography>
            {PhoneNetworkIcon(receiver.phone_number)}
          </Box>
          {selectedPayoutMethod === SupportedPayoutMethod.cash && (
            <Typography
              variant="l2r"
              color="#797A7B"
              sx={{ justifySelf: 'start' }}
            >
              {`${formatMessage({ id: 'nid' })} ${receiver.national_id_number}`}
            </Typography>
          )}
        </Box>
        {/* )} */}
      </Box>
      <Button size="small" variant="text" onClick={handleBack}>
        {formatMessage({ id: 'change' })}
      </Button>
    </Box>
  );
}
