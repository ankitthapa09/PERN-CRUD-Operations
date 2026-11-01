import { request } from "@/lib/http-client";
import type { Task, UpdateTask } from "@/features/tasks/types";

const TASKS_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/tasks";

export const taskApi = {
  getAll(): Promise<Task[]> {
    return request<Task[]>(TASKS_API_URL);
  },

  create(title: string): Promise<Task> {
    return request<Task>(TASKS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  },

  update(id: number, changes: UpdateTask): Promise<Task> {
    return request<Task>(`${TASKS_API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
  },

  remove(id: number): Promise<void> {
    return request<void>(`${TASKS_API_URL}/${id}`, { method: "DELETE" });
  },
};
