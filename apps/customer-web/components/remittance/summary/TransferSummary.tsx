import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRequestOtp } from '../../../api/hooks/useOtp';
import { useInitiateRemittance } from '../../../api/hooks/useTransaction';
import { CurrencyEntity, OTPUsage, ReceiverEntity } from '../../../api/types';
import OTPBottomSheet from '../../auth/forgot-password/OTPBottomSheet';
import { AmountStepData } from '../amount/SendAmountStep';
import RecipientSummaryCard from './RecipientSummaryCard';
import SummaryLine from './SummaryLine';
import { errorHandling } from '../../shared/errorHandling';

interface TransferSummaryProps {
  amountStepData: AmountStepData;
  receiverData: ReceiverEntity;
  handleBack: () => void;
  activeCurrency: CurrencyEntity | undefined;
}
export default function TransferSummary({
  amountStepData,
  receiverData,
  handleBack,
  activeCurrency,
}: TransferSummaryProps) {
  const { formatMessage, formatNumber } = useIntl();
  const { push } = useRouter();

  const [isConfirmTransactionOtpOpen, setIsConfirmTransactionOtpOpen] =
    useState(false);
  // function submitTransaction() {
  //   // TODO: CALL API TO SUBMIT REMITTANCE TRANSACTION
  //   console.log('Submitting transaction');
  //   console.log(amountStepData, receiverData);
  //   // TODO: redirect to remittance details page
  //   push('/remittance/1');
  // }

  const [transferOtpId, setTransferOtpId] = useState<string>();
  const { mutate: requestOtp, isPending: isRequestingOtp } = useRequestOtp();

  function requestTransferOtp() {
    requestOtp(
      {
        usage: OTPUsage.TRANSFER,
      },
      {
        onSuccess: (data) => {
          setTransferOtpId(data.otp_id);
          setIsConfirmTransactionOtpOpen(true);
        },
        onError: (error) => errorHandling({ error, formatMessage }),
      }
    );
  }

  const { mutate: initiateRemittance, isPending: isInitiatingRemittance } =
    useInitiateRemittance();
  function submitTransfer(otp: string) {
    if (!transferOtpId) return setIsConfirmTransactionOtpOpen(false);
    initiateRemittance(
      {
        otp: {
          code: otp,
          otp_id: transferOtpId,
        },
        amount: amountStepData.sendingAmount,
        cybrid_source_account_id:
          amountStepData.sendingAccount.cybrid_account_id,
        receiver: {
          phone_number: receiverData.phone_number,
          receiver_id: receiverData.receiver_id,
          national_id_number: receiverData.national_id_number,
        },
      },
      {
        onSuccess: (data) => push(`remittance/${data.cybrid_transaction_id}`),
        onError: (error) => errorHandling({ error, formatMessage }),
      }
    );
  }

  return (
    <>
      <OTPBottomSheet
        isOpen={isConfirmTransactionOtpOpen}
        closeBottomSheet={(otp) => {
          if (!otp) setIsConfirmTransactionOtpOpen(false);
          else submitTransfer(otp);
        }}
        otpId={transferOtpId}
        isSubmitting={isInitiatingRemittance}
        title={formatMessage({ id: 'confirmTransaction' })}
        description={formatMessage({ id: 'confirmTransactionDescription' })}
        confirmText={formatMessage({ id: 'confirm' })}
      />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2,
          gridTemplateRows: 'auto auto 1fr',
          alignItems: 'end',
          paddingBottom: 2,
        }}
      >
        <Box sx={{ display: 'grid', rowGap: 2, padding: 2 }}>
          <Typography variant="p1m" color="#B1ACA5">
            {formatMessage({ id: 'transferDestination' })}
          </Typography>
          <RecipientSummaryCard
            selectedPayoutMethod={amountStepData.payoutMethod}
            receiver={receiverData}
            handleBack={handleBack}
          />
        </Box>
        <Box
          sx={{
            padding: 2,
            border: '1px solid #E9EAEA',
            borderRadius: 1,
            display: 'grid',
            rowGap: 2,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              rowGap: 1.5,
            }}
          >
            <Typography variant="p1m" color="#B1ACA5">
              {formatMessage({ id: 'paymentInformation' })}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto auto 1fr',
                justifyItems: 'end',
                alignItems: 'center',
                columnGap: 1,
              }}
            >
              <Image
                src="/assets/LogoIcon.svg"
                alt="Xafpay icon"
                width={24}
                height={22}
              />
              <Typography variant="p2r" color="#B1ACA5">
                {`${amountStepData.sendingAccount.currency} ${formatMessage({
                  id: 'fboAccount',
                })}`}
              </Typography>
              <Typography variant="p2r" color="#B1ACA5">
                {amountStepData.sendingAccount.name}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ bgcolor: '#E9EAEA' }} />

          <Box sx={{ display: 'grid', rowGap: 1.5 }}>
            <Typography variant="p1m" color="#B1ACA5">
              {formatMessage({ id: 'paymentSummary' })}
            </Typography>

            <SummaryLine
              title={formatMessage({ id: 'amountSent' })}
              value={formatNumber(amountStepData.sendingAmount, {
                style: 'currency',
                currency: amountStepData.sendingAccount.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <SummaryLine
              title={formatMessage({ id: 'transferFees' })}
              value={formatNumber(0, {
                style: 'currency',
                currency: amountStepData.sendingAccount.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            />
            <SummaryLine
              title={formatMessage({ id: 'totalDebited' })}
              value={formatNumber(amountStepData.sendingAmount, {
                style: 'currency',
                currency: amountStepData.sendingAccount.currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              isColored
            />
            <SummaryLine
              title={formatMessage({ id: 'conversionRate' })}
              value={`${formatNumber(1, {
                style: 'currency',
                currency: amountStepData.sendingAccount.currency,
              })} = ${formatNumber(activeCurrency?.xaf_rate ?? 1, {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            />
            <SummaryLine
              title={formatMessage({ id: 'totalReceived' })}
              value={formatNumber(
                Math.floor(
                  amountStepData.sendingAmount * (activeCurrency?.xaf_rate ?? 1)
                ),
                {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }
              )}
              isColored
            />
            <SummaryLine
              title={formatMessage({ id: 'payoutMethod' })}
              value={formatMessage({ id: amountStepData.payoutMethod })}
            />
          </Box>
        </Box>

        <Button
          onClick={requestTransferOtp}
          disabled={isRequestingOtp || isInitiatingRemittance}
          endIcon={
            (isRequestingOtp || isInitiatingRemittance) && (
              <CircularProgress size={20} thickness={23} />
            )
          }
        >
          {formatMessage({ id: 'confirmTransfer' })}
        </Button>
      </Box>
    </>
  );
}
