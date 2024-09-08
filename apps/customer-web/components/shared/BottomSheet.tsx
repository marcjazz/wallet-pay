import { Box, Dialog, DialogProps, Divider } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import React, { useRef, useState } from 'react';
import { BottomSheetTransition } from './bottom-sheet-transition';

export interface BottomSheetProps extends DialogProps {
  closeBottomSheet: () => void;
  disableSwipeToClose?: boolean;
}

export default function BottomSheet({
  closeBottomSheet,
  disableSwipeToClose = false,
  ...rest
}: BottomSheetProps) {
  const SWIPE_THRESHOLD = 10; // Minimum swipe distance to close the dialog

  const startYRef = useRef<number | null>(null); // To track the initial Y position of the touch
  const [swipeDistance, setSwipeDistance] = useState(0); // Track swipe distance

  const handleTouchStart = (event: React.TouchEvent) => {
    startYRef.current = event.touches[0].clientY; // Store initial touch position (Y axis)
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (startYRef.current !== null) {
      const currentY = event.touches[0].clientY;
      const deltaY = currentY - startYRef.current; // Calculate the distance swiped
      if (deltaY > 0) {
        setSwipeDistance(deltaY); // Update the swipe distance
      }
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (swipeDistance > SWIPE_THRESHOLD) {
      !disableSwipeToClose && closeBottomSheet(); // Close the dialog if the swipe exceeds swipe threshold
    }
    setSwipeDistance(0);
    startYRef.current = null;
  };
  const theme = useTheme();

  return (
    <Dialog
      {...rest}
      draggable
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') closeBottomSheet();
      }}
      TransitionComponent={BottomSheetTransition}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'end',
        },
        '& .MuiPaper-root': {
          margin: 0,
          padding: 2,
          width: '100%',
          transform: swipeDistance ? `translateY(${swipeDistance}px)` : 'none', // Move the dialog as the user swipes down
          transition: 'transform 0.3s ease', // Smooth transition when releasing the swipe
        },
      }}
    >
      <Box sx={{ display: 'grid', rowGap: 3 }}>
        <Divider
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            height: '5px',
            width: '50px',
            borderRadius: '8px',
            justifySelf: 'center',
            backgroundColor:
              swipeDistance > 0
                ? theme.palette.primary.main
                : theme.palette.grey[200],
          }}
        />
        <Box sx={{ display: 'grid', gap: 6 }}>{rest.children}</Box>
      </Box>
    </Dialog>
  );
}
