import { AppDataSource } from "../config/db";
import { RefreshToken } from "../models/RefreshToken";

export class RefreshTokenRepository {
  private readonly repository = AppDataSource.getRepository(RefreshToken);

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });
  }

  create(
    userId: number,
    tokenId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.repository.create({
      userId,
      tokenId,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });

    return this.repository.save(refreshToken);
  }

  async revoke(refreshToken: RefreshToken): Promise<void> {
    refreshToken.revokedAt = new Date();
    await this.repository.save(refreshToken);
  }
}
