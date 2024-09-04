import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

interface Testing {
  hello?: string;
}

export default function Layout({
  hello,
  children,
}: PropsWithChildren<Testing>) {
  // if (!hello) return notFound();
  return (
    <div>
      <h1>About</h1>
      {children}
    </div>
  );
}
