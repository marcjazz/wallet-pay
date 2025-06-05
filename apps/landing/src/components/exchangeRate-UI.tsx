import { Box, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import { useIntl } from "react-intl";

export default function ExchangeRateUI() {
    const { formatMessage, formatNumber } = useIntl();
    return (
        <Box>
            <Box>
                <SyncAltIcon />
                <Typography>USD</Typography>
                <ExpandMoreIcon />
                <Typography>2,500</Typography>
            </Box>
            <Box>
                <SyncAltIcon />
                <Typography>
                    {formatMessage({ id: 'switch' })}
                </Typography>
            </Box>
            {formatNumber(2500, {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}
        </Box>
    );
}