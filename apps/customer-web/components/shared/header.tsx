'use client';

import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';

interface HeaderProps {
  label: string;
}
export default function Header({ label }: HeaderProps) {
  const { formatMessage } = useIntl();
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        columnGap: 2
      }}
    >
      <Tooltip title={formatMessage({ id: 'back' })}>
        <IconButton
          size="small"
          onClick={() => router.back()}
          sx={{
            padding: 0
          }}
        >
          <ChevronLeft color="#1F2223" />
        </IconButton>
      </Tooltip>

      <Typography variant="h3">{formatMessage({ id: label })}</Typography>
    </Box>
  );
}
