import { createContext } from 'react';
import { IUserState } from './user.interface';

export const initialState: IUserState = {
  activeUser: {
    email: '',
    first_name: '',
    last_name: '',
    person_id: '',
    preferred_lang: 'en',
    gender: 'Other',
    role_id: '',
    address: '',
    birth_date: new Date(),
    login_id: '',
    phone_number: '',
    created_at: Date.now(),
  },
  isFetched: false,
  userDispatch: () => null,
};
const UserContext = createContext(initialState);

export default UserContext;
