import { RequestValidationError } from '../errors/request-validation-error';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
export const requestValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
  next();
};
