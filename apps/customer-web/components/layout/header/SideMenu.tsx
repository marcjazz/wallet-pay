import { Box, Dialog, IconButton, Tooltip, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft as ChevronLeftIcon,
  CreditCard as CreditCardIcon,
  ExternalLink as ExternalLinkIcon,
  Globe as GlobeIcon,
  Grid as GridIcon,
  Layers as LayersIcon,
  Lock as LockIcon,
} from 'react-feather';
import { useIntl } from 'react-intl';
import {
  LeftDialogTransition
} from '../../shared/dialog-transition';
import MenuItem, { MenuItemProps } from './MenuItem';

type MenuItemGroup = Record<string, MenuItemProps[]>;

interface SideMenuProps {
  isMenuOpen: boolean;
  handleClose: () => void;
}
export default function SideMenu({ isMenuOpen, handleClose }: SideMenuProps) {
  const { formatMessage } = useIntl();
  const { push } = useRouter();

  const MenuItemGroups: MenuItemGroup = {
    '1': [
      {
        title: formatMessage({ id: 'manageAccounts' }),
        icon: <GridIcon size={22} />,
        action: () => push('/accounts'),
      },
      {
        title: formatMessage({ id: 'manageExternalBankAccounts' }),
        icon: <LayersIcon size={22} />,
        action: () => push('/external-accounts'),
      },
      {
        title: formatMessage({ id: 'depositMethods' }),
        icon: <CreditCardIcon size={22} />,
        action: () => push('/deposit-methods'),
      },
    ],
    '2': [
      {
        title: formatMessage({ id: '2FactorAuthentication' }),
        icon: <LockIcon size={22} />,
        action: () => push('/2fa'),
      },
      {
        title: formatMessage({ id: 'language' }),
        icon: <GlobeIcon size={22} />,
        action: () => push('/language'),
      },
    ],
    '3': [
      {
        title: formatMessage({ id: 'contactSupport' }),
        icon: (
          <Image
            src="/assets/LogoIcon.svg"
            alt="xafpay"
            height={22}
            width={22}
          />
        ),
        action: () => open('/security', '_blank'),
      },
      {
        title: formatMessage({ id: 'aboutXafpay' }),
        icon: <ExternalLinkIcon size={22} />,
        action: () => open('https://about.xafpay.com', '_blank'),
      },
      {
        title: formatMessage({ id: 'termsAndConditions' }),
        icon: <ExternalLinkIcon size={22} />,
        action: () => open('https://terms.xafpay.com', '_blank'),
      },
    ],
  };

  return (
    <Box
      component={Dialog}
      open={isMenuOpen}
      onClose={handleClose}
      fullScreen
      TransitionComponent={LeftDialogTransition}
    >
      <Box
        sx={{
          padding: '40px 16px 0 16px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          <Tooltip title={formatMessage({ id: 'close' })} arrow>
            <IconButton onClick={handleClose} size="small">
              <ChevronLeftIcon size={24} fontWeight={900} />
            </IconButton>
          </Tooltip>
          <Typography variant="h3">{formatMessage({ id: 'menu' })}</Typography>
        </Box>

        <Box sx={{ marginTop: 4, display: 'grid', rowGap: 3 }}>
          {Object.entries(MenuItemGroups).map(([groupId, menuItemGroup]) => (
            <Box
              key={groupId}
              sx={{
                display: 'grid',
                rowGap: 2,
                '&:not(:last-child)::after': {
                  content: '""',
                  display: 'block',
                  height: '2px',
                  backgroundColor: '#E8F2FF',
                  borderRadius: '2px',
                },
              }}
            >
              {menuItemGroup.map((menuItem) => (
                <MenuItem key={menuItem.title} {...menuItem} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
