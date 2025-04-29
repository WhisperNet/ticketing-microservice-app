import { CustomError } from './custom-error';

export class DatabaseError extends CustomError {
  statusCode = 500;
  reason = "Database isn't reachable";
  constructor() {
    super('Database connection error');
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}
