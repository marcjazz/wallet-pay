'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import Footer from '../../components/layout/footer/Footer';
import SendAmountStep, {
  AmountStepData,
} from '../../components/remittance/amount/SendAmountStep';
import ReceiverStep, {
  Receiver,
} from '../../components/remittance/receiver/ReceiverStep';
import RemittanceStepper from '../../components/remittance/RemittanceStepper';
import TransferSummary from '../../components/remittance/summary/TransferSummary';

export enum RemittanceStep {
  amount = 1,
  recipient = 2,
  summary = 3,
}

export default function Transactions() {
  const MAX_STEPS = Object.keys(RemittanceStep).filter((key) =>
    isNaN(Number(key))
  ).length;
  const MIN_STEP = 1;

  const { formatMessage } = useIntl();
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
      sendingAmount: 100,
      sendingAccount: undefined,
      payoutMethod: undefined,
    }
  );
  const [recipientData, setRecipientData] = useState<Receiver>();

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
          receiverData={recipientData as Receiver}
          handleBack={() => handleBackStep(() => null)}
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
