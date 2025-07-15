import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div
      style={{
        background: 'url(/assets/splash_bg.png)',
        height: '100%',
        width: '100%',
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Image
        src="/assets/logo.gif"
        alt="Logo"
        width={140}
        height={140}
        style={{ display: 'block' }}
        unoptimized
      />
      <div
        style={{
          color: '#415058',
          textAlign: 'center',
          position: 'absolute',
          bottom: '53px',
          fontFamily: 'DM Sans',
          opacity: 0.75,
          fontSize: '1.125rem',
          width: '100%',
        }}
      >
        By GLOM
      </div>
    </div>
  );
}
