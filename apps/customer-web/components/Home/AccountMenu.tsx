import { Menu, MenuItem, MenuList, Typography } from '@mui/material';
import { Account } from './MainCard';

export default function AccountMenu({
  closeMenu,
  anchorEl,
  isOpen,
  onSelect,
  accounts,
}: {
  closeMenu: () => void;
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  onSelect: (selected_cybrid_account_id: string) => void;
  accounts: Account[];
}) {
  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 30,
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isOpen}
      onClose={closeMenu}
    >
      <MenuList dense disablePadding>
        {accounts.map(({ cybrid_account_id, currency }) => (
          <MenuItem
            key={cybrid_account_id}
            onClick={() => onSelect(cybrid_account_id)}
            sx={{
              typography: 'button',
            }}
          >
            {`${currency}`}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
