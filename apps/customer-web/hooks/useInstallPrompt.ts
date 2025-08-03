'use client';

import { useEffect, useState } from 'react';
import { BeforeInstallPromptEvent } from '..';

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is running in standalone mode.
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, [setDeferredPrompt, setIsStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      // userChoice will resolve when the user interacts with the prompt.
      await deferredPrompt.userChoice;
      // Clear the deferred prompt state regardless of the outcome.
      setDeferredPrompt(null);
    }
  };

  return { deferredPrompt, isStandalone, handleInstall };
}