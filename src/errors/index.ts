export class ForbiddenError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
  status = 403;
  name = ForbiddenError.name;
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
  status = 404;
  name = NotFoundError.name;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
  status = 400;
  name = ValidationError.name;
}

export class InternalServerError extends Error {
  constructor(message?: string) {
    super();
    this.message = message || "";
  }
  status = 500;
  name = InternalServerError.name;
}
