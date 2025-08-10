import React from 'react';

declare module '*.svg' {
  const content: string;
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  export default content;
}

/**
 * Represents the event that is fired before the user is prompted to install the app.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * An array of strings representing the platforms on which the event was dispatched.
   */
  readonly platforms: string[];
  /**
   * A Promise that resolves to an object describing the user's choice when they were prompted to install the app.
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  /**
   * Shows the install prompt to the user.
   */
  prompt(): Promise<void>;
}