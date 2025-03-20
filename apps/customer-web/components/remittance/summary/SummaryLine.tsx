import { Box, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { useIntl } from 'react-intl';

interface SummaryLineProps {
  title: string;
  value: string;
  isColored?: boolean;
}
export default function SummaryLine({
  title,
  value,
  isColored = false,
}: SummaryLineProps) {
  const { formatMessage, formatNumber } = useIntl();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: 1,
        justifyItems: 'end',
        alignItem: 'center',
      }}
    >
      <Typography variant="p2m" color="#415058">
        {title}
      </Typography>
      <Typography
        variant={isColored ? 'p1m' : 'p2r'}
        color={isColored ? theme.palette.secondary.main : '#B1ACA5'}
      >
        {value}
      </Typography>
    </Box>
  );
}
