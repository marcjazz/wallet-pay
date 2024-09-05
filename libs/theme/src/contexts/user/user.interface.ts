import { IUser } from '@xafpay/interfaces';

export interface IUserContextProviderProps {
  children: JSX.Element;
}

export type Action =
  | { type: 'LOG_OUT' }
  | { type: 'UPDATE_STATUS' }
  | { type: 'LOAD_USER'; payload: IUser }
  | { type: 'UPDATE_USER'; payload: Partial<IUser> };

export interface IUserState {
  activeUser: IUser;
  isFetched: boolean;
  userDispatch: React.Dispatch<Action>;
}

export type State = IUserState;
