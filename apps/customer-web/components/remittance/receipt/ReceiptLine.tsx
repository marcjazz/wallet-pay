import { Box, Skeleton, Typography } from '@mui/material';

interface ReceiptLineProps {
  title: string;
  value: string;
  isLoading?: boolean;
}
export default function ReceiptLine({
  title,
  value,
  isLoading = false,
}: ReceiptLineProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: 1,
        alignItems: 'center',
        justifyItems: 'end',
      }}
    >
      <Typography variant="p2m">{title}</Typography>
      <Typography variant="p1r">
        {isLoading ? <Skeleton width={100} /> : value}
      </Typography>
    </Box>
  );
}
