"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";

interface CreateTaskFormProps {
  boardId: string;
  listId: string;
}

export default function CreateTaskForm({ boardId, listId }: CreateTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTask } = useTaskStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await createTask(boardId, { list_id: listId, title: title.trim() });
      setTitle("");
      setIsOpen(false);
    } catch {
      addToast("Failed to create task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors"
        type="button"
      >
        <Plus size={15} />
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-1">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="input"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setTitle("");
            setIsOpen(false);
          }
        }}
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="btn btn-primary text-xs py-1.5 px-3"
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={() => { setTitle(""); setIsOpen(false); }}
          className="btn btn-ghost text-xs py-1.5 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
