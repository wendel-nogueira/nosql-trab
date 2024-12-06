import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret =
  "a9fd3c98f83c4b7f9192f8ae0d71b6b4b79e1de905b80b3da7c146890c504c3f";

export const userIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers.authorization;

  if (!token) {
    next();
    return;
  }

  token = token.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number };
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    next();
  }
};
