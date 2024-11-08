import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { Scrollbars } from 'rc-scrollbars';
import { useEffect, useState } from 'react';
import { Plus, Search, Sliders } from 'react-feather';
import { useIntl } from 'react-intl';
import RecipientCard from './RecipientCard';

export interface Receiver {
  receiver_payout_info_id: string;
  fullname: string;
  phone_number: string;
  national_id_number: string;
}

export default function ReceiverStep() {
  const { formatMessage, formatNumber } = useIntl();
  const theme = useTheme();

  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [areReceiversLoading, setAreReceiversLoading] =
    useState<boolean>(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver>();

  useEffect(() => {
    setAreReceiversLoading(true);
    //TODO: CALL API TO FETCH RECEIVERS
    setTimeout(() => {
      setReceivers([
        {
          receiver_payout_info_id: '1',
          fullname: 'John Doe Mary',
          phone_number: '+237657140183',
          national_id_number: '000316122',
        },
      ]);
      setAreReceiversLoading(false);
    }, 3000);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        rowGap: 4,
        paddingBottom: 2,
      }}
    >
      <OutlinedInput
        size="small"
        inputProps={{
          inputMode: 'search',
        }}
        fullWidth
        placeholder={formatMessage({ id: 'searchName' })}
        startAdornment={
          <InputAdornment position="start">
            <Search size={20} color="#C8CDD0" />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            <Sliders size={20} color="#C8CDD0" />
          </InputAdornment>
        }
        sx={{
          '&.MuiInputBase-root': {
            borderRadius: '10px',
          },
        }}
      />
      <Scrollbars universal autoHide>
        <Box sx={{ display: 'grid', rowGap: 1 }}>
          {areReceiversLoading ? (
            <Typography
              variant="p2r"
              sx={{ color: '#BABDBE', textAlign: 'center' }}
            >
              {/* TODO: make receipients skeleton screen */}
              {formatMessage({ id: 'loadingReceivers' })}
            </Typography>
          ) : receivers.length ? (
            receivers.map((receiver) => (
              <RecipientCard
                key={receiver.receiver_payout_info_id}
                receiver={receiver}
                selectedReceiver={selectedReceiver}
                setSelectedReceiver={setSelectedReceiver}
              />
            ))
          ) : (
            <Typography
              variant="p2r"
              sx={{ color: '#BABDBE', textAlign: 'center' }}
            >
              {formatMessage({ id: 'noReceivers' })}
            </Typography>
          )}
        </Box>
      </Scrollbars>

      {!areReceiversLoading && (
        <Button variant="outlined" startIcon={<Plus />}>
          {formatMessage({ id: 'addNewReceiver' })}
        </Button>
      )}
    </Box>
  );
}
