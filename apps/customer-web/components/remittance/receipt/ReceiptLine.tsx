import { Box, Typography } from '@mui/material';

interface ReceiptLineProps {
  title: string;
  value: string;
}
export default function ReceiptLine({ title, value }: ReceiptLineProps) {
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
      <Typography variant="p1r">{value}</Typography>
    </Box>
  );
}
