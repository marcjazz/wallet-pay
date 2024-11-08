import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Plus, Search, Sliders } from 'react-feather';
import { useIntl } from 'react-intl';
import { Scrollbars } from 'rc-scrollbars';

interface Receiver {
  receiver_payout_info_id: string;
  fullname: string;
  phone_number: string;
  national_id_number: string;
}

export default function ReceiverStep() {
  const { formatMessage } = useIntl();

  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [areReceiversLoading, setAreReceiversLoading] =
    useState<boolean>(false);

  useEffect(() => {
    setAreReceiversLoading(true);
    //TODO: CALL API TO FETCH RECEIVERS
    setTimeout(() => {
      setReceivers([
        {
          receiver_payout_info_id: '1',
          fullname: 'John Doe',
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
          {receivers.length ? (
            receivers.map((receiver) => (
              <Box key={receiver.receiver_payout_info_id}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    alignItems: 'center',
                    columnGap: 3,
                    padding: 2,
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      rowGap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="l1r">{receiver.fullname}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="l2r">
                        {receiver.phone_number}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="l2r">
                        {receiver.national_id_number}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
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
