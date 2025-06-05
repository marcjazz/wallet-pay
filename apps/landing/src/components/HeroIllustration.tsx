import { Avatar, Box, Button, Chip, Divider, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from "next/image";
import { useTheme } from "@xafpay/theme";

export default function HeroIllustration() {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    return (
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
                    justifySelf='center'
                >
                    {formatMessage({ id: 'OurExchangeRate' })}
                </Typography>
                <Divider />
                <Box sx={{
                    display: 'grid',
                    textAlign: 'start',
                }}>
                    <Typography variant="p2m">
                        {formatMessage({ id: 'whenYouSend' })}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Typography variant="h3">
                            100 $
                        </Typography>
                        <Box sx={{
                            display: 'grid',
                            gridAutoFlow: 'column',
                            columnGap: 1,
                        }}>
                            <Image
                                src="/assets/canada-flag.png"
                                width={24}
                                height={24}
                                alt="canada flag"
                            />
                            <Typography variant="p1m">
                                USD
                            </Typography>
                            <ExpandMoreIcon />
                        </Box>
                    </Box>
                </Box>
                {/* Set the dashed divider instead of this one */}
                <Divider
                    variant="fullWidth"
                    sx={{
                        backgroundColor: 'transparent',
                    }}>
                    <Chip
                        label={<ArrowDownwardIcon />}
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            fontSize: '1.2rem',
                            height: '32px',
                            width: '32px',
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
                    <Typography variant="p2m">
                        {formatMessage({ id: 'WillReceive' })}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Typography variant="h3">
                            62 456,60 XAF
                        </Typography>
                        <Box sx={{
                            display: 'grid',
                            gridAutoFlow: 'column',
                            columnGap: 1,
                        }}>
                            <Image
                                src="/assets/cameroon-flag.png"
                                width={24}
                                height={24}
                                alt="canada flag"
                            />
                            <Typography variant="p1m">
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
                    <Typography variant="p2m">
                        {formatMessage({ id: 'OurTransactionFees' })}
                    </Typography>
                    <Typography
                        variant="p2m"
                        color={theme.palette.primary.dark}
                        fontWeight="bold"
                    >
                        {formatMessage({ id: 'feesRate' })}
                    </Typography>
                </Box>
                <Divider />
                <Button
                    size="large"
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                    }}
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
                    top: 90,
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
                    bottom: 280,
                    left: 30,
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
    );
}
