import { Person } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Person {
      id: string;
      is_active: boolean;
      subdomain: string | null;
    }

    namespace Express {
      interface Request {
        user?: User;
      }
    }
  }
}
