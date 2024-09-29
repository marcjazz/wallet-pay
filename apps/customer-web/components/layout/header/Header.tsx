import { Box, IconButton, Tooltip } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import { Bell, Menu } from 'react-feather';
import { useIntl } from 'react-intl';
import SideMenu from './SideMenu';

export default function Header() {
  const { formatMessage } = useIntl();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <SideMenu
        isMenuOpen={isMenuOpen}
        handleClose={() => setIsMenuOpen(false)}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          justifyItems: 'end',
          alignItems: 'centerF',
        }}
      >
        <Image src="/assets/logo.svg" alt="Xafpay" width={34.9} height={34.9} />
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          <Bell size={24} />
          <Tooltip title={formatMessage({ id: 'menu' })} arrow>
            <IconButton size="small" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} fontWeight={900} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}
