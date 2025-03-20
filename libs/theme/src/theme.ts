import { createTheme } from '@mui/material/styles';
import React from 'react';

// thin: 100
// extraLight: 200
// light: 300
// regular: 400
// medium: 500
// semiBold: 600
// bold: 700
// extraBold: 800
// black: 900
// 16px => 1rem

declare module '@mui/material/styles' {
  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    p1r: React.CSSProperties;
    p2r: React.CSSProperties;
    p3r: React.CSSProperties;
    p1m: React.CSSProperties;
    p2m: React.CSSProperties;
    p3m: React.CSSProperties;
    l1r: React.CSSProperties;
    l2r: React.CSSProperties;
    l3r: React.CSSProperties;
    l1b: React.CSSProperties;
    l2b: React.CSSProperties;
    l3b: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1: true;
    h2: true;
    h3: true;
    body1: false;
    body2: false;
    p1r: true;
    p1m: true;
    p2r: true;
    p2m: true;
    p3r: true;
    p3m: true;
    label: false;
    l1r: true;
    l2r: true;
    l3r: true;
    l1b: true;
    l2b: true;
    l3b: true;
  }
}

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

export function useTheme() {
  return createTheme({
    palette: {
      mode: 'light',
      primary: {
        light: '#e8f2ff',
        main: '#157cfb',
        dark: '#105dbc',
      },
      secondary: {
        light: '#fef7ec',
        main: '#f1ac42',
        dark: '#b58132',
      },
      warning: { main: '#FFBE4D' },
      success: { main: '#7BDF49' },
      error: { main: '#EE2B2B' },
      grey: {
        100: '#F2F2F3',
        200: '#C8CDD0',
        300: '#415058',
        400: '#1F292E',
      },
    },
    typography: {
      allVariants: {
        fontFamily: 'Darker Grotesque, DM Sans, sans-serif',
        color: 'var(--text-color-primary)',
      },
      p1r: {
        fontSize: '16px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 24 / 16,
      },
      p2r: {
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 21 / 14,
      },
      p3r: {
        fontSize: '12px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 18 / 12,
      },
      p1m: {
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: 'DM Sans',
        lineHeight: 24 / 16,
      },
      p2m: {
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'DM Sans',
        lineHeight: 21 / 14,
      },
      p3m: {
        fontSize: '12px',
        fontWeight: '500',
        fontFamily: 'DM Sans',
        lineHeight: 18 / 12,
      },
      l1r: {
        fontSize: '16px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 19.84 / 16,
        letterSpacing: '-0.48px',
      },
      l2r: {
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 17.36 / 14,
      },
      l3r: {
        fontSize: '12px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 14.88 / 12,
      },
      l1b: {
        fontSize: '16px',
        fontWeight: '700',
        fontFamily: 'DM Sans',
        lineHeight: 19.84 / 16,
      },
      l2b: {
        fontSize: '14px',
        fontWeight: '700',
        fontFamily: 'DM Sans',
        lineHeight: 17.36 / 14,
      },
      l3b: {
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: 'DM Sans',
        lineHeight: 14.88 / 12,
      },
      h1: {
        fontSize: '40px',
        fontWeight: '800',
        fontFamily: 'Darker Grotesque',
        lineHeight: 5 / 4,
      },
      h2: {
        fontSize: '32px',
        fontWeight: '700',
        fontFamily: 'Darker Grotesque',
        lineHeight: 26.56 / 32,
      },
      h3: {
        fontSize: '24px',
        fontWeight: '600',
        fontFamily: 'Darker Grotesque',
        lineHeight: 30 / 24,
      },
      h4: {
        fontSize: '20px',
        fontWeight: '600',
        fontFamily: 'Darker Grotesque',
        lineHeight: 25 / 20,
      },
      h5: {
        fontSize: '18px',
        fontWeight: '600',
        fontFamily: 'Darker Grotesque',
        lineHeight: 22.5 / 18,
      },
      h6: {
        fontSize: '14px',
        fontWeight: '600',
        fontFamily: 'Darker Grotesque',
        lineHeight: 17.5 / 14,
      },
      button: {
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: 'DM Sans',
        lineHeight: 21 / 14,
        textTransform: 'unset',
      },
      subtitle1: {
        fontSize: '14px',
        fontWeight: '400',
        fontFamily: 'Darker Grotesque',
      },
      subtitle2: {
        fontSize: '12px',
        fontWeight: '700',
        fontFamily: 'Darker Grotesque',
      },
      caption: {
        fontSize: '10px',
        fontWeight: '400',
        fontFamily: 'Darker Grotesque',
        color: '#00000059',
      },
      overline: {
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: 'Darker Grotesque',
      },
    },
    breakpoints: {
      values: {
        mobile: 0,
        tablet: 744,
        laptop: 992,
        desktop: 1200,
      },
    },
    components: {
      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },
      MuiSkeleton: {
        defaultProps: {
          animation: 'wave',
        },
      },
      MuiButton: {
        defaultProps: {
          variant: 'contained',
          size: 'large',
          disableElevation: true,
        },
        styleOverrides: {
          root: () => ({
            borderRadius: '12px',
          }),
          contained: () => ({
            ':hover': {
              backgroundColor: '#1E40AF',
            },
            ':disabled': {
              backgroundColor: '#93C5FD',
              color: '#fff',
            },
          }),
          outlined: () => ({
            color: '#2563EB',
            borderColor: '#2563EB',
            ':hover': {
              borderColor: '#1E40AF',
              backgroundColor: 'rgba(30, 64, 175, 0.04)',
              color: '#1E40AF',
            },
            ':disabled': {
              borderColor: '#BFDBFE',
              color: '#BFDBFE',
            },
          }),
          text: () => ({
            color: '#2563EB',
            ':hover': {
              backgroundColor: '#DBEAFE',
            },
            ':disabled': {
              color: '#BFDBFE',
            },
          }),
          outlinedInherit: () => ({
            borderColor: '#C8CDD0',
            color: 'black',
            fontSize: '16px',
            fontWeight: '400',
            fontFamily: 'DM Sans',
            lineHeight: 24 / 16,
          }),
          sizeLarge: () => ({
            padding: '18px 24px',
          }),
          sizeMedium: () => ({
            padding: '14px 16px',
          }),
          sizeSmall: () => ({
            padding: '8px 12px',
            '& .MuiButton-startIcon': {
              marginRight: '4px',
            },
            '& .MuiButton-endIcon': {
              marginLeft: '4px',
            },
          }),
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontSize: '12px',
            fontWeight: '400',
            fontFamily: 'DM Sans',
            lineHeight: 14.88 / 12,
            width: 'fit-content',
            padding: '0 6px',
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: '12px',
            fontWeight: '400',
            fontFamily: 'DM Sans',
            lineHeight: 14.88 / 12,
            width: 'fit-content',
            padding: '0 6px',
            margin: 0,
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          size: 'medium',
          fullWidth: true,
        },
        styleOverrides: {
          root: {
            gap: '6px',
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            marginRight: '10px',
          },
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          size: 'medium',
        },
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '16px',
          },
          input: {
            '&::placeholder': {
              color: '#415058',
            },
            borderRadius: '0 !important',
            fontSize: '14px',
            fontWeight: '400',
            fontFamily: 'DM Sans',
            lineHeight: 21 / 14,
            padding: 0,
          },
          adornedEnd: {
            paddingRight: '10px',
          },
          adornedStart: {
            paddingLeft: '10px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            backgroundColor: '#C8CDD0',
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          variant: 'p1r',
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiSelect-select': {
              color: '#415058',
            },
          },
        },
      },
    },
  });
}
