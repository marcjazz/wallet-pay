'use client';

import { FC, PropsWithChildren } from "react";
import { XafpayThemeProvider } from "@xafpay/theme";

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
    return <XafpayThemeProvider>{children}</XafpayThemeProvider>;
}