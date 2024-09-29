import { Box, Typography } from '@mui/material';
import { ArrowRight as ArrowRightIcon } from 'react-feather';

export interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function MenuItem({ action, icon, title }: MenuItemProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        padding: '8px 0',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          columnGap: 2,
        }}
        onClick={action}
      >
        {icon}
        <Typography>{title}</Typography>
      </Box>
      <ArrowRightIcon size={22} />
    </Box>
  );
}
