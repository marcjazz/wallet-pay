import { Box, Tab, Tabs } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import { IFonctionnalities } from "@xafpay/types";
import { title } from "process";
import { element } from "prop-types";
import { useState } from "react";
import { useIntl } from "react-intl";
import Explanation from "./explanation";
import SectionTitle from "../sectionTitle";

export default function Functionnalities() {
    const { formatMessage } = useIntl();
    const theme = useTheme();


    const [activeTab, setActiveTab] = useState<number>(0);

    const fonctionnalitiesData: IFonctionnalities[] = [
        {
            title: formatMessage({ id: 'transactrionsHistory' }),
            image: '/assets/booking.png',
            explanations: [
                {
                    title: formatMessage({ id: 'simpleRegistration' }),
                    description: formatMessage({ id: 'registrationDescription' })
                },
                {
                    title: formatMessage({ id: 'roleChoose' }),
                    description: formatMessage({ id: 'roleDescription' })
                },

            ]
        },
        {
            title: formatMessage({ id: 'transfertBetweenUser' }),
            image: '/assets/booking.png',
            explanations: [
                {
                    title: formatMessage({ id: 'simpleRegistration' }),
                    description: formatMessage({ id: 'registrationDescription' })
                }
            ]
        },
        {
            title: formatMessage({ id: 'securePayment' }),
            image: '/assets/booking.png',
            explanations: [
                {
                    title: formatMessage({ id: 'simpleRegistration' }),
                    description: formatMessage({ id: 'registrationDescription' })
                }
            ]
        },
        {
            title: formatMessage({ id: 'recipientHistory' }),
            image: '/assets/booking.png',
            explanations: [
                {
                    title: formatMessage({ id: 'simpleRegistration' }),
                    description: formatMessage({ id: 'registrationDescription' })
                }
            ]
        },
        {
            title: formatMessage({ id: 'faSecurity' }),
            image: '/assets/booking.png',
            explanations: [
                {
                    title: formatMessage({ id: 'simpleRegistration' }),
                    description: formatMessage({ id: 'registrationDescription' })
                }
            ]
        },

    ]
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 10,
            marginBottom: '64px'
        }}>
            <SectionTitle color="#0E103A">
                {formatMessage({ id: 'ourFonctionnalities' })}
            </SectionTitle>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 2,
                width: '75rem',
                justifySelf: 'center',
            }}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    aria-label="Vertical tabs example"
                    value={activeTab}
                    onChange={(_, tabIndex) => {
                        setActiveTab(tabIndex)
                    }}
                    sx={{
                        borderLeft: 1,
                        borderColor: 'divider',
                        '& .MuiTabs-indicator': {
                            display: 'none', // Hide default indicator
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: '2rem'
                        }
                    }}

                >
                    {fonctionnalitiesData.map(({ title }, index) => (
                        <Tab
                            key={index}
                            label={title}
                            sx={{
                                textTransform: 'none',
                                minHeight: 48,
                                maxWidth: 450,
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                padding: theme.spacing(1.5, 3),
                                fontFamily: 'Darker Grotesk',
                                fontSize: '24px',
                                lineHeight: '125%',
                                '&.Mui-selected': {
                                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                                    fontWeight: 700,
                                    fontSize: '36px',
                                    lineHeight: '83%',
                                },
                            }}
                        />
                    ))}
                </Tabs>
                <Explanation {...fonctionnalitiesData[activeTab]} />
            </Box>
        </Box>
    )
}
