'use client';

import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useSignUp, useVerifyEmail } from '../../../api/hooks/useAuth';
import { Country, Gender, OTPUsage } from '../../../api/types/EnumTypes';
import OTPBottomSheet from '../../../components/auth/forgot-password/OTPBottomSheet';
import RegisterPartOne from '../../../components/auth/register/RegisterPartOne';
import RegisterPartTwo from '../../../components/auth/register/RegisterPartTwo';

enum Step {
  personal = 1,
  security = 2,
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  gender: Gender;
  email: string;
  dateOfBirth: string;
  USNumber: string;
}

export interface SecurityInfo {
  password: string;
  username: string;
  country: Country;
  hasAcceptedTerms: boolean;
}

export default function Register() {
  const MAX_STEPS = Object.keys(Step).filter((key) =>
    isNaN(Number(key))
  ).length;
  const MIN_STEP = 1;

  const { formatMessage } = useIntl();
  const theme = useTheme();
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

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>();
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo>();
  const { mutate: signUp, isPending: isSubmitting } = useSignUp();
  const [isConfirmEmailBottomSheetOpen, setIsConfirmEmailBottomSheetOpen] =
    useState(false);

  function submitRegister(data: SecurityInfo) {
    if (!personalInfo) return;
    //TODO: the accept terms and conditions should be added to payload
    //TODO: USE alert in case of error. will be replaced with proper notifications later
    signUp(
      {
        birthdate: personalInfo.dateOfBirth,
        country: data.country,
        email: personalInfo.email,
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        password: data.password,
        phone_number: `+1${personalInfo.USNumber}`,
        username: data.username,
        gender: personalInfo.gender,
        preferred_language: 'EN_US',
      },
      {
        onSuccess: (data) => setIsConfirmEmailBottomSheetOpen(true),
        onError: (error) => alert(error),
      }
    );
    setSecurityInfo(data);
  }

  const currentStepComponent = {
    [Step.personal]: (
      <RegisterPartOne
        handleNext={(data) => handleNextStep(() => setPersonalInfo(data))}
        personalInfo={personalInfo}
        isSubmitting={isSubmitting}
      />
    ),
    [Step.security]: (
      <RegisterPartTwo
        handleNext={(data) => handleNextStep(() => submitRegister(data))}
        handleBack={(data) => handleBackStep(() => setSecurityInfo(data))}
        securityInfo={securityInfo}
        isSubmitting={isSubmitting}
      />
    ),
  };

  const { mutate: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();
  function submitOTP(otp?: string) {
    if (!otp) return setIsConfirmEmailBottomSheetOpen(false);
    verifyEmail(
      { code: otp },
      {
        onSuccess: () => push('/'),
        onError: (error) => alert(error),
      }
    );
  }

  return (
    <>
      <OTPBottomSheet
        isOpen={isConfirmEmailBottomSheetOpen}
        isSubmitting={isVerifyingEmail}
        otpUsage={OTPUsage.VERIFY_EMAIL}
        closeBottomSheet={submitOTP}
        confirmText={formatMessage({ id: 'confirmEmail' })}
        description={formatMessage({ id: 'confirmEmailDescription' })}
        title={formatMessage({ id: 'confirmEmail' })}
      />
      <Box sx={{ display: 'grid', gap: 6, padding: '30px 16px 10px 16px' }}>
        <Box sx={{ display: 'grid', rowGap: 2.25 }}>
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
              onClick={() => setCurrentStep(Step.personal)}
              sx={{
                height: '8px',
                width: '34px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: 1.25,
              }}
            />
            <Divider
              onClick={() => {
                if (maxAccessibleStep >= Step.security)
                  setCurrentStep(Step.security);
              }}
              sx={{
                height: '8px',
                width: '34px',
                backgroundColor:
                  currentStep === Step.security
                    ? theme.palette.primary.main
                    : '#B6D6FE',
                borderRadius: 1.25,
              }}
            />
          </Box>
          <Typography variant="h1">
            {formatMessage({ id: 'registerAccountHeader' })}
            <Typography
              variant="h1"
              component="span"
              sx={{ color: theme.palette.primary.main }}
            >
              {formatMessage({ id: 'registerAccountHeader2' })}
            </Typography>
            .
          </Typography>
          <Typography variant="p1r">
            {formatMessage({ id: 'registerAccountDescription' })}
          </Typography>
        </Box>

        {currentStepComponent[currentStep]}
      </Box>
    </>
  );
}
