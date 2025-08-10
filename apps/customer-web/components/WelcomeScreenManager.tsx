'use client';

import { useState, useEffect } from 'react';
import WelcomeScreen from './layout/WelcomeScreen';

export default function WelcomeScreenManager() {
  const [shouldShowWelcomeScreen, setShouldShowWelcomeScreen] =
    useState(true);

  useEffect(() => {
    setShouldShowWelcomeScreen(
      !localStorage.getItem('shouldShowWelcomeScreen')
    );
  }, []);

  const handleWelcomeScreenSwipe = () => {
    setShouldShowWelcomeScreen(false);
    localStorage.setItem('shouldShowWelcomeScreen', 'false');
  };

  return shouldShowWelcomeScreen ? (
    <WelcomeScreen handleSwipe={handleWelcomeScreenSwipe} />
  ) : null;
}