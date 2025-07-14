import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background, #fff)',
        textAlign: 'center',
        padding: '0 16px',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#232792"
            strokeWidth="2"
            fill="#f5f6fa"
          />
          <path
            d="M8 15c.5-1 1.5-2 4-2s3.5 1 4 2"
            stroke="#232792"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="9" cy="10" r="1.2" fill="#232792" />
          <circle cx="15" cy="10" r="1.2" fill="#232792" />
        </svg>
      </div>
      <h1
        style={{
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: 'Darker Grotesque, DM Sans, sans-serif',
          fontSize: '2.25rem',
        }}
      >
        Oops! Page Not Found
      </h1>
      <p
        style={{
          color: '#415058',
          opacity: 0.8,
          marginBottom: 24,
          fontSize: '1.125rem',
        }}
      >
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          border: '1px solid #232792',
          color: '#232792',
          borderRadius: 16,
          padding: '12px 32px',
          fontWeight: 600,
          fontFamily: 'DM Sans, sans-serif',
          textDecoration: 'none',
          transition: 'background 0.2s, color 0.2s',
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
