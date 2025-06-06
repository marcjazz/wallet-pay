import { Box, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import Image from "next/image";
import { useIntl } from "react-intl";
import SectionTitle from "./sectionTitle";


export default function TrustSection() {
    const { formatMessage } = useIntl();
    const theme = useTheme();

    const whyTrustData = [
        {
            title: formatMessage({ id: 'speedAndReliability' }),
            description: formatMessage({ id: 'speedAndReliabilityDescription' }),
        },
        {
            title: formatMessage({ id: 'securityFirst' }),
            description: formatMessage({ id: 'securityFirstDescription' }),
        },
        {
            title: formatMessage({ id: 'competitivePrices' }),
            description: formatMessage({ id: 'competitivePriceDescription' }),
        }
    ]

    return (
        <Box sx={{
            display: 'grid',
            textAlign: 'center',
            justifyContent: 'center',
            marginBottom: '68px',
            rowGap: 8,
            bgcolor: 'rgba(250, 250, 253, 1)'
        }}>
            <SectionTitle color='#0E103A'>
                {formatMessage({ id: 'whyTrust' })}
            </SectionTitle>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                columnGap: 15,
            }}>
                {whyTrustData.map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            border: '1px solid lightgray',
                            borderRadius: '10px',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                rowGap: 3,
                                margin: 2,
                            }}>
                            <Image
                                src="/assets/speed.png"
                                alt="speed" width={150}
                                height={100}
                                style={{
                                    justifySelf: 'center'
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    lineHeight: '100%',
                                    fontFamily: 'Poppins'
                                }}
                            >
                                {item.title}
                            </Typography>
                            <Typography
                                variant="p1r"
                                width={300}
                                sx={{
                                    width: 300,
                                    fontFamily: 'Poppins',
                                    lineHeight: '143%'
                                }}
                            >
                                {item.description}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>


    )
}