import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>About</h1>
      {children}
    </div>
  );
}
