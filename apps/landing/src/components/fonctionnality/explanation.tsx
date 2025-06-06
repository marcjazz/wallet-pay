import { Box, Typography } from "@mui/material";
import { useTheme } from "@xafpay/theme";
import { IFonctionnalities } from "@xafpay/types";
import Image from "next/image";

export default function Explanation(data: IFonctionnalities) {
    const theme = useTheme();
    const { image, explanations, title } = data;
    console.log(image, explanations, title);
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            justifyItems: 'end',
            columnGap: 5
        }}>
            <Image
                src={image}
                width={311}
                height={444}
                alt={title}
                style={{
                    boxShadow: '0px 14px 41px rgba(0, 0, 0, 0.25)'
                }}
            />
            <Box sx={{
                display: 'grid',
                height: 'fir-content',
            }}>
                {explanations.map(({ title, description }) => (
                    <Box sx={{
                        display: 'grid',
                        rowGap: 2,
                        justifyItems: 'end',
                        textAlign: 'right',
                        height: 'fit-content'
                    }}>
                        <Box
                            sx={{
                                height: '2px',
                                width: '84px',
                                bgcolor: theme.palette.primary.main
                            }}
                        />
                        <Typography variant='h3' fontSize='32px'>
                            {title}
                        </Typography>
                        <Typography
                            variant="p1r"
                            sx={{
                                maxWidth: '400px'
                            }}
                        >
                            {description}
                        </Typography>
                    </Box>

                ))}
            </Box>
        </Box>
    )
}