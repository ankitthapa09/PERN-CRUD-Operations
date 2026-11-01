"use client";

import { useCallback, useEffect, useState } from "react";
import { taskApi } from "@/features/tasks/api";
import type { Task, UpdateTask } from "@/features/tasks/types";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasks(await taskApi.getAll());
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Unable to load tasks."));
      } finally {
        setLoading(false);
      }
    };

    void loadTasks();
  }, []);

  const createTask = useCallback(async (title: string): Promise<boolean> => {
    setSaving(true);
    setError("");
    try {
      const task = await taskApi.create(title);
      setTasks((currentTasks) => [...currentTasks, task]);
      return true;
    } catch (createError) {
      setError(getErrorMessage(createError, "Unable to add task."));
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateTask = useCallback(async (id: number, changes: UpdateTask) => {
    setError("");
    try {
      const updatedTask = await taskApi.update(id, changes);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch (updateError) {
      setError(getErrorMessage(updateError, "Unable to update task."));
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setError("");
    try {
      await taskApi.remove(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete task."));
    }
  }, []);

  return { tasks, loading, saving, error, createTask, updateTask, deleteTask };
}
