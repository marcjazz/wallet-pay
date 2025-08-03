'use client';

import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { Button } from '@mui/material';
import { CloseRounded } from '@mui/icons-material'
import { useState } from 'react';

/**
 * A component that prompts the user to install the PWA.
 * It is displayed only when the app is not in standalone mode and the installation prompt is available.
 */
export function InstallPrompt() {
  const { isStandalone, deferredPrompt, handleInstall } = useInstallPrompt();
  const [isHidden, setIsHidden] = useState(false);

  /**
   * Hides the install prompt banner.
   */
  const handleDismiss = () => {
    setIsHidden(true);
  };

  // Do not show the install prompt if the app is in standalone mode,
  // if the prompt is not available, or if the user has dismissed it.
  if (isStandalone || !deferredPrompt || isHidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gray-800 p-4 text-white">
      <p className="mr-4">
        For a better experience, install the Xafpy app on your device.
      </p>
      <div className="flex items-center">
        <Button
          onClick={handleInstall}
          className="mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
          Install
        </Button>
        <Button
          onClick={handleDismiss}
          className="rounded px-4 py-2 font-bold text-white">
          <CloseRounded className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
