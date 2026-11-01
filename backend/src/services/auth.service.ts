import { createHash, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getJwtRefreshSecret, getJwtSecret } from "../config/env";
import { User } from "../models/User";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { UserRepository } from "../repositories/user.repository";

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

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

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("Invalid refresh token");
    this.name = "InvalidRefreshTokenError";
  }
}

export type AuthenticatedUser = Pick<User, "id" | "email" | "createdAt">;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: AuthenticatedUser;
  tokens: AuthTokens;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getUser(user: User): AuthenticatedUser {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly refreshTokenRepository = new RefreshTokenRepository(),
  ) {}

  async register(email: string, password: string): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new EmailAlreadyRegisteredError();

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userRepository.create(email, passwordHash);

    return { user: getUser(user), tokens: await this.createTokens(user) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    return { user: getUser(user), tokens: await this.createTokens(user) };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;

    try {
      const verified = jwt.verify(rawRefreshToken, getJwtRefreshSecret());
      if (typeof verified === "string") throw new InvalidRefreshTokenError();
      payload = verified;
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) throw error;
      throw new InvalidRefreshTokenError();
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.jti !== "string" ||
      payload.type !== "refresh"
    ) {
      throw new InvalidRefreshTokenError();
    }

    const storedToken = await this.refreshTokenRepository.findByHash(
      hashToken(rawRefreshToken),
    );

    if (
      !storedToken ||
      storedToken.tokenId !== payload.jti ||
      storedToken.userId !== Number(payload.sub) ||
      storedToken.revokedAt ||
      storedToken.expiresAt.getTime() <= Date.now()
    ) {
      throw new InvalidRefreshTokenError();
    }

    await this.refreshTokenRepository.revoke(storedToken);
    return this.createTokens(storedToken.user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    const storedToken = await this.refreshTokenRepository.findByHash(
      hashToken(rawRefreshToken),
    );
    if (storedToken && !storedToken.revokedAt) {
      await this.refreshTokenRepository.revoke(storedToken);
    }
  }

  private async createTokens(user: User): Promise<AuthTokens> {
    const tokenId = randomUUID();
    const accessToken = jwt.sign(
      { sub: user.id, type: "access" },
      getJwtSecret(),
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      getJwtRefreshSecret(),
      { expiresIn: "7d", jwtid: tokenId },
    );

    await this.refreshTokenRepository.create(
      user.id,
      tokenId,
      hashToken(refreshToken),
      new Date(Date.now() + REFRESH_TOKEN_MAX_AGE),
    );

    return { accessToken, refreshToken };
  }
}
