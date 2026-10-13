import type { Request, Response } from "express";
import { TaskService } from "../services/task.service";

const taskService = new TaskService();

const parseId = (value: string | string[]): number => {
  if (Array.isArray(value)) {
    throw new Error("Task id must be a positive integer");
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Task id must be a positive integer");
  }

  return id;
};

export const getTasks = async (_req: Request, res: Response): Promise<void> => {
  const tasks = await taskService.findAll();
  res.json(tasks);
};

export const getTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const task = await taskService.findById(parseId(req.params.id));
  res.json(task);
};

export const createTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, completed } = req.body as {
    title?: unknown;
    completed?: unknown;
  };

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ message: "Completed must be a boolean" });
    return;
  }

  const task = await taskService.create(title.trim(), completed);
  res.status(201).json(task);
};

export const updateTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { title, completed } = req.body as {
    title?: unknown;
    completed?: unknown;
  };

  if (title === undefined && completed === undefined) {
    res.status(400).json({ message: "Provide a title or completed value" });
    return;
  }

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    res.status(400).json({ message: "Title must be a non-empty string" });
    return;
  }

  if (completed !== undefined && typeof completed !== "boolean") {
    res.status(400).json({ message: "Completed must be a boolean" });
    return;
  }

  const task = await taskService.update(parseId(req.params.id), {
    ...(title !== undefined && { title: (title as string).trim() }),
    ...(completed !== undefined && { completed: completed as boolean }),
  });

  res.json(task);
};

export const deleteTask = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await taskService.remove(parseId(req.params.id));
  res.status(204).send();
};
