import type { PropsWithChildren } from 'react';

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>About</h1>
      {children}
    </div>
  );
}
