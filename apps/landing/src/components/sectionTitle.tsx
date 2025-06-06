import { Typography } from '@mui/material';

interface SectionTitleProps {
    children: string;
    color: string;
}
export default function SectionTitle({
    children,
    color
}: SectionTitleProps) {
    return (
        <Typography
            variant="h1"
            sx={{
                fontFamily: 'Space Grotesk',
                textAlign: 'center',
                fontSize: { tablet: '48px', mobile: '36px' },
                lineHeight: '120%',
                color: color,
                width: { tablet: '60%', mobile: '90%' },
                justifySelf: 'center',
                paddingTop: 7.5,
            }}
        >
            {children}
        </Typography>
    );
}