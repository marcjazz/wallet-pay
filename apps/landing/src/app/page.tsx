'use client';

import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { IPaymentMethods } from '@xafpay/types';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import Hero from '../components/Hero';
import PageLayout from '../components/layout/pageLayout';
import TrustSection from '../components/trustSection';
import LocationSection from '../components/locationSection';
import Engagement from '../components/engagement';
import HowItWorks from '../components/howItWorks/howItWorks';
import ContactUsSection from '../components/contactUsSection';
import PaymentMethods from '../components/paymentMethods';
import Cta from '../components/cta';
import FAQ from '../components/faq';

interface IFaq {
  question: string,
  response: string
}

export default function Index() {
  const { formatMessage } = useIntl();
  const [faqQuestionsData, setFaqQuestionsData] = useState<IFaq[]>([])
  const theme = useTheme()

  const whyTrustData = [
    {
      title: formatMessage({ id: 'speedAndReliability' }),
      description: formatMessage({ id: 'speedAndReliabilityDescription' }),
    },
    {
      title: formatMessage({ id: 'securityFirst' }),
      description: formatMessage({ id: 'securityFirstDescription' }),
    },
    {
      title: formatMessage({ id: 'competitivePrices' }),
      description: formatMessage({ id: 'competitivePriceDescription' }),
    }
  ]

  const paymentMethods: IPaymentMethods[] = [
    {
      link: '/assets/momo.png',
      alt: 'MTN mobile money'
    },
    {
      link: '/assets/om.png',
      alt: 'Orange money'
    },
    {
      link: '/assets/cash.png',
      alt: 'Cash money'
    },
    {
      link: '/assets/bank-deposit.png',
      alt: 'Bank deposit'
    },
  ]
  const faqQuestions = [
    {
      question: 'What are the transaction fees on Xafpay ?',
      response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
    },
    {
      question: 'What are the transaction fees on Xafpay ?',
      response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
    },
    {
      question: 'What are the transaction fees on Xafpay ?',
      response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
    },
    {
      question: 'What are the transaction fees on Xafpay ?',
      response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
    },
  ]
  // TODO Fetch FAQ's data
  useEffect(() => (
    setFaqQuestionsData(faqQuestions)
  ), [])
  return (
    <PageLayout>
      <Hero />
      <LocationSection />
      <TrustSection />
      <Engagement />
      <HowItWorks />
      <ContactUsSection />
      <PaymentMethods />
      <Cta />
      <FAQ />
    </PageLayout>
  );
}
