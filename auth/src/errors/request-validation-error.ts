import { CustomError } from './custom-error';
import { ValidationError } from 'express-validator';
export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errs: ValidationError[]) {
    super('Invalid request fields');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors() {
    return this.errs.map((err) => {
      if (err.type === 'field') return { message: err.msg, field: err.path };
      return { message: err.msg };
    });
  }
}
