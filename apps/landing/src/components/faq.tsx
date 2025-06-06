import { Icon } from "@iconify/react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import { IFaq } from "@xafpay/types";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import rightIcon from '@iconify/icons-fluent/chevron-right-12-filled';
import SectionTitle from "./sectionTitle";


export default function FAQ() {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    const [faqQuestionsData, setFaqQuestionsData] = useState<IFaq[]>([])


    const faqQuestions = [
        {
            question: 'What are the transaction fees on Xafpay ?',
            response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
        },
        {
            question: 'What are the transaction fees on Xafpay ?',
            response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
        },
        {
            question: 'What are the transaction fees on Xafpay ?',
            response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
        },
        {
            question: 'What are the transaction fees on Xafpay ?',
            response: 'Xafpay serves a clair transaction fees. The fees could change depending od the transaction amount and the payment method.'
        },
    ]

    useEffect(() => (
        setFaqQuestionsData(faqQuestions)
    ), [])

    return (
        <Box
            id="faq"
            sx={{
                display: 'grid',
                justifyContent: 'center',
                alignContent: 'center',
                rowGap: 5,
                marginBottom: 7
            }}>
            <SectionTitle color="#0E103A">
                {formatMessage({ id: 'faq' })}
            </SectionTitle>
            <Box
                sx={{
                    maxWidth: '62.5rem',
                    marginBottom: 2,
                }}
            >
                {faqQuestionsData.map(({ question, response }, index) => (
                    <Accordion
                        disableGutters
                        square
                        elevation={0}
                        key={index}
                        sx={{
                            marginBottom: 2
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<Icon icon={rightIcon} />}
                            sx={{
                                maxWidth: '25rem',
                                flexDirection: 'row-reverse',
                                '& .MuiAccordionSummary-content': {
                                    marginLeft: theme.spacing(1),
                                },
                                '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                    transform: 'rotate(90deg)',
                                }
                            }}
                        >
                            {question}
                        </AccordionSummary>
                        <AccordionDetails sx={{
                            '&.MuiAccordionDetails-root': {
                                padding: '8px 38px 16px'
                            }
                        }}>
                            {response}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>
        </Box >

    )
}