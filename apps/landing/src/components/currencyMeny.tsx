import { Menu, MenuItem, MenuList, Skeleton, Typography } from '@mui/material';
import { ICurrency } from '@xafpay/types';

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
    selectItem: (val: string) => void;
    supportedCurrencies: ICurrency[];
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
                        ({ currency_acronym, currency_id }, index) => (
                            <MenuItem
                                key={index}
                                onClick={() => {
                                    selectItem(currency_id);
                                    handleClose();
                                }}
                            >
                                <Typography variant="p1m">{currency_acronym}</Typography>
                            </MenuItem>
                        )
                    )}
            </MenuList>
        </Menu>
    );
}