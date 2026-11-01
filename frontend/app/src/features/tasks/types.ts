export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export type UpdateTask = Partial<Pick<Task, "title" | "completed">>;
