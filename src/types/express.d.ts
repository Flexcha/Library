import { AuthUserPayload } from '../modules/auth/jwt.util.ts';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
