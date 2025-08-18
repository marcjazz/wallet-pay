import {
  Box,
  Button,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { Scrollbars } from 'rc-scrollbars';
import { useState } from 'react';
import { Plus, Search, Sliders } from 'react-feather';
import { useIntl } from 'react-intl';
import { useReceivers } from '../../../api/hooks/useReciever';
import { CreateReceiverDto, ReceiverEntity } from '../../../api/types';
import { SupportedPayoutMethod } from '../amount/SendAmountStep';
import RecipientCard from './RecipientCard';
import RecipientDetailsBottomSheet from './RecipientDetailsBottomSheet';

export interface MomoReceiver {
  receiver_payout_info_id: string;
  fullname: string;
  phone_number: string;
  national_id_number: string;
}

export interface BankReceiver {
  receiver_payout_info_id: string;
  fullname: string;
  bank_name: string;
  IBAN: string;
}

export type Receiver = ReceiverEntity | CreateReceiverDto;
// MomoReceiver | BankReceiver;

interface ReceiverStepProps {
  selectedPayoutMethod: SupportedPayoutMethod;
  handleNext: (receiverData: ReceiverEntity) => void;
  receiverData?: ReceiverEntity;
}
export default function ReceiverStep({
  receiverData,
  selectedPayoutMethod,
  handleNext,
}: ReceiverStepProps) {
  const { formatMessage } = useIntl();
  const [hasToUpdate, setHasToUpdate] = useState<boolean>(false);

  // const [receivers, setReceivers] = useState<Receiver[]>([]);
  // const [areReceiversLoading, setAreReceiversLoading] =
  //   useState<boolean>(false);
  const [selectedReceiver, setSelectedReceiver] = useState<
    ReceiverEntity | undefined
  >(receiverData);

  // TODO: receivers will be stored based on payout method. so fetch data based on selected payout method
  const {
    data: receivers,
    isFetching: areReceiversLoading,
    refetch,
  } = useReceivers();

  // useEffect(() => {
  // setAreReceiversLoading(true);
  // TODO: CALL API TO FETCH RECEIVERS of given payout method
  // TODO:  we need to decide if we want to keep the details seperately or not (i.e. bank and momo),
  // TODO: if yes then we need to fetch the details seperately else we can fetch the details together.
  // TODO: and now we'll have to decide how to handle more data for same receiver for example, multiple bank accounts (or momo accounts) for same receiver
  // TODO: we will also have to rethink the ui wrt the user presentation. (how do we show bank details? do we show them alongside the momo? how?)
  // setTimeout(() => {
  // setReceivers([
  //   {
  //     receiver_payout_info_id: '1',
  //     fullname: 'John Doe Mary',
  //     phone_number: '657140183',
  //     national_id_number: '000316122',
  //   },
  // ]);
  // setAreReceiversLoading(false);
  // }, 3000);
  // }, []);

  const [isReceipientDetailsOpen, setIsReceipientDetailsOpen] = useState(
    !!receiverData
  );

  return (
    <>
      <RecipientDetailsBottomSheet
        isOpen={isReceipientDetailsOpen}
        closeBottomSheet={() => {
          setIsReceipientDetailsOpen(false);
          refetch();
        }}
        selectedPayoutMethod={selectedPayoutMethod}
        selectedReceiver={selectedReceiver}
        handleNext={handleNext}
        setHasToUpdate={setHasToUpdate}
        hasToUpdate={hasToUpdate}
      />
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
                  key={receiver.receiver_id}
                  receiver={receiver}
                  selectedPayoutMethod={selectedPayoutMethod}
                  selectedReceiver={selectedReceiver}
                  setSelectedReceiver={(selectedReceiver) => {
                    setSelectedReceiver(selectedReceiver);
                    if (selectedReceiver) {
                      setHasToUpdate(false);
                      setIsReceipientDetailsOpen(true);
                    }
                  }}
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
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedReceiver(undefined);
              setIsReceipientDetailsOpen(true);
            }}
            startIcon={<Plus />}
          >
            {formatMessage({ id: 'addNewReceiver' })}
          </Button>
        )}
      </Box>
    </>
  );
}
