"use client";

import { FormEvent, useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  completed: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/tasks";

async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message ?? "Something went wrong. Please try again.";
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(await getErrorMessage(response));
        setTasks((await response.json()) as Task[]);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Unable to load tasks.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTasks();
  }, []);

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const task = (await response.json()) as Task;
      setTasks((currentTasks) => [...currentTasks, task]);
      setTitle("");
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Unable to add task.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateTask = async (
    id: number,
    changes: Partial<Pick<Task, "title" | "completed">>,
  ) => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      const updatedTask = (await response.json()) as Task;
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Unable to update task.",
      );
    }
  };

  const deleteTask = async (id: number) => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await getErrorMessage(response));
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete task.",
      );
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <main className="page-shell">
      <section className="app-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">Daily planning</p>
            <h1>My tasks</h1>
            <p className="subtitle">Keep your work clear and moving forward.</p>
          </div>
          <div className="progress-badge">
            <strong>{completedCount}</strong>
            <span>of {tasks.length} done</span>
          </div>
        </header>

        <form className="task-form" onSubmit={createTask}>
          <input
            aria-label="New task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            maxLength={120}
          />
          <button type="submit" disabled={saving || !title.trim()}>
            {saving ? "Adding..." : "Add task"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="task-list">
          {loading ? (
            <p className="empty-state">Loading your tasks...</p>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">+</span>
              <strong>No tasks yet</strong>
              <span>Add your first task above to get started.</span>
            </div>
          ) : (
            tasks.map((task) => (
              <article
                className={`task-row ${task.completed ? "is-done" : ""}`}
                key={task.id}
              >
                <button
                  className="check-button"
                  aria-label={
                    task.completed ? "Mark as active" : "Mark as completed"
                  }
                  onClick={() =>
                    void updateTask(task.id, { completed: !task.completed })
                  }
                >
                  {task.completed ? "✓" : ""}
                </button>

                {editingId === task.id ? (
                  <input
                    className="edit-input"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && editingTitle.trim()) {
                        void updateTask(task.id, { title: editingTitle.trim() });
                        setEditingId(null);
                      }
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="task-title">{task.title}</span>
                )}

                <div className="task-actions">
                  {editingId === task.id ? (
                    <button
                      className="action-button save"
                      onClick={() => {
                        if (editingTitle.trim()) {
                          void updateTask(task.id, { title: editingTitle.trim() });
                          setEditingId(null);
                        }
                      }}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="action-button"
                      onClick={() => {
                        setEditingId(task.id);
                        setEditingTitle(task.title);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="action-button delete"
                    onClick={() => void deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
