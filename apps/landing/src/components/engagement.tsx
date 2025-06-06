import { Box, Typography } from "@mui/material";
import { useIntl } from "react-intl";

export default function Engagement() {
    const { formatMessage } = useIntl();
    return (
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
                <Typography
                    variant="h1"
                    sx={{
                        fontFamily: 'Space Grotesk',
                        fontSize: { tablet: '48px', mobile: '36px' },
                        lineHeight: '120%',
                    }}
                >
                    {formatMessage({ id: 'heroMessageEngagement' })}
                </Typography>
                <Typography
                    variant="h3"
                    sx={{
                        fontFamily: 'Space Grotesk',
                        fontSize: { tablet: '24px', mobile: '18px' },
                    }}
                >
                    {formatMessage({ id: 'subtextMessageEngagement' })}
                </Typography>
            </Box>
        </Box>

    )
}