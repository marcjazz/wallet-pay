'use client';
import { Box } from "@mui/material";
import Header from "./header";
import Footer from "./footer";

export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            minHeight: '100vh',
        }}>
            <Header />
            {children}
            <Footer />
        </Box>
    )
}