import type { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getJwtSecret } from "../config/env";
import { UserRepository } from "../repositories/user.repository";

const ACCESS_COOKIE = "access_token";
const userRepository = new UserRepository();

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const accessToken = req.cookies[ACCESS_COOKIE] as string | undefined;

  if (!accessToken) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const verified = jwt.verify(accessToken, getJwtSecret());

    if (
      typeof verified === "string" ||
      !isValidTokenType(verified, "access")
    ) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }

    const userId = Number(verified.sub);
    if (!Number.isInteger(userId) || userId < 1) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(401).json({ message: "User no longer exists" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
};

function isValidTokenType(
  payload: JwtPayload,
  expectedType: "access",
): payload is JwtPayload & { sub: string | number; type: "access" } {
  return (
    (typeof payload.sub === "string" || typeof payload.sub === "number") &&
    payload.type === expectedType
  );
}
