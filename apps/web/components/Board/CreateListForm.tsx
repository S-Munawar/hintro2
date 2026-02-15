"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import { useToastStore } from "@/store/useToastStore";
import { Plus } from "lucide-react";

interface CreateListFormProps {
  boardId: string;
}

export default function CreateListForm({ boardId }: CreateListFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createList } = useBoardStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createList(boardId, name.trim());
      setName("");
      setIsOpen(false);
    } catch {
      addToast("Failed to create list", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-72 shrink-0 px-4 py-3 bg-slate-100/80 text-slate-400 hover:bg-slate-200/80 hover:text-slate-600 rounded-xl text-sm font-medium transition-all border-2 border-dashed border-slate-200 hover:border-slate-300"
        type="button"
      >
        <Plus size={18} />
        Add List
      </button>
    );
  }

  return (
    <div className="kanban-column p-3">
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name..."
          className="input"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") { setName(""); setIsOpen(false); }
          }}
        />
        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="btn btn-primary text-xs py-1.5 px-3"
          >
            {isSubmitting ? "Adding..." : "Add List"}
          </button>
          <button
            type="button"
            onClick={() => { setName(""); setIsOpen(false); }}
            className="btn btn-ghost text-xs py-1.5 px-3"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
