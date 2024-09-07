import { Person } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Person {
      id: string;
      is_active: boolean;
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
