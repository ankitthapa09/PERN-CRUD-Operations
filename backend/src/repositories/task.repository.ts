import { AppDataSource } from "../config/db";
import { Task } from "../models/Task";

export class TaskRepository {
  private readonly repository = AppDataSource.getRepository(Task);

  findAll(): Promise<Task[]> {
    return this.repository.find({ order: { id: "ASC" } });
  }

  findById(id: number): Promise<Task | null> {
    return this.repository.findOneBy({ id });
  }

  create(title: string, completed = false): Promise<Task> {
    const task = this.repository.create({ title, completed });
    return this.repository.save(task);
  }

  async update(
    task: Task,
    changes: Partial<Pick<Task, "title" | "completed">>,
  ): Promise<Task> {
    Object.assign(task, changes);
    return this.repository.save(task);
  }

  remove(task: Task): Promise<Task> {
    return this.repository.remove(task);
  }
}
