import { AppDataSource } from "../config/db";
import { User } from "../models/User";

export class UserRepository {
  private readonly repository = AppDataSource.getRepository(User);

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  create(email: string, passwordHash: string): Promise<User> {
    const user = this.repository.create({ email, passwordHash });
    return this.repository.save(user);
  }
}
