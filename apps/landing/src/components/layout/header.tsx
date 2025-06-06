'use client';
import { Box, Button, Toolbar, Typography } from "@mui/material";
import { LanguageSwapper } from "@xafpay/shared";
import { INavItem } from "@xafpay/types";
import Image from "next/image";
import { NavItem } from "./NavItem";
import { useIntl } from "react-intl";

export default function Header() {
    const { formatMessage } = useIntl();


    const navItems: INavItem[] = [
        { label: formatMessage({ id: 'howItWorksTitle' }), href: '#howItWorks' },
        { label: 'FAQ', href: '#faq' },
    ];
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            height: '128px',
            padding: '24px 117.5px',
        }}>
            <Toolbar sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '100%',
            }}>
                <Image
                    src="/assets/logo.png"
                    alt="Xafpay Logo"
                    width={166}
                    height={80}
                />
                <Box
                    sx={{
                        display: 'grid',
                        columnGap: 10,
                        gridAutoFlow: 'column'
                    }}
                >
                    {navItems.map((item, index) => (
                        <NavItem key={index} navItem={item} />
                    ))}
                </Box>
                <Box sx={{
                    display: 'grid',
                    gridAutoFlow: 'column',
                    columnGap: 2,
                    alignItems: 'center',
                }}>
                    <LanguageSwapper />
                    <Button
                        variant='contained'
                        onClick={() => alert('Login clicked')}
                    >
                        <Typography variant="p2r" fontFamily='Poppins'>
                            {formatMessage({ id: 'register' })}
                        </Typography>
                    </Button>
                </Box>
            </Toolbar>
        </Box>
    )
}