import { Box, Chip, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import Image from "next/image";
import { useIntl } from "react-intl";
import SectionTitle from "../sectionTitle";
import TextCard from "./textCard";

export default function HowItWorks() {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    return (
        <Box
            id="howItWorks"
            sx={{
                display: 'grid',
                justifyContent: 'center',
                bgcolor: 'rgba(250, 250, 253, 1)'
            }}
        >
            <SectionTitle color='#0E103A'>
                {formatMessage({ id: 'howItWorksTitle' })}
            </SectionTitle>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                columnGap: 25,
                alignItems: 'center',
                paddingTop: 5,
            }}>
                <Image
                    src='/assets/exchangeRate.png'
                    alt='first registration step'
                    width={400}
                    height={350}
                    style={{
                        objectFit: 'contain',
                    }}
                />
                <TextCard
                    title={formatMessage({ id: 'howItWorksStep1' })}
                    description={formatMessage({ id: 'howItWorksStep1Description' })}
                    step={1}
                    positionY={36}
                />
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                columnGap: 25,
                alignItems: 'center'
            }}>
                <TextCard
                    title={formatMessage({ id: 'howItWorksStep2' })}
                    description={formatMessage({ id: 'howItWorksStep2Description' })}
                    step={2}
                    positionY={77}
                />
                <Image
                    src='/assets/preTransactionOverview.png'
                    alt='second registration step'
                    width={350}
                    height={600}
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top'
                    }}
                />

            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                columnGap: 25,
                alignItems: 'center'
            }}>
                <Image
                    src='/assets/accountBalance.png'
                    alt='first registration step'
                    width={350}
                    height={280}
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top',
                        justifySelf: 'end'
                    }}
                />
                <Box sx={{
                    display: 'grid',
                    rowGap: 2,
                    height: 'fit-content',
                    transform: 'translate(9px, -40px)'
                }}>
                    <Chip
                        label='3'
                        sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '30%',
                        }}
                    />
                    <Typography variant='h3'>
                        {formatMessage({ id: 'howItWorksStep3' })}
                    </Typography>
                    <Typography
                        variant='p1r'
                        maxWidth='25rem'
                    >
                        {formatMessage({ id: 'howItWorksStep3Description' })}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                columnGap: 25,
                alignItems: 'center'
            }}>
                <TextCard
                    title={formatMessage({ id: 'howItWorksStep4' })}
                    description={formatMessage({ id: 'howItWorksStep4Description' })}
                    step={4}
                    positionY={77}
                />
                <Image
                    src='/assets/preTransactionOverview.png'
                    alt='second registration step'
                    width={350}
                    height={600}
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top'
                    }}
                />
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                columnGap: 25,
                alignItems: 'center'
            }}>
                <Image
                    src='/assets/accountBalance.png'
                    alt='first registration step'
                    width={350}
                    height={280}
                    style={{
                        objectFit: 'contain',
                        objectPosition: 'top',
                        justifySelf: 'end'
                    }}
                />
                <TextCard
                    title={formatMessage({ id: 'howItWorksStep5' })}
                    description={formatMessage({ id: 'howItWorksStep5Description' })}
                    step={5}
                    positionY={40}
                />
            </Box>
        </Box>
    )
}