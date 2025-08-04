'use client';

import { Button, Snackbar } from '@mui/material';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

/**
 * A component that prompts the user to install the PWA.
 * It is displayed only when the app is not in standalone mode and the installation prompt is available.
 */
export function InstallPrompt() {
  const { isStandalone, deferredPrompt, handleInstall } = useInstallPrompt();

  // Do not show the install prompt if the app is in standalone mode,
  // if the prompt is not available, or if the user has dismissed it.
  const open = !isStandalone && !!deferredPrompt;

  const action = (
    <Button color="primary" size="small" onClick={handleInstall}>
      Install
    </Button>
  );

  return (
    <Snackbar
      open={open}
      message="For a better experience, install the Xafpy app on your device."
      action={action}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    />
  );
}
