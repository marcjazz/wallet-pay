import arrowRight from '@iconify/icons-fluent/arrow-right-28-regular';
import down from '@iconify/icons-fluent/chevron-down-12-filled';
import { Icon } from '@iconify/react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Avatar, Box, Button, Chip, Divider, TextField, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import Image from "next/image";
import { useState } from 'react';
import { useIntl } from "react-intl";
import CurrencyMenu from './currencyMeny';




export default function Hero() {
  const { formatMessage, formatNumber } = useIntl();
  const theme = useTheme();

  const [amount, setAmount] = useState<number>();
  const [currencyAnchorEl, setCurrencyAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [currencyId, setCurrencyId] = useState<string>('');

  const supportedCurrencies = [
    {
      currency_id: 'USD',
      currency_acronym: 'USD',
      country: 'United States',
      currency_name: 'United States Dollar',
      conversion_rate: 1.0,
    },
    {
      currency_id: 'CAD',
      currency_acronym: 'CAD',
      country: 'Canada',
      currency_name: 'Canadian Dollar',
      conversion_rate: 1.25,
    },

  ];
  const correspondingFlags: { [key: string]: string } = {
    USD: '/assets/usa-flag.jpg',
    CAD: '/assets/canada-flag.png',
  }
  function getActiveCurrency() {
    const val = supportedCurrencies.find(
      ({ currency_id: c_id }) => c_id === currencyId
    );
    if (val) return val.currency_acronym;
    return '';
  }

  return (
    <>
      <CurrencyMenu
        anchorEl={currencyAnchorEl}
        handleClose={() => setCurrencyAnchorEl(null)}
        open={!!currencyAnchorEl}
        supportedCurrencies={supportedCurrencies}
        isLoading={false}
        selectItem={(val) => setCurrencyId(val)}
      />
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        padding: '48px 130px',
        height: '90vh',
        columnGap: '10rem',
        alignItems: 'center',
      }}>
        <Box sx={{
          display: 'grid',
          textAlign: 'start',
          rowGap: 4,
          width: '50rem',
          height: 'fit-content',
        }}>
          <Typography
            variant="p1m"
            sx={{
              fontWeight: 500,
              fontSize: { tablet: '16px', mobile: '14px' },
              lineHeight: '150%',
              color: theme.palette.secondary.main
            }}
          >
            {formatMessage({ id: 'adviceheroMessage' })}
          </Typography>
          <Typography
            variant='h1'
            sx={{
              fontFamily: 'Space Grotesk',
              fontWeight: 'bold',
              fontSize: {
                tablet: '48px',
                mobile: '36px',
              },
              lineHeight: '120%',
              color: '#0E103A',
            }}
          >
            {formatMessage({ id: 'heroMessage' })}
          </Typography>
          <Typography
            variant="h2"
            sx={{
              color: 'rgba(28, 29, 39, 0.80)',
              leadingTrim: 'both',
              textEdge: 'cap',
              fontFamily: 'Space Grotesk',
              fontSize: { tablet: '24px', mobile: '16px' },
              fontWeight: 500,
              lineHeight: '130%',
            }}
          >
            {formatMessage({ id: 'descriptionheroMessage' })}
          </Typography>
          <Button
            variant='contained'
            size='large'
            sx={{
              width: '12rem',
              fontSize: '14px',
              fontFamily: 'Poppins',
            }}
            onClick={() => alert('Send money')}
          >
            {formatMessage({ id: 'heroActionBtn' })}
          </Button>
        </Box>

        <Box sx={{
          position: 'relative',
          height: '100%',
        }}>
          <Box sx={{
            display: 'grid',
            rowGap: 2,
            border: '1px solid darkgray',
            borderRadius: 3,
            padding: 2,
            boxShadow: '-120px -80px 8px rgba(21, 124, 251, 0.3), 0px 7px 8px rgba(251, 1, 2, 0.15)',
            maxWidth: '25rem',
            position: 'absolute',
            width: '25rem',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: theme.palette.background.paper,
          }}>
            <Typography
              variant='h4'
              sx={{
                textAlign: 'center',
                fontFamily: 'Space Grotesk',
                fontSize: { tablet: '24px', mobile: '20px' },
                fontWeight: 500,
                lineHeight: '130%',
              }}

            >
              {formatMessage({ id: 'OurExchangeRate' })}
            </Typography>
            <Divider />
            <Box sx={{
              display: 'grid',
              textAlign: 'start',
            }}>
              <Typography
                variant="p2m"
                sx={{
                  fontSize: { mobile: '10px', tablet: '12px' },
                  lineHeight: '160%',
                  color: '#12192C',
                }}
              >
                {formatMessage({ id: 'whenYouSend' })}
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <TextField
                  variant="standard"
                  type="number"
                  placeholder="100 $"
                  sx={{
                    '& .MuiInputBase-input': {
                      textAlign: 'start',
                      fontSize: { tablet: '36px', mobile: '24px' },
                      fontWeight: '700',
                      fontFamily: 'Poppins',
                      width: '15rem',
                    },
                    '& .MuiInput-root::before': {
                      border: 'none',
                    },
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                  }}
                  value={amount}
                />
                <Box sx={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  columnGap: 1,
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                  onClick={(e) => setCurrencyAnchorEl(e.currentTarget)}
                >
                  {
                    currencyId ? (
                      <Image
                        src={correspondingFlags[getActiveCurrency()]}
                        width={24}
                        height={24}
                        alt={`${currencyId} flag`}
                      />
                    ) : (
                      <Image
                        src="/assets/usa-flag.jpg"
                        width={24}
                        height={24}
                        alt="usa flag"
                      />
                    )
                  }
                  <Typography
                    variant="p1m"
                    sx={{
                      fontFamily: 'Space Grotesk',
                      fontWeight: 500,
                      fontSize: { tablet: '24px', mobile: '14px' },
                      lineHeight: '130%',
                    }}
                  >
                    {getActiveCurrency() || 'USD'}
                  </Typography>
                  <Icon icon={down} />
                </Box>
              </Box>
            </Box>
            <Divider
              variant="fullWidth"
              sx={{
                backgroundColor: 'transparent',
                borderStyle: 'dashed',
              }}>
              <Chip
                label={<ArrowDownwardIcon />}
                sx={{
                  backgroundColor: '#0E103A',
                  color: 'white',
                  fontSize: '1.2rem',
                  height: '36px',
                  width: '36px',
                  '& .MuiChip-label': {
                    padding: 0,
                  },
                }}
              />
            </Divider>
            <Box sx={{
              display: 'grid',
              textAlign: 'start',
            }}>
              <Typography
                variant="p2m"
                sx={{
                  fontSize: { mobile: '10px', tablet: '12px' },
                  lineHeight: '160%',
                  color: '#12192C',
                }}
              >
                {formatMessage({ id: 'WillReceive' })}
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'end',
                  gap: 1,
                  flexGrow: 1,
                }}>
                  <Typography
                    variant="h3"
                    sx={{
                      textAlign: 'start',
                      fontSize: { tablet: '36px', mobile: '24px' },
                      fontWeight: '700',
                      fontFamily: 'Poppins',
                    }}
                  >
                    {/* TODO: Replace this with the real value */}
                    {formatNumber(
                      Number(Number(62456.60).toFixed(2))
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      lineHeight: '160%',
                      color: '#12192C',
                      fontSize: { mobile: '18px', tablet: '24px' },
                      fontWeight: '600',
                      fontFamily: 'Space Grotesk',
                    }}
                  >
                    XAF
                  </Typography>
                </Box>
                <Box sx={{
                  display: 'grid',
                  gridAutoFlow: 'column',
                  columnGap: 1,
                  alignItems: 'center',
                }}>
                  <Image
                    src="/assets/cameroon-flag.png"
                    width={24}
                    height={24}
                    alt="cameroon flag"
                  />
                  <Typography
                    variant="p1m"
                    sx={{
                      fontFamily: 'Space Grotesk',
                      fontWeight: 500,
                      fontSize: { tablet: '24px', mobile: '14px' },
                      lineHeight: '130%',
                    }}
                  >
                    CMR
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider />
            <Box sx={{
              display: 'grid',
              alignItems: 'center',
              justifyContent: 'space-between',
              gridAutoFlow: 'column',
            }}>
              <Typography
                variant="p2m"
                sx={{
                  fontSize: { mobile: '10px', tablet: '12px' },
                  lineHeight: '160%',
                  fontFamily: 'Poppins',
                }}
              >
                {formatMessage({ id: 'OurTransactionFees' })}
              </Typography>
              <Typography
                variant="p2m"
                sx={{
                  fontSize: { mobile: '10px', tablet: '12px' },
                  lineHeight: '160%',
                  fontFamily: 'Poppins',
                  color: theme.palette.primary.dark,
                  fontWeight: 'bold',
                }}
              >
                {formatMessage({ id: 'feesRate' })}
              </Typography>
            </Box>
            <Divider />
            <Button
              size="large"
              variant="contained"
              color="primary"
              endIcon={<Icon icon={arrowRight} />}
              sx={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                fontFamily: 'Poppins',
                width: '100%',
              }}
              onClick={() => alert('Transfer Now')}
            >
              {formatMessage({ id: 'transferNow' })}
            </Button>
          </Box>
          <Avatar
            alt="Xafpay"
            src="/assets/cameroon-flag.png"
            sx={{
              width: 62,
              height: 62,
            }}
          />
          <Avatar
            alt="Xafpay"
            src="/assets/canada-flag.png"
            sx={{
              position: 'absolute',
              top: 60,
              right: 90,
              width: 62,
              height: 62,
              zIndex: -1,
            }}
          />
          <Avatar
            alt="Xafpay"
            src="/assets/cameroon-flag.png"
            sx={{
              position: 'absolute',
              bottom: 230,
              left: 70,
              width: 62,
              height: 62,
              zIndex: -1,
            }}
          />
          <Avatar
            alt="Xafpay"
            src="/assets/canada-flag.png"
            sx={{
              position: 'absolute',
              bottom: 130,
              left: 50,
              width: 62,
              height: 62,
            }}
          />
          <Avatar
            alt="Xafpay"
            src="/assets/usa.png"
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 150,
              width: 62,
              height: 62,
            }}
          />
        </Box>
      </Box>
    </>

  );
}

