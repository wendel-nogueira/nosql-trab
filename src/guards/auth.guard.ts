import { Request, Response, NextFunction } from "express";
import { UnauthorizedException, ForbiddenException } from "../utils/exceptions";
import jwt from "jsonwebtoken";

const jwtSecret =
  "a9fd3c98f83c4b7f9192f8ae0d71b6b4b79e1de905b80b3da7c146890c504c3f";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;

  if (!token) {
    throw new UnauthorizedException("Token não fornecido!");
  }

  token = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    throw new ForbiddenException("Token inválido!");
  }
};
