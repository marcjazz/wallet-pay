'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-background, #fff)',
          textAlign: 'center',
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 44 44"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#e53935"
          >
            <g fill="none" fillRule="evenodd" strokeWidth="4">
              <circle cx="22" cy="22" r="20" strokeOpacity=".2" />
              <path d="M22 12v10" stroke="#e53935" strokeLinecap="round" />
              <circle cx="22" cy="30" r="2" fill="#e53935" />
            </g>
          </svg>
        </div>
        <div
          style={{
            fontWeight: 700,
            marginBottom: 8,
            fontFamily: 'Darker Grotesque, DM Sans, sans-serif',
            fontSize: 32,
          }}
        >
          Something went wrong
        </div>
        <div
          style={{
            color: '#415058',
            opacity: 0.8,
            marginBottom: 24,
            fontSize: 18,
          }}
        >
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </div>
        <button
          style={{
            borderRadius: 8,
            padding: '12px 32px',
            fontWeight: 600,
            fontFamily: 'DM Sans',
            background: 'transparent',
            color: '#232792',
            border: '2px solid #232792',
            fontSize: 18,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = '#232792';
            target.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.background = 'transparent';
            target.style.color = '#232792';
          }}
          onClick={() => (reset ? reset() : (window.location.href = '/'))}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
