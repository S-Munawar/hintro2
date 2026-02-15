"use client";

import Link from "next/link";
import { Users, List, ArrowUpRight } from "lucide-react";
import type { BoardSummary } from "@/types";

interface BoardCardProps {
  board: BoardSummary;
}

export default function BoardCard({ board }: BoardCardProps) {
  return (
    <Link
      href={`/board/${board.id}`}
      className="group card card-interactive block p-5 relative overflow-hidden"
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: board.color }}
      />

      <div className="flex items-start justify-between gap-2 mt-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-3 h-3 rounded-[4px] shrink-0 ring-1 ring-black/5"
            style={{ backgroundColor: board.color }}
          />
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {board.name}
          </h3>
        </div>
        <ArrowUpRight
          size={16}
          className="text-slate-300 group-hover:text-indigo-500 transition-all shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>

      {board.description && (
        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{board.description}</p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <List size={13} />
            {board._count.lists}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {board._count.members}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="avatar avatar-xs bg-indigo-100 text-indigo-700">
            {board.owner.first_name[0]}
          </div>
          <span className="text-xs text-slate-400">{board.owner.first_name}</span>
        </div>
      </div>
    </Link>
  );
}
