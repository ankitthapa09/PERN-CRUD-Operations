 "use client";

import type { Task } from "@/features/tasks/types";

type TaskHeaderProps = {
  tasks: Task[];
  onLogout: () => Promise<void>;
};

export function TaskHeader({ tasks, onLogout }: TaskHeaderProps) {
  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Daily planning</p>
        <h1>My tasks</h1>
        <p className="subtitle">Keep your work clear and moving forward.</p>
      </div>
      <div className="header-actions">
        <div className="progress-badge">
          <strong>{completedCount}</strong>
          <span>of {tasks.length} done</span>
        </div>
        <button className="logout-button" onClick={() => void onLogout()}>
          Log out
        </button>
      </div>
    </header>
  );
}
