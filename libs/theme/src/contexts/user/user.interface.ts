// import { IUser } from '@xafpay/interfaces';
export type Lang = 'fr' | 'en';
export type Gender = 'Male' | 'Female' | 'Other';
export interface ISignIn {
  email: string;
  password: string;
}
export interface ISignUp extends ISignIn {
  address: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: Date;
  gender: Gender;
  preferred_lang: Lang;
}

export interface IUser extends Omit<ISignUp, 'password'> {
  role_id: string;
  login_id: string;
  person_id: string;
  preferred_lang: Lang;
  /**
   * datetime in milliseconds
   */
  created_at: number;
}

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
