import type { Request, Response } from "express";
import {
  AuthService,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from "../services/auth.service";

const authService = new AuthService();
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res
    .cookie(ACCESS_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    })
    .cookie(REFRESH_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };
  if (typeof email !== "string" || email.trim() === "") {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters" });
    return;
  }

  try {
    const result = await authService.register(email.trim().toLowerCase(), password);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.status(201).json({ user: result.user });
  } catch (error) {
    if (error instanceof EmailAlreadyRegisteredError) {
      res.status(409).json({ message: error.message });
      return;
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };
  if (typeof email !== "string" || email.trim() === "") {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  if (typeof password !== "string" || password.length === 0) {
    res.status(400).json({ message: "Password is required" });
    return;
  }

  try {
    const result = await authService.login(email.trim().toLowerCase(), password);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    res.json({ user: result.user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
      return;
    }
    throw error;
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" });
    return;
  }

  try {
    const tokens = await authService.refresh(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(204).send();
  } catch (error) {
    if (error instanceof InvalidRefreshTokenError) {
      res.status(401).json({ message: error.message });
      return;
    }
    throw error;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies[REFRESH_COOKIE] as string | undefined;
  await authService.logout(refreshToken);
  res
    .clearCookie(ACCESS_COOKIE, COOKIE_OPTIONS)
    .clearCookie(REFRESH_COOKIE, COOKIE_OPTIONS)
    .status(204)
    .send();
};

export const me = (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  res.json({ user: req.user });
};
