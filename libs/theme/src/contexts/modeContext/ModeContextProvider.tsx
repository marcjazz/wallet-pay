import { Reducer, useContext, useReducer } from 'react';
import ModeContext from './ModeContext';

import {
  Action,
  IMode,
  ModeContextProviderProps,
  State,
} from './mode.interface';

const modeReducer: Reducer<IMode, Action> = (state: State, action: Action) => {
  switch (action.type) {
    case 'USE_LIGHT': {
      localStorage.setItem('activeTheme', 'light');
      return { ...state, activeMode: 'light' };
    }
    case 'USE_DARK': {
      localStorage.setItem('activeTheme', 'dark');
      return { ...state, activeMode: 'dark' };
    }
    default:
      return state;
  }
};

function ModeContextProvider({
  children,
}: ModeContextProviderProps): JSX.Element {
  const initialState: IMode = {
    activeMode: 'light',
    modeDispatch: () => null,
  };

  const [modeState, modeDispatch] = useReducer(modeReducer, initialState);
  const value = {
    activeMode: modeState.activeMode,
    modeDispatch: modeDispatch,
  };

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export default ModeContextProvider;

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used as a descendant of ModeProvider');
  } else return context;
};
