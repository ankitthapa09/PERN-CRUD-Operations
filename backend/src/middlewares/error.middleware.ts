import type { NextFunction, Request, Response } from "express";
import { TaskNotFoundError } from "../services/task.service";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof TaskNotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }

  if (error instanceof Error && error.message === "Task id must be a positive integer") {
    res.status(400).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};
