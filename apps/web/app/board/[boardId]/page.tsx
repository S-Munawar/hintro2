"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthenticatedLayout from "@/components/Auth/AuthenticatedLayout";
import BoardHeader from "@/components/Board/BoardHeader";
import ListColumn from "@/components/Board/ListColumn";
import CreateListForm from "@/components/Board/CreateListForm";
import TaskDetailModal from "@/components/Task/TaskDetailModal";
import Loader from "@/components/Common/Loader";
import { useBoardStore } from "@/store/useBoardStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const router = useRouter();
  const { currentBoard, currentBoardLoading, fetchBoard, clearCurrentBoard, optimisticMoveTask } = useBoardStore();
  const { moveTask, fetchTaskDetail, selectedTask, clearSelectedTask } = useTaskStore();
  const { addToast } = useToastStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // ── Real-time sync ─────────────────────────────────────────────────
  useBoardSocket(boardId);

  useEffect(() => {
    fetchBoard(boardId).catch(() => {
      addToast("Board not found", "error");
      router.push("/");
    });
    return () => clearCurrentBoard();
  }, [boardId, fetchBoard, clearCurrentBoard, addToast, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingTaskId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setDraggingTaskId(null);
      const { active, over } = event;
      if (!over || !currentBoard) return;

      const taskId = active.id as string;
      const overId = over.id as string;

      // Find where the task currently lives
      let fromListId = "";
      for (const list of currentBoard.lists) {
        if (list.tasks.some((t) => t.id === taskId)) {
          fromListId = list.id;
          break;
        }
      }
      if (!fromListId) return;

      // Determine target list and position
      let toListId = "";
      let newPosition = 0;

      // Check if dropped on a list (empty list drop target)
      const targetList = currentBoard.lists.find((l) => l.id === overId);
      if (targetList) {
        toListId = targetList.id;
        newPosition = targetList.tasks.length;
      } else {
        // Dropped on another task — find the list that contains it
        for (const list of currentBoard.lists) {
          const idx = list.tasks.findIndex((t) => t.id === overId);
          if (idx !== -1) {
            toListId = list.id;
            newPosition = idx;
            break;
          }
        }
      }

      if (!toListId) return;

      // Same task same position — no-op
      if (fromListId === toListId) {
        const list = currentBoard.lists.find((l) => l.id === fromListId)!;
        const currentIdx = list.tasks.findIndex((t) => t.id === taskId);
        if (currentIdx === newPosition) return;
      }

      // Optimistic update
      optimisticMoveTask(taskId, fromListId, toListId, newPosition);

      try {
        await moveTask(boardId, taskId, { list_id: toListId, position: newPosition });
      } catch {
        // Revert on failure by re-fetching
        addToast("Failed to move task", "error");
        fetchBoard(boardId);
      }
    },
    [currentBoard, boardId, optimisticMoveTask, moveTask, fetchBoard, addToast],
  );

  const handleTaskClick = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
      fetchTaskDetail(boardId, taskId);
    },
    [boardId, fetchTaskDetail],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedTaskId(null);
    clearSelectedTask();
  }, [clearSelectedTask]);

  if (currentBoardLoading || !currentBoard) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-full">
          <Loader size="lg" />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Build droppable ids: each list id + each task id
  const allIds = [
    ...currentBoard.lists.map((l) => l.id),
    ...currentBoard.lists.flatMap((l) => l.tasks.map((t) => t.id)),
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full">
        <BoardHeader board={currentBoard} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
            <div className="flex gap-4 h-full items-start">
              {currentBoard.lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  boardId={boardId}
                  onTaskClick={handleTaskClick}
                />
              ))}
              <CreateListForm boardId={boardId} />
            </div>
          </div>
        </DndContext>

        {selectedTaskId && (
          <TaskDetailModal
            boardId={boardId}
            taskId={selectedTaskId}
            isOpen={!!selectedTaskId}
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
}
