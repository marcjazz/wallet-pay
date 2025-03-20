import { Menu, MenuItem, MenuList } from '@mui/material';
import { CybridAccountEntity } from '../../api/types/AccountTypes';

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
  onSelect: (account: CybridAccountEntity) => void;
  accounts: CybridAccountEntity[];
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
        {accounts.map((account) => {
          const { cybrid_account_id, currency } = account;
          return (
            <MenuItem
              key={cybrid_account_id}
              onClick={() => onSelect(account)}
              sx={{
                typography: 'button',
              }}
            >
              {`${currency}`}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
