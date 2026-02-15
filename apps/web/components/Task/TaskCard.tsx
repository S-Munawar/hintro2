"use client";

import type { Task } from "@/types";
import { Calendar } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
    >
      <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {task.title}
      </p>

      {task.description && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
      )}

      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {/* Priority badge */}
        <span className={`priority-${task.priority}`}>
          {task.priority}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span className={`inline-flex items-center gap-1 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
            <Calendar size={11} />
            {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center -space-x-1.5 ml-auto">
            {task.assignees.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="avatar avatar-xs bg-indigo-100 text-indigo-700 border-2 border-white"
                title={`${a.user.first_name} ${a.user.last_name}`}
              >
                {a.user.first_name[0]}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <span className="text-[10px] text-slate-400 ml-1.5">+{task.assignees.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
