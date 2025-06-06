'use client';

import { Box, Divider, Typography, IconButton } from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";
import { useIntl } from "react-intl";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { QRCodeSVG } from 'qrcode.react';

interface ISocialIcon {
    icon: JSX.Element;
    link: string;
}
export default function Footer() {
    const { formatMessage } = useIntl();

    const socialIcon: ISocialIcon[] = [
        {
            icon: <TwitterIcon sx={{
                color: 'white',
                fontSize: 'inherit'
            }}
            />, link: 'https://twitter.com/xafpay'
        },
        {
            icon: <FacebookIcon sx={{
                color: 'white',
                fontSize: 'inherit'
            }}
            />, link: 'https://www.facebook.com/xafpay'
        },
        {
            icon: <InstagramIcon sx={{
                color: 'white',
                fontSize: 'inherit'
            }}
            />, link: 'https://www.instagram.com/xafpay'
        },
        {
            icon: <LinkedInIcon sx={{
                color: 'white',
                fontSize: 'inherit'
            }}
            />, link: 'https://www.linkedin.com/company/xafpay'
        },
    ]

    return (
        <Box sx={{
            display: 'grid',
            padding: '62px 118px',
            background: 'linear-gradient(to right, rgba(15, 93, 190, 1), rgba(7, 43, 88, 1))',
            color: 'white',
            rowGap: '28px',
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <Typography
                    variant="h1"
                    sx={{
                        fonstFamily: 'Space Grotesk',
                        fontSize: '48px',
                        lineHeight: '120%',
                        fontWeight: 700,
                    }}
                >
                    {formatMessage({ id: 'remittanceOnYourHands' })}
                </Typography>
                <QRCodeSVG value='https://xafpay.com' />
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: '32px',
                marginBottom: '32px',
            }}>
                <Box sx={{
                    display: 'grid',
                    rowGap: 0,
                    textAlign: 'left',
                }}>
                    <Image
                        src="/assets/logo.png"
                        alt="Xafpay Logo"
                        width={166}
                        height={80}
                    />
                    <Typography
                        variant="caption"
                        color='white'
                        fontFamily='Poppins'
                    >
                        @xafpay -
                        {dayjs('01-01-2023').format('YYYY')}
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    textAlign: 'left',
                    alignItems: 'start',
                }}>
                    <Typography
                        variant="h3"
                        marginBottom={1}
                    >
                        {formatMessage({ id: 'products' })}
                    </Typography>
                    <Typography variant="l2r">
                        {formatMessage({ id: 'xafshop' })}
                    </Typography>
                    <Typography variant="l2r">
                        {formatMessage({ id: 'xafpay' })}
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    textAlign: 'left',
                }}>
                    <Typography variant="h3" marginBottom={1}>
                        {formatMessage({ id: 'getInTouch' })}
                    </Typography>
                    <Typography variant="l2r">
                        {formatMessage({ id: 'email' })}: <a href="mailto:contact@xafpay.com">contact@xafpay.com</a>
                    </Typography>
                    <Typography variant="l2r">
                        {formatMessage({ id: 'phone' })}: +1234567890
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'grid',
                    rowGap: 1,
                    textAlign: 'left',
                    alignItems: 'end',
                }}>
                    <Typography variant="h3" marginBottom={1}>
                        {formatMessage({ id: 'ressources' })}
                    </Typography>
                    <Typography variant="l2r">
                        <a href="#">{formatMessage({ id: 'login' })}</a>
                    </Typography>
                    <Typography variant="l2r">
                        <a href="#">{formatMessage({ id: 'register' })}</a>
                    </Typography>
                    <Typography variant="l2r">
                        <a href="#">{formatMessage({ id: 'privacyPolicy' })}</a>
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <Box sx={{
                display: 'grid',
                rowGap: 4,
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, auto)',
                    width: 'fit-content',
                    columnGap: 2,
                }}>
                    {socialIcon.map(({ icon, link }, index) => (
                        <IconButton
                            size="large"
                            key={index}
                            href={link}
                            target="_blank"
                            sx={{
                                padding: 0
                            }}
                        >
                            {icon}
                        </IconButton>
                    ))}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                    {formatMessage({ id: 'ContactUsMessage' })}
                </Typography>
                <Typography variant="p2r" sx={{ textAlign: 'center' }}>
                    Copyrigth@xafpay - {dayjs().format('YYYY')}
                </Typography>
            </Box>
        </Box>
    )
}