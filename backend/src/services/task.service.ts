import { Task } from "../models/Task";
import { TaskRepository } from "../repositories/task.repository";

export class TaskNotFoundError extends Error {
  constructor() {
    super("Task not found");
    this.name = "TaskNotFoundError";
  }
}

export class TaskService {
  constructor(private readonly taskRepository = new TaskRepository()) {}

  findAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  findById(id: number): Promise<Task> {
    return this.taskRepository.findById(id).then((task) => {
      if (!task) {
        throw new TaskNotFoundError();
      }

      return task;
    });
  }

  create(title: string, completed?: boolean): Promise<Task> {
    return this.taskRepository.create(title, completed);
  }

  async update(
    id: number,
    changes: Partial<Pick<Task, "title" | "completed">>,
  ): Promise<Task> {
    const task = await this.findById(id);
    return this.taskRepository.update(task, changes);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findById(id);
    await this.taskRepository.remove(task);
  }
}
