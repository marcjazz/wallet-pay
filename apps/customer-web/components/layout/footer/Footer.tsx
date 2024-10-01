import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@xafpay/theme';
import { usePathname, useRouter } from 'next/navigation';
import { Home as HomeIcon, User as UserIcon } from 'react-feather';
import { useIntl } from 'react-intl';
import ArrowSwap from './ArrowSwap';
import { MenuItemProps } from '../header/MenuItem';

interface FooterItem extends MenuItemProps {
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
      action: () => push('/'),
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
      action: () => push('/transactions'),
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
      action: () => push('/profile'),
      route: '/profile',
    },
  ];

  function isActiveRoute(basePath: string) {
    // Normalize the paths
    const normalizedBasePath = basePath.endsWith('/')
      ? basePath.slice(0, -1)
      : basePath;

    const isActive = pathname.startsWith(normalizedBasePath);

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
      {menuItems.map((item, index) => (
        <Box
          component={IconButton}
          size="small"
          key={index}
          sx={{
            display: 'grid',
            rowGap: 1,
            justifyItems: 'center',
          }}
          onClick={item.action}
        >
          {item.icon}
          <Typography
            variant="p3r"
            sx={{
              color: isActiveRoute(item.route)
                ? theme.palette.primary.main
                : 'black',
            }}
          >
            {item.title}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
