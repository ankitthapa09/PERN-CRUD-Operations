import type { FormEvent } from "react";

type TaskFormProps = {
  title: string;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSubmit: () => Promise<void>;
};

export function TaskForm({
  title,
  saving,
  onTitleChange,
  onSubmit,
}: TaskFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        aria-label="New task title"
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="What needs to be done?"
        maxLength={120}
      />
      <button type="submit" disabled={saving || !title.trim()}>
        {saving ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}
