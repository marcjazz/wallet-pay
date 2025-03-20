import { Person } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Person {
      id: string;
      is_active: boolean;
    }

    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }
}
