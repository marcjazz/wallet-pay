import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material';
import { useRequestOtp } from 'apps/customer-web/api/hooks/useOtp';
import { useInitiateTransfer } from 'apps/customer-web/api/hooks/useTransaction';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  CameroonRegions,
  CurrencyEntity,
  OTPUsage,
  TransferType,
} from '../../../api/types';
import OTPBottomSheet from '../../auth/forgot-password/OTPBottomSheet';
import { AmountStepData } from '../amount/SendAmountStep';
import { Receiver } from '../receiver/ReceiverStep';
import RecipientSummaryCard from './RecipientSummaryCard';
import SummaryLine from './SummaryLine';

interface TransferSummaryProps {
  amountStepData: AmountStepData;
  receiverData: Receiver;
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
        //TODO: USE alert in case of error. will be replaced with proper notifications later
        onError: (error) => alert(error.message),
      }
    );
  }

  const { mutate: initiateTransfer, isPending: isInitiatingTransfer } =
    useInitiateTransfer();
  function submitTransfer(otp: string) {
    if (!transferOtpId) return setIsConfirmTransactionOtpOpen(false);
    initiateTransfer(
      {
        otp: {
          code: otp,
          otp_id: transferOtpId,
        },
        transfer_type: TransferType.BOOK,
        amount: amountStepData.sendingAmount,
        currency: amountStepData.sendingAccount.currency,
        cybrid_source_account_id:
          amountStepData.sendingAccount.cybrid_account_id,
        receiver: {
          address: {
            city: 'Douala',
            street: 'Bonamoussadi',
            subdivision: CameroonRegions.LITTORAL,
            country_code:'CM'
          },
          fullname: receiverData.fullname,
          phone_number: receiverData.phone_number,
        },
      },
      {
        onSuccess: (data) => push(data.cybrid_transaction_id),
        //TODO: USE alert in case of error. will be replaced with proper notifications later
        onError: (error) => alert(error.message),
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
        isSubmitting={isInitiatingTransfer}
        otpUsage={OTPUsage.TRANSFER}
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
              })} = ${formatNumber(
                activeCurrency?.xaf_rate ?? 1,
                // amountStepData.sendingAccount.xaf_conversion_rate,
                {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
            />
            <SummaryLine
              title={formatMessage({ id: 'totalReceived' })}
              value={formatNumber(
                amountStepData.sendingAmount *
                  // amountStepData.sendingAccount.xaf_conversion_rate,
                  (activeCurrency?.xaf_rate ?? 1),
                {
                  style: 'currency',
                  currency: 'XAF',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
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
          disabled={isRequestingOtp || isInitiatingTransfer}
          endIcon={
            (isRequestingOtp || isInitiatingTransfer) && (
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
