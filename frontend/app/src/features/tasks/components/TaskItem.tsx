"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import type { Task, UpdateTask } from "@/features/tasks/types";

type TaskItemProps = {
  task: Task;
  onUpdate: (id: number, changes: UpdateTask) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(task.title);

  const saveTitle = async () => {
    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) return;

    await onUpdate(task.id, { title: trimmedTitle });
    setEditing(false);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") void saveTitle();
    if (event.key === "Escape") setEditing(false);
  };

  const startEditing = () => {
    setEditingTitle(task.title);
    setEditing(true);
  };

  return (
    <article className={`task-row ${task.completed ? "is-done" : ""}`}>
      <button
        className="check-button"
        aria-label={task.completed ? "Mark as active" : "Mark as completed"}
        onClick={() => void onUpdate(task.id, { completed: !task.completed })}
      >
        {task.completed ? "✓" : ""}
      </button>

      {editing ? (
        <input
          className="edit-input"
          value={editingTitle}
          onChange={(event) => setEditingTitle(event.target.value)}
          onKeyDown={handleEditKeyDown}
          autoFocus
        />
      ) : (
        <span className="task-title">{task.title}</span>
      )}

      <div className="task-actions">
        {editing ? (
          <button className="action-button save" onClick={() => void saveTitle()}>
            Save
          </button>
        ) : (
          <button className="action-button" onClick={startEditing}>
            Edit
          </button>
        )}
        <button
          className="action-button delete"
          onClick={() => void onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
