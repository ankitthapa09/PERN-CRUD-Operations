"use client";

import { useState } from "react";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskHeader } from "@/features/tasks/components/TaskHeader";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

export function TaskManager() {
  const { tasks, loading, saving, error, createTask, updateTask, deleteTask } =
    useTasks();
  const [title, setTitle] = useState("");

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (await createTask(trimmedTitle)) {
      setTitle("");
    }
  };

  return (
    <main className="page-shell">
      <section className="app-card">
        <TaskHeader tasks={tasks} />
        <TaskForm
          title={title}
          saving={saving}
          onTitleChange={setTitle}
          onSubmit={handleCreateTask}
        />
        {error && <p className="error-message">{error}</p>}
        <TaskList
          tasks={tasks}
          loading={loading}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      </section>
    </main>
  );
}
