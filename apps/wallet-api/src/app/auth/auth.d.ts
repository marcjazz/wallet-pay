import { Person } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Omit<Person, 'password'> {
      id: string;
      subdomain: string | null;
    }
  }
}

type TokenType = 'access_token' | 'refresh_token';
interface IJWTPayload {
  sub: string;
  type: TokenType;
  iat?: number;
  exp?: number;
}
