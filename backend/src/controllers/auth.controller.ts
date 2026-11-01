import type { Request, Response } from "express";
import {
  AuthService,
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
} from "../services/auth.service";

const authService = new AuthService();

export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password } = req.body as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || email.trim() === "") {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  if (typeof password !== "string" || password.length < 8) {
    res
      .status(400)
      .json({ message: "Password must be at least 8 characters" });
    return;
  }

  try {
    const result = await authService.register(email.trim().toLowerCase(), password);

    res
      .cookie("auth_token", result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ user: result.user });
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
    const result = await authService.login(
      email.trim().toLowerCase(),
      password,
    );

    res
      .cookie("auth_token", result.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ user: result.user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ message: error.message });
      return;
    }

    throw error;
  }
};
