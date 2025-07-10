'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import { useCurrencies } from '../../api/hooks/useCurrency';
import { ReceiverEntity } from '../../api/types';
import { CurrencyEnum } from '../../components/Home/MainCard';
import Footer from '../../components/layout/footer/Footer';
import SendAmountStep, {
  AmountStepData,
  SupportedPayoutMethod,
} from '../../components/remittance/amount/SendAmountStep';
import ReceiverStep, {
  Receiver,
} from '../../components/remittance/receiver/ReceiverStep';
import RemittanceStepper from '../../components/remittance/RemittanceStepper';
import TransferSummary from '../../components/remittance/summary/TransferSummary';
import { RemittanceStep, TransactionStatus } from '../../types';

export interface RemittanceTransaction {
  cybrid_transaction_id: string;
  amount_sent: number;
  amount_received: number;
  exchange_rate: number;
  transaction_fee: number;
  receiver: Receiver;
  status: TransactionStatus;
  initial_currency: CurrencyEnum;
  payout_method: SupportedPayoutMethod;
  initiated_at: string;
  settled_at?: string;
}

export default function Transactions() {
  const MAX_STEPS = Object.keys(RemittanceStep).filter((key) =>
    isNaN(Number(key))
  ).length;
  const MIN_STEP = 1;

  const params = useSearchParams();
  // Extract query parameters for amount and currency
  // If not provided, default to 100 for amount and 'USD' for currency
  const queryParams = {
    amount: Number(params.get('amount')) || 100,
    currency: params.get('currency') || 'USD',
  };

  const { formatMessage } = useIntl();
  const { data: currencies, isFetching: areCurrenciesLoading } =
    useCurrencies();
  const { push } = useRouter();
  const [currentStep, setCurrentStep] = useState<RemittanceStep>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<RemittanceStep>(1);

  function handleNextStep(storeData: () => void) {
    storeData();
    setCurrentStep((prev) => {
      const nextStep = prev + 1;

      if (nextStep > MAX_STEPS) return prev;
      if (nextStep > maxAccessibleStep) setMaxAccessibleStep(nextStep);
      return nextStep;
    });
  }

  function handleBackStep(storeData: () => void) {
    storeData();
    setCurrentStep((prev) => {
      const nextStep = prev - 1;
      if (nextStep < MIN_STEP) return prev;
      return nextStep;
    });
  }

  const [amountStepData, setAmountStepData] = useState<Partial<AmountStepData>>(
    {
      sendingAmount: queryParams.amount,
      sendingAccount: undefined,
      payoutMethod: undefined,
    }
  );
  const [recipientData, setRecipientData] = useState<ReceiverEntity>();

  const stepComponent: Record<
    RemittanceStep,
    {
      onStepBack: () => void;
      stepTitle: string;
      stepComponent: JSX.Element;
    }
  > = {
    '1': {
      stepTitle: formatMessage({ id: 'sendMoney' }),
      onStepBack: () => push('/'),
      stepComponent: (
        <SendAmountStep
          amountStepData={amountStepData}
          handleNext={(data: AmountStepData) =>
            handleNextStep(() => setAmountStepData(data))
          }
          areCurrenciesLoading={areCurrenciesLoading}
          currencies={currencies}
        />
      ),
    },
    '2': {
      stepTitle: formatMessage({ id: 'selectRecipient' }),
      onStepBack: () => handleBackStep(() => null),
      stepComponent: amountStepData.payoutMethod ? (
        <ReceiverStep
          selectedPayoutMethod={amountStepData.payoutMethod}
          receiverData={recipientData}
          handleNext={(receiverData) =>
            handleNextStep(() => setRecipientData(receiverData))
          }
        />
      ) : (
        <Typography variant="p3r">
          {formatMessage({ id: 'somethingWentWrongPleaseRefresh' })}
        </Typography>
      ),
    },
    '3': {
      stepTitle: formatMessage({ id: 'transferSummary' }),
      onStepBack: () => handleBackStep(() => null),
      stepComponent: (
        <TransferSummary
          amountStepData={amountStepData as AmountStepData}
          receiverData={recipientData as ReceiverEntity}
          handleBack={() => handleBackStep(() => null)}
          activeCurrency={currencies.find(
            (currency) =>
              currency.currency === amountStepData.sendingAccount?.currency
          )}
        />
      ),
    },
  };

  return (
    <>
      <Box
        sx={{
          height: '100%',
          display: 'grid',
          gridTemplateRows: '1fr auto',
        }}
      >
        <Box
          sx={{
            padding: 2,
            paddingBottom: 0,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            rowGap: 5,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto 1fr',
              alignItems: 'center',
              justifyItems: 'end',
              columnGap: 2,
            }}
          >
            <Tooltip title={formatMessage({ id: 'back' })}>
              <IconButton
                size="small"
                onClick={stepComponent[currentStep].onStepBack}
                sx={{
                  padding: 0,
                }}
              >
                <ChevronLeft color="#1F2223" />
              </IconButton>
            </Tooltip>

            <Typography variant="h3">
              {stepComponent[currentStep].stepTitle}
            </Typography>

            <RemittanceStepper
              currentStep={currentStep}
              maxAccessibleStep={maxAccessibleStep}
              setCurrentStep={setCurrentStep}
            />
          </Box>

          {stepComponent[currentStep].stepComponent}
        </Box>
        <Footer />
      </Box>
    </>
  );
}
