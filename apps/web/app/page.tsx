"use client";

import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/Auth/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBoardStore } from "@/store/useBoardStore";
import BoardCard from "@/components/Board/BoardCard";
import CreateBoardModal from "@/components/Board/CreateBoardModal";
import Loader from "@/components/Common/Loader";
import { Plus, Kanban, Search } from "lucide-react";

export default function DashboardPage() {
  const { userName } = useAuth();
  const { boards, boardsLoading, fetchBoards } = useBoardStore();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBoards(1, 50);
  }, [fetchBoards]);

  const filtered = search
    ? boards.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : boards;

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header section */}
        <div className="bg-white border-b border-slate-200">
          <div className="px-6 lg:px-8 py-6 max-w-7xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {userName}
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Manage your boards and collaborate with your team</p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="btn btn-primary shrink-0"
                type="button"
              >
                <Plus size={18} />
                New Board
              </button>
            </div>

            {/* Search bar */}
            {boards.length > 0 && (
              <div className="relative mt-5 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search boards..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10 py-2 bg-slate-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 lg:px-8 py-6 max-w-7xl">
          {boardsLoading && boards.length === 0 ? (
            <div className="flex justify-center py-20">
              <Loader size="lg" />
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Kanban size={28} className="text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">No boards yet</h2>
              <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">
                Create your first board to start organizing tasks and collaborating with your team.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn btn-primary"
                type="button"
              >
                <Plus size={18} />
                Create Your First Board
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500 text-sm">No boards match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                  All Boards
                  <span className="ml-2 text-xs font-medium text-slate-400 normal-case tracking-normal">
                    ({filtered.length})
                  </span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <CreateBoardModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </AuthenticatedLayout>
  );
}
