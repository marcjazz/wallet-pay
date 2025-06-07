import { Menu, MenuItem, MenuList, Skeleton, Typography } from '@mui/material';
import { CurrencyEntity } from '@xafpay/types';

export default function CurrencyMenu({
    anchorEl,
    open,
    handleClose,
    selectItem,
    supportedCurrencies,
    isLoading,
}: {
    anchorEl: null | HTMLElement;
    open: boolean;
    handleClose: () => void;
    selectItem: (selectedCurrency: CurrencyEntity) => void;
    supportedCurrencies: CurrencyEntity[];
    isLoading: boolean;
}) {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >
            <MenuList dense>
                {isLoading
                    ? [...new Array(3)].map((_, index) => (
                        <MenuItem key={index}>
                            <Typography variant="p1m">
                                <Skeleton animation="wave" width="20px" />
                            </Typography>
                        </MenuItem>
                    ))
                    : supportedCurrencies.map(
                        (currencyEl) => {
                            return (
                                <MenuItem
                                    key={currencyEl.supported_currency_id}
                                    onClick={() => {
                                        selectItem(currencyEl);
                                        handleClose();
                                    }}
                                >
                                    <Typography variant="p1m">{currencyEl.currency}</Typography>
                                </MenuItem>
                            )
                        }

                    )}
            </MenuList>
        </Menu>
    );
}