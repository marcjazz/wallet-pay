import { Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import { INavItem } from "@xafpay/types";
import Link from "next/link";


interface INavItemProps {
    navItem: INavItem,
    handleLink?: () => void
}

export function NavItem({
    navItem: { label, href },
    handleLink
}: INavItemProps) {
    const theme = useTheme()
    const isActiveItem = false; // This should be replaced with actual logic to determine if the item is active
    return (
        <Typography
            variant="h5"
            sx={{
                position: 'relative',
                '& a': {
                    textDecoration: 'none',
                    color: 'rgba(18, 25, 44, 0.6)',
                    fontFamily: 'Poppins',
                },
                '&::before': {
                    position: 'absolute',
                    content: '""',
                    height: '3px',
                    left: '0px',
                    bottom: '-5px',
                    backgroundColor: theme.palette['primary'].main,
                    width: isActiveItem ? '100%' : 0,
                    borderRadius: '5px'
                },
                '&:hover::before': {
                    transition: '0.2s',
                    width: '100%',
                }
            }}
        >
            <Link
                href={href}
                onClick={(e) => {
                    if (handleLink) {
                        e.preventDefault()
                        handleLink()
                    }
                }}
            >
                {label}
            </Link>
        </Typography>
    );
}