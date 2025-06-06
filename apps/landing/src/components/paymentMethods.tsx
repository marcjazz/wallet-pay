import { Box, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import { IPaymentMethods } from "@xafpay/types";
import Image from "next/image";
import { useIntl } from "react-intl";
import SectionTitle from "./sectionTitle";


export default function PaymentMethods() {
    const { formatMessage } = useIntl();
    const theme = useTheme();


    const paymentMethods: IPaymentMethods[] = [
        {
            link: '/assets/momo.png',
            alt: 'MTN mobile money'
        },
        {
            link: '/assets/om.png',
            alt: 'Orange money'
        },
        {
            link: '/assets/cash.png',
            alt: 'Cash money'
        },
        {
            link: '/assets/bank-deposit.png',
            alt: 'Bank deposit'
        },
    ]

    return (
        <Box sx={{
            display: 'grid',
            rowGap: 8,
            marginBottom: 7,
            width: '100%',
        }}>
            <SectionTitle color="#0E103A">
                {formatMessage({ id: 'payoutMethods' })}
            </SectionTitle>
            <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                columnGap: 7,
                width: 'fit-content',
                justifySelf: 'center',
            }}>
                {paymentMethods.map(({ link, alt }, index) => (
                    <Image
                        key={index}
                        src={link}
                        alt={alt}
                        width={100}
                        height={60}
                    />
                ))}
            </Box>
        </Box>

    )
}