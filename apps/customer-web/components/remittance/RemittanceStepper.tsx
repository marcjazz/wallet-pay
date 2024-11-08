import { Box, Divider } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { RemittanceStep } from 'apps/customer-web/app/transactions/page';

interface RemittanceStepperProps {
  currentStep: RemittanceStep;
  setCurrentStep: (step: RemittanceStep) => void;
  maxAccessibleStep: RemittanceStep;
}
export default function RemittanceStepper({
  currentStep,
  setCurrentStep,
  maxAccessibleStep,
}: RemittanceStepperProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'start',
        alignItems: 'center',
        gridAutoFlow: 'column',
        columnGap: 0.5,
      }}
    >
      {Object.values(RemittanceStep)
        .filter((value) => typeof value === 'number')
        .map((step) => {
          return (
            <Divider
              key={step}
              onClick={() => {
                if (step === 1) setCurrentStep(step);
                else {
                  if (maxAccessibleStep >= step) setCurrentStep(step);
                }
              }}
              sx={{
                height: '8px',
                width: '34px',
                backgroundColor:
                  currentStep >= step ? theme.palette.primary.main : '#B6D6FE',
                borderRadius: 1.25,
              }}
            />
          );
        })}
    </Box>
  );
}
