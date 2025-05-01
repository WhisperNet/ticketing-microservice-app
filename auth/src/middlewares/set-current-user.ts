import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
interface decodedUser {
  email: string;
  id: string;
}
declare global {
  namespace Express {
    interface Request {
      currentUser: decodedUser;
    }
  }
}
export const setCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.JWT) {
    return next();
  }
  try {
    const currentUser = JWT.verify(
      req.session.JWT,
      process.env.JWT_KEY!
    ) as decodedUser;
    req.currentUser = currentUser;
  } catch (err) {}

  next();
};
