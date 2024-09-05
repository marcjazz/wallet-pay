import { createContext } from 'react';

import { IMode } from './mode.interface';

const ModeContext = createContext<IMode>({
  activeMode: 'light',
  modeDispatch: () => null,
});

export default ModeContext;
