'use client';

import { Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import SendAmountStep from 'apps/customer-web/components/remittance/SendAmountStep';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import Footer from '../../components/layout/footer/Footer';

enum Step {
  amount = 1,
  recipient = 2,
  summary = 3,
}

export default function Transactions() {
  const MAX_STEPS = Object.keys(Step).filter((key) =>
    isNaN(Number(key))
  ).length;
  const MIN_STEP = 1;

  const theme = useTheme();
  const { formatMessage, formatNumber } = useIntl();
  const { push } = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<Step>(1);

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
            gridTemplateRows: 'auto auto 1fr',
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
                onClick={() => push('/')}
                sx={{
                  padding: 0,
                }}
              >
                <ChevronLeft color="#1F2223" />
              </IconButton>
            </Tooltip>

            <Typography variant="h3">
              {formatMessage({ id: 'sendMoney' })}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                justifyContent: 'start',
                alignItems: 'center',
                gridAutoFlow: 'column',
                columnGap: 0.5,
              }}
            >
              <Divider
                onClick={() => setCurrentStep(Step.amount)}
                sx={{
                  height: '8px',
                  width: '34px',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: 1.25,
                }}
              />
              <Divider
                onClick={() => {
                  if (maxAccessibleStep >= Step.recipient)
                    setCurrentStep(Step.recipient);
                }}
                sx={{
                  height: '8px',
                  width: '34px',
                  backgroundColor:
                    currentStep === Step.recipient
                      ? theme.palette.primary.main
                      : '#B6D6FE',
                  borderRadius: 1.25,
                }}
              />
              <Divider
                onClick={() => {
                  if (maxAccessibleStep >= Step.summary)
                    setCurrentStep(Step.summary);
                }}
                sx={{
                  height: '8px',
                  width: '34px',
                  backgroundColor:
                    currentStep === Step.summary
                      ? theme.palette.primary.main
                      : '#B6D6FE',
                  borderRadius: 1.25,
                }}
              />
            </Box>
          </Box>

          <Typography variant="h2">
            {formatMessage({ id: 'enterAmount' })}
          </Typography>

          <SendAmountStep />
        </Box>
        <Footer />
      </Box>
    </>
  );
}
