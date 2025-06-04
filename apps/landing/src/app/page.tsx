'use client';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Box, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import PageLayout from '../components/layout/pageLayout';

export default function Index() {
  const { formatMessage } = useIntl();
  return (
    <PageLayout>
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
    </PageLayout>
  );
}
