import { Box, Chip, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";

interface TextCardProps {
    title: string,
    description: string;
    step: number;
    positionY: number;
}
export default function TextCard({
    title,
    description,
    step,
    positionY
}: TextCardProps
) {
    const theme = useTheme();
    return (
        <Box sx={{
            display: 'grid',
            rowGap: 2,
            height: 'fit-content',
            transform: `translate(9px, -${positionY}px)`,
        }}>
            <Chip
                label={step}
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
                {title}
            </Typography>
            <Typography
                variant='p1r'
                maxWidth='25rem'
            >
                {description}
            </Typography>
        </Box>

    )
}