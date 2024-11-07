import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { usePathname, useRouter } from 'next/navigation';
import { Home as HomeIcon, User as UserIcon } from 'react-feather';
import { useIntl } from 'react-intl';
import { MenuItemProps } from '../header/MenuItem';
import ArrowSwap from './ArrowSwap';

interface FooterItem extends Omit<MenuItemProps, 'action'> {
  route: string;
}

export default function Footer() {
  const { push } = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { formatMessage } = useIntl();

  //TODO: Cleanup this datatype to catch active route based on the route
  const menuItems: FooterItem[] = [
    {
      title: formatMessage({ id: 'home' }),
      icon: (
        <HomeIcon
          size={34}
          color={isActiveRoute('/') ? theme.palette.primary.main : 'black'}
        />
      ),
      route: '/',
    },
    {
      title: formatMessage({ id: 'send' }),
      icon: (
        <ArrowSwap
          color={
            isActiveRoute('/transactions')
              ? theme.palette.primary.main
              : 'black'
          }
        />
      ),
      route: '/transactions',
    },
    {
      title: formatMessage({ id: 'profile' }),
      icon: (
        <UserIcon
          size={34}
          color={
            isActiveRoute('/profile') ? theme.palette.primary.main : 'black'
          }
        />
      ),
      route: '/profile',
    },
  ];

  function isActiveRoute(basePath: string) {
    // Normalize the paths
    const normalizedBasePath = basePath.endsWith('/')
      ? basePath.slice(0, -1)
      : basePath;

    const isActive =
      (pathname.startsWith(normalizedBasePath) && normalizedBasePath !== '')
      ||(pathname === '/' && normalizedBasePath === '');

    return isActive;
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gap: 2,
        py: 2.5,
        borderTop: '1px solid #E0E0E0',
      }}
    >
      {menuItems.map(({ icon, route, title }, index) => (
        <Box
          component={IconButton}
          size="small"
          key={index}
          sx={{
            display: 'grid',
            rowGap: 1,
            justifyItems: 'center',
          }}
          onClick={() => push(route)}
        >
          {icon}
          <Typography
            variant="p3r"
            sx={{
              color: isActiveRoute(route)
                ? theme.palette.primary.main
                : 'black',
            }}
          >
            {title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
