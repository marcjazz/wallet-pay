import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useIntl } from "react-intl";

export default function ContactUsSection() {
    const { formatMessage } = useIntl();
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            justifyContent: 'center',
            width: '75rem',
            justifySelf: 'center',
            columnGap: 5,
            margin: '68px 0',
        }}>
            <Box sx={{
                display: 'grid',
                rowGap: 4,
                height: 'fit-content',
                alignSelf: 'center'
            }}>
                <Typography
                    variant='h1'
                    sx={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '48px',
                        lineHeight: '120%'
                    }}
                >
                    {formatMessage({ id: 'remittanceSolutionOnHand' })}
                </Typography>
                <Typography variant='h3' fontSize='32px'>
                    {formatMessage({ id: 'qrCodeEngagement' })}
                </Typography>
                <QRCodeSVG
                    value='https://xafpay.com'
                    style={{
                        width: '13rem',
                        height: '13rem'
                    }}
                />
            </Box>
            <Image
                src='/assets/phoneIllustration.png'
                alt='phone illustration'
                width={400}
                height={600}
                style={{
                    objectFit: 'contain'
                }}
            />
        </Box>
    )
}