import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env";
import { User } from "../models/User";
import { UserRepository } from "../repositories/user.repository";

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("Email is already registered");
    this.name = "EmailAlreadyRegisteredError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export type AuthenticatedUser = Pick<User, "id" | "email" | "createdAt">;

export type RegistrationResult = {
  user: AuthenticatedUser;
  token: string;
};

export type LoginResult = RegistrationResult;

export class AuthService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async register(email: string, password: string): Promise<RegistrationResult> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create(email, passwordHash);
    const token = jwt.sign({ sub: user.id }, getJwtSecret(), {
      expiresIn: "7d",
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    const token = jwt.sign({ sub: user.id }, getJwtSecret(), {
      expiresIn: "7d",
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}
