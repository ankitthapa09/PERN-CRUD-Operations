import { TaskItem } from "@/features/tasks/components/TaskItem";
import type { Task, UpdateTask } from "@/features/tasks/types";

type TaskListProps = {
  tasks: Task[];
  loading: boolean;
  onUpdate: (id: number, changes: UpdateTask) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function TaskList({
  tasks,
  loading,
  onUpdate,
  onDelete,
}: TaskListProps) {
  if (loading) {
    return <p className="empty-state">Loading your tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">+</span>
        <strong>No tasks yet</strong>
        <span>Add your first task above to get started.</span>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
