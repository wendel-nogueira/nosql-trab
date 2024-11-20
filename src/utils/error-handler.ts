import { NextFunction, Request, Response } from "express";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "./exceptions";

export const ErrorHandler = (
  error: any,
  request: Request,
  response: any,
  next: NextFunction
) => {
  let body = {
    Type: "https://tools.ietf.org/html/rfc7231#section-6.6.1",
    Title: "An error occurred while processing your request.",
    Status: 500,
    Instance: request.url,
    Detail:
      "Internal Server Error. An error occurred while processing your request.",
  } as any;

  switch (error.constructor) {
    case BadRequestException:
      body = {
        Type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
        Title: "Bad Request",
        Status: 400,
        Instance: request.url,
        Detail: error.message,
        Errors: error.errors,
      };
      break;
    case UnauthorizedException:
      body = {
        Type: "https://tools.ietf.org/html/rfc7235#section-3.1",
        Title: "Unauthorized",
        Status: 401,
        Instance: request.url,
        Detail: error.message,
      };
      break;
    case ForbiddenException:
      body = {
        Type: "https://tools.ietf.org/html/rfc7231#section-6.5.3",
        Title: "Forbidden",
        Status: 403,
        Instance: request.url,
        Detail: error.message,
      };
      break;
    case NotFoundException:
      body = {
        Type: "https://tools.ietf.org/html/rfc7231#section-6.5.4",
        Title: "Not Found",
        Status: 404,
        Instance: request.url,
        Detail: error.message,
      };
      break;
    case Error:
      let errorBody: any;

      try {
        errorBody = JSON.parse(error.message);
      } catch (e) {
        errorBody = error.message;
      }

      body = {
        ...body,
        Extensions: errorBody,
      };
      break;
    default:
      break;
  }

  return response.status(body.Status).json(body);
};
