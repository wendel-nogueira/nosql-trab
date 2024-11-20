export class BadRequestException extends Error {
  public errors?: string[];

  constructor(message: string, errors?: string[]) {
    super(message);
    this.errors = errors;
  }
}

export class ForbiddenException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundException extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string) {
    super(message);
  }
}
