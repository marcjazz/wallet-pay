import { Box, Divider, Skeleton, Typography } from '@mui/material';

export default function RemittanceDetailSkeleton() {
  return (
    <Box sx={{ padding: 2, display: 'grid', rowGap: 6 }}>
      <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 4 }}>
        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 2 }}>
          <Skeleton variant="circular" height={76} width={76} />
          <Typography variant="h2">
            <Skeleton width={237} />
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', justifyItems: 'center', rowGap: 1 }}>
          <Box
            sx={{
              display: 'grid',
              justifyItems: 'center',
              rowGap: 0.5,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 0.5,
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" color="#C8CDD0">
                XAF
              </Typography>
              <Typography variant="h1">
                <Skeleton width={50} />
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 0.5,
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" color="#C8CDD0">
                <Skeleton width={50} />
              </Typography>
              <Typography variant="h4" color="#B1ACA5">
                <Skeleton width={50} />
              </Typography>
            </Box>
          </Box>
          <Typography variant="l3r" color="#BABDBE">
            <Skeleton width={50} />
          </Typography>
          <Typography variant="p3r">
            <Skeleton width={50} />
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ justifySelf: 'stretch' }} />
    </Box>
  );
}
