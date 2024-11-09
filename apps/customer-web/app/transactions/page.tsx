'use client';

import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import SendAmountStep, {
  AmountStepData,
} from 'apps/customer-web/components/remittance/SendAmountStep';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import Footer from '../../components/layout/footer/Footer';
import ReceiverStep from 'apps/customer-web/components/remittance/ReceiverStep';
import RemittanceStepper from 'apps/customer-web/components/remittance/RemittanceStepper';

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

  const theme = useTheme();
  const { formatMessage, formatNumber } = useIntl();
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
          handleNext={(data: AmountStepData) => {
            handleNextStep(() => setAmountStepData(data));
          }}
        />
      ),
    },
    '2': {
      stepTitle: formatMessage({ id: 'selectRecipient' }),
      onStepBack: () => handleBackStep(() => {}),
      stepComponent: (
        <ReceiverStep selectedPayoutMethod={amountStepData.payoutMethod!} />
      ),
    },
    '3': {
      stepTitle: formatMessage({ id: 'transferSummary' }),
      onStepBack: () => handleBackStep(() => {}),
      stepComponent: (
        <Box>
          Hello world.
          <Typography variant="h2">This is Summary step</Typography>
        </Box>
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
