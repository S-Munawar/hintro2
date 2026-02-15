"use client";

import { useState } from "react";
import { useBoardStore } from "@/store/useBoardStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "next/navigation";
import Modal from "@/components/Common/Modal";
import { Check } from "lucide-react";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#64748b",
];

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: CreateBoardModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]!);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createBoard } = useBoardStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const board = await createBoard({ name: name.trim(), description: description.trim() || undefined, color });
      addToast("Board created!", "success");
      onClose();
      setName("");
      setDescription("");
      setColor(COLORS[0]!);
      router.push(`/board/${board.id}`);
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to create board", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Board" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="board-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Board Name <span className="text-red-400">*</span>
          </label>
          <input
            id="board-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Product Roadmap"
            className="input"
            required
            maxLength={255}
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="board-desc" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="board-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this board about?"
            rows={3}
            className="input resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2.5">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                    : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={14} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {name.trim() && (
          <div className="card p-4 bg-slate-50 border-dashed">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
              <span className="text-sm font-semibold text-slate-800">{name}</span>
            </div>
            {description && (
              <p className="text-xs text-slate-500 mt-1 ml-[18px]">{description}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="loader-spinner loader-sm border-white/30 border-t-white" />
                Creating...
              </span>
            ) : (
              "Create Board"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
