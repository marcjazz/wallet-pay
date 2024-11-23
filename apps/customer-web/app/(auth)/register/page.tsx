'use client';

import { Box, Divider, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Country, Gender } from '../../../api/types/EnumTypes';
import RegisterPartOne from '../../../components/auth/register/RegisterPartOne';
import RegisterPartTwo from '../../../components/auth/register/RegisterPartTwo';
import { useSignUp } from '../../../api/hooks/useAuth';

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

  function submitRegister(data: SecurityInfo) {
    if (!personalInfo) return;

    //TODO: CALL API HERE TO SUBMIT REGISTER
    //TODO: the accept terms and conditions should be added to payload
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
        onSuccess: (data) => console.log(data),
      }
    );
    //TODO: USE alert in case of error. will be replaced with proper notifications later
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

  return (
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

      {/* <Box
        sx={{
          display: 'grid',
          rowGap: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2.25,
          }}
        >
          <Button
            onClick={handleBackStep}
            variant="text"
            size="medium"
            sx={{ justifySelf: 'start' }}
            disabled={currentStep === MIN_STEP || isSubmitting}
            startIcon={
              <ArrowLeft
                color={
                  currentStep === MIN_STEP
                    ? theme.palette.primary.light
                    : theme.palette.primary.dark
                }
                size="24"
              />
            }
          >
            Back
          </Button>

          <Button
            onClick={handleNextStep}
            variant="contained"
            size="medium"
            sx={{ justifySelf: 'end' }}
            disabled={isSubmitting || currentStep === MAX_STEPS}
            endIcon={<ArrowRight size="24" />}
          >
            Next
          </Button>
        </Box>

        <Typography variant="p2r" sx={{ justifySelf: 'center' }}>
          {formatMessage({ id: 'dontHaveAnAccount' })}
          <Typography
            variant="p2r"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 500,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              textDecoration: 'none',
            }}
            href="/register"
            component={Link}
            onClick={preventRouteWhenSubmitting}
          >
            {formatMessage({ id: 'register' })}
          </Typography>
        </Typography>
      </Box> */}
    </Box>
  );
}
