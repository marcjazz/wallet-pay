'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import PageLayout from '../components/layout/pageLayout';
import { useTheme } from '@xafpay/theme';
import Image from 'next/image';
import { IPaymentMethods } from '@xafpay/types';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { useEffect, useState } from 'react';

interface IFaq {
  question: string,
  response: string
}

export default function Index() {
  const { formatMessage } = useIntl();
  const [faqQuestionsData, setFaqQuestionsData] = useState<IFaq[]>([])
  const theme = useTheme()

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
  //TODO: Create a varaible that handle data for how it works section

  useEffect(() => (
    setFaqQuestionsData(faqQuestions)
  ), [])
  return (
    <PageLayout>
      {/* 
      Second section for remittance representation
      */}
      <Box sx={{
        display: 'grid',
        padding: '48px 118px',
        background: 'linear-gradient(to right, rgba(15, 93, 190, 1), rgba(7, 43, 88, 1))',
        color: 'white',
        textAlign: 'center',
        rowGap: 7
      }}>
        <Box sx={{
          display: 'grid',
          rowGap: 1
        }}>
          <Typography variant="h1">
            {formatMessage({ id: 'HeroRemittanceMessage' })}
          </Typography>
          <Typography variant="h3" >
            {formatMessage({ id: 'reliableRemittanceService' })}
          </Typography>
        </Box>
        <Box sx={{
          display: 'grid',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            alignItems: 'center',
          }}>
            <Box sx={{
              display: 'grid',
              height: 'fit-content'
            }}>
              <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                alignItems: 'center',
                width: 'fit-content',
              }}>
                <Box
                  component='img'
                  src='/assets/cad.png'
                  alt="cad flag"
                />
                <Box
                  component='img'
                  src='/assets/arrow.png'
                  alt="arrow"
                  sx={{
                    transform: 'scaleY(-1)',
                    width: '180px',
                  }}
                />
              </Box>
              <Box sx={{
                display: 'grid',
                gridAutoFlow: 'column',
                alignItems: 'center',
                width: 'fit-content',
              }}>
                <Box
                  component='img'
                  src='/assets/usa.png'
                  alt="cad flag"
                />
                <Box
                  component='img'
                  src='/assets/arrow.png'
                  alt="arrow"
                  width={180}
                />
              </Box>
            </Box>
            <Box
              component='img'
              src='/assets/africa.png'
              alt='africa map'
              sx={{
                width: '400px',
                height: '400px',
              }}
            />
          </Box>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: 25,
        }}>
          <Box sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            textAlign: 'left',
            columnGap: 1,
          }}>
            <CheckCircleIcon sx={{ color: 'white' }} />
            <Typography variant="h5">
              {formatMessage({ id: 'serviceLocation' })}
            </Typography>
          </Box>
          <Box sx={{
            display: 'grid',
            gridAutoFlow: 'column',
            textAlign: 'left',
            columnGap: 1,
          }}>
            <CheckCircleIcon sx={{ color: 'white' }} />
            <Typography variant="h5">
              {formatMessage({ id: 'conformityAndCompliance' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 
      Third section for Trusty
      */}
      <Box sx={{
        display: 'grid',
        textAlign: 'center',
        justifyContent: 'center',
        margin: '68px 0',
        rowGap: 6,
      }}>
        <Typography
          variant="h1"
          color={theme.palette.primary.dark}
        >
          {formatMessage({ id: 'whyTrust' })}
        </Typography>
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
                <Typography variant="h3">
                  {item.title}
                </Typography>
                <Typography
                  variant="p1r"
                  width={300}
                >
                  {item.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 
      Fourth section for engagement
      */}
      <Box sx={{
        display: 'grid',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        background: `url('/assets/mobileAccess.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '430px',
        color: 'white'
      }}>
        <Box sx={{
          display: 'grid',
          rowGap: 4,
          maxWidth: '80rem'
        }}>
          <Typography variant="h1">
            {formatMessage({ id: 'heroMessageEngagement' })}
          </Typography>
          <Typography variant="h3">
            {formatMessage({ id: 'subtextMessageEngagement' })}
          </Typography>
        </Box>
      </Box>

      {/* Fifth section for  how it works*/}
      <Box sx={{
        display: 'grid',
        justifyContent: 'center',
        marginTop: '68px'
      }}>
        <Typography
          variant='h1'
          color={theme.palette.primary.dark}
          textAlign='center'
          marginBottom={4}
        >
          {formatMessage({ id: 'howItWorks' })}
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: 25,
          alignItems: 'center'
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
          <Box sx={{
            display: 'grid',
            rowGap: 2,
            height: 'fit-content',
            transform: 'translate(9px, -36px)'
          }}>
            <Chip
              label='1'
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
              {formatMessage({ id: 'howItWorksStep1' })}
            </Typography>
            <Typography
              variant='p1r'
              maxWidth='25rem'
            >
              {formatMessage({ id: 'howItWorksStep1Description' })}
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: 25,
          alignItems: 'center'
        }}>
          <Box sx={{
            display: 'grid',
            rowGap: 2,
            height: 'fit-content',
            transform: 'translate(9px, -77px)'
          }}>
            <Chip
              label='2'
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
              {formatMessage({ id: 'howItWorksStep2' })}
            </Typography>
            <Typography
              variant='p1r'
              maxWidth='25rem'
            >
              {formatMessage({ id: 'howItWorksStep2Description' })}
            </Typography>
          </Box>
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
          <Box sx={{
            display: 'grid',
            rowGap: 2,
            height: 'fit-content',
            transform: 'translate(9px, -77px)'
          }}>
            <Chip
              label='4'
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
              {formatMessage({ id: 'howItWorksStep4' })}
            </Typography>
            <Typography
              variant='p1r'
              maxWidth='25rem'
            >
              {formatMessage({ id: 'howItWorksStep4Description' })}
            </Typography>
          </Box>
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
              label='5'
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
              {formatMessage({ id: 'howItWorksStep5' })}
            </Typography>
            <Typography
              variant='p1r'
              maxWidth='25rem'
            >
              {formatMessage({ id: 'howItWorksStep5Description' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Sixth section for payout methods */}
      <Box sx={{
        display: 'grid',
        justifyContent: 'center',
        textAlign: 'center',
        rowGap: 4,
        margin: 7
      }}>
        <Typography
          variant="h1"
          color={theme.palette.primary.dark}
        >
          {formatMessage({ id: 'payoutMethods' })}
        </Typography>
        <Box sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          columnGap: 7,
        }}>
          {paymentMethods.map(({ link, alt }, index) => (
            <Image
              key={index}
              src={link}
              alt={alt}
              width={100}
              height={55}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{
        height: '372px',
        background: `url('/assets/mobileTransaction.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: '50% 60%',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'grid'
      }}>
        <Box
          sx={{
            position: 'absolute',
            backgroundColor: 'rgba(7, 43, 88, 0.6)',
            height: '100%',
            width: '100%'
          }}
        />
        <Box sx={{
          display: 'grid',
          rowGap: 4,
          color: 'white',
          width: '60rem',
        }}>
          <Typography
            variant="h1"
            zIndex={1}
          >
            {formatMessage({ id: 'pushToAction' })}
          </Typography>
          <Button
            variant='contained'
            sx={{
              justifySelf: 'center',
              backgroundColor: 'white',
              width: '18rem',
              color: theme.palette.primary.main
            }}
          >
            {formatMessage({ id: 'sendMoney' })}
          </Button>
        </Box>
      </Box>

      {/* ninth section for faq */}
      <Box sx={{
        display: 'grid',
        justifyContent: 'center',
        alignContent: 'center',
        rowGap: 5,
        margin: 7
      }}>
        <Typography
          variant="h1"
          justifySelf="center"
          color={theme.palette.primary.dark}
        >
          {formatMessage({ id: 'faq' })}
        </Typography>
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
                expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{
                  maxWidth: '25rem',
                  flexDirection: 'row-reverse',
                  '& .MuiAccordionSummary-content': {
                    marginLeft: theme.spacing(1),
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
      </Box>
    </PageLayout>
  );
}
