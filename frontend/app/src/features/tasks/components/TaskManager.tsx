"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/features/auth/api";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskHeader } from "@/features/tasks/components/TaskHeader";
import { TaskList } from "@/features/tasks/components/TaskList";
import { useTasks } from "@/features/tasks/hooks/use-tasks";

export function TaskManager() {
  const router = useRouter();
  const { tasks, loading, saving, error, createTask, updateTask, deleteTask } =
    useTasks();
  const [title, setTitle] = useState("");
  const [logoutError, setLogoutError] = useState("");

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (await createTask(trimmedTitle)) {
      setTitle("");
    }
  };

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await authApi.logout();
      router.push("/login");
    } catch (logoutRequestError) {
      setLogoutError(
        logoutRequestError instanceof Error
          ? logoutRequestError.message
          : "Unable to log out. Please try again.",
      );
    }
  };

  return (
    <main className="page-shell">
      <section className="app-card">
        <TaskHeader tasks={tasks} onLogout={handleLogout} />
        <TaskForm
          title={title}
          saving={saving}
          onTitleChange={setTitle}
          onSubmit={handleCreateTask}
        />
        {error && <p className="error-message">{error}</p>}
        {logoutError && <p className="error-message">{logoutError}</p>}
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
