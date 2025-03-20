import { Menu, MenuItem, MenuList } from '@mui/material';
import { CybridAccountEntity } from '../../../api/types/AccountTypes';

// TODO: CHECK USAGE AND REMOVE, CONNECT TO API/TYPES
export enum SUPPORTED_CURRENCY {
  usd = 'USD',
  cad = 'CAD',
}

interface ChangeCurrencyMenuProps {
  closeMenu: () => void;
  anchorEl: HTMLElement | null;
  isOpen: boolean;
  accounts: CybridAccountEntity[];
  onSelect: (selectedSendingAccount: CybridAccountEntity) => void;
}
export default function ChangeCurrencyMenu({
  anchorEl,
  isOpen,
  closeMenu,
  onSelect,
  accounts,
}: ChangeCurrencyMenuProps) {
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
        {accounts.map(({ cybrid_account_id, currency, ...rest }) => (
          <MenuItem
            key={cybrid_account_id}
            onClick={() => onSelect({ cybrid_account_id, currency, ...rest })}
            sx={{
              typography: 'button',
            }}
          >
            {currency}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
