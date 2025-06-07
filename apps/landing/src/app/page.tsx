'use client';

import ContactUsSection from '../components/contactUsSection';
import Cta from '../components/cta';
import Engagement from '../components/engagement';
import FAQ from '../components/faq';
import Functionnalities from '../components/fonctionnality/functionnalities';
import Hero from '../components/Hero';
import HowItWorks from '../components/howItWorks/howItWorks';
import PageLayout from '../components/layout/pageLayout';
import LocationSection from '../components/locationSection';
import PaymentMethods from '../components/paymentMethods';
import TrustSection from '../components/trustSection';


export default function Index() {

  return (
    <PageLayout>
      <Hero />
      <LocationSection />
      <TrustSection />
      <Engagement />
      <Functionnalities />
      <HowItWorks />
      <ContactUsSection />
      <PaymentMethods />
      <Cta />
      <FAQ />
    </PageLayout>
  );
}
