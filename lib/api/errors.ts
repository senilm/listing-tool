// Typed API errors. Throw these anywhere inside a withApi handler (or a service
// it calls) and the wrapper maps them to the right status + JSON response.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}
