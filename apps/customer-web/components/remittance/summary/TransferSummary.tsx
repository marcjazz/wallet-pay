import { Box, Button, Divider, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import OTPBottomSheet from '../../auth/forgot-password/OTPBottomSheet';
import { AmountStepData } from '../amount/SendAmountStep';
import { Receiver } from '../receiver/ReceiverStep';
import RecipientSummaryCard from './RecipientSummaryCard';
import SummaryLine from './SummaryLine';

interface TransferSummaryProps {
  amountStepData: AmountStepData;
  receiverData: Receiver;
  handleBack: () => void;
}
export default function TransferSummary({
  amountStepData,
  receiverData,
  handleBack,
}: TransferSummaryProps) {
  const { formatMessage, formatNumber } = useIntl();
  const { push } = useRouter();

  const [isConfirmTransactionOtpOpen, setIsConfirmTransactionOtpOpen] =
    useState(false);
  function submitTransaction() {
    // TODO: CALL API TO SUBMIT REMITTANCE TRANSACTION
    console.log('Submitting transaction');
    console.log(amountStepData, receiverData);
    // TODO: redirect to remittance details page
    push('/remittance/1');
  }

  return (
    <>
      <OTPBottomSheet
        isOpen={isConfirmTransactionOtpOpen}
        closeBottomSheet={(isOtpValid) => {
          setIsConfirmTransactionOtpOpen(false);
          submitTransaction();
        }}
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
                {`**** **** ${amountStepData.sendingAccount.account_number}`}
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
                amountStepData.sendingAccount.xaf_conversion_rate,
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
                  amountStepData.sendingAccount.xaf_conversion_rate,
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

        <Button onClick={() => setIsConfirmTransactionOtpOpen(true)}>
          {formatMessage({ id: 'confirmTransfer' })}
        </Button>
      </Box>
    </>
  );
}
