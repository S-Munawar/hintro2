import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBoardSocket } from "@/hooks/useBoardSocket";
import { useSocketStore } from "@/store/useSocketStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useTaskStore } from "@/store/useTaskStore";
import { createBoardDetail, createListWithTasks, createTask } from "../helpers/factories";
import type { Task, ListWithTasks } from "@/types";

describe("useBoardSocket", () => {
  const mockJoinBoard = vi.fn();
  const mockLeaveBoard = vi.fn();
  let mockSocket: {
    on: ReturnType<typeof vi.fn>;
    off: ReturnType<typeof vi.fn>;
    emit: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
    useSocketStore.setState({
      socket: mockSocket as any,
      connected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinBoard: mockJoinBoard,
      leaveBoard: mockLeaveBoard,
    });
    useBoardStore.setState({ currentBoard: null });
    useTaskStore.setState({ selectedTask: null });
    vi.clearAllMocks();
  });

  it("should join board on mount when connected", () => {
    renderHook(() => useBoardSocket("board-1"));
    expect(mockJoinBoard).toHaveBeenCalledWith("board-1");
  });

  it("should not join board when socket is null", () => {
    useSocketStore.setState({ socket: null });
    renderHook(() => useBoardSocket("board-1"));
    expect(mockJoinBoard).not.toHaveBeenCalled();
  });

  it("should not join board when not connected", () => {
    useSocketStore.setState({ connected: false });
    renderHook(() => useBoardSocket("board-1"));
    expect(mockJoinBoard).not.toHaveBeenCalled();
  });

  it("should register all socket event listeners", () => {
    renderHook(() => useBoardSocket("board-1"));

    const registeredEvents = mockSocket.on.mock.calls.map((call: unknown[]) => call[0]);
    expect(registeredEvents).toContain("task:created");
    expect(registeredEvents).toContain("task:updated");
    expect(registeredEvents).toContain("task:deleted");
    expect(registeredEvents).toContain("task:moved");
    expect(registeredEvents).toContain("list:created");
    expect(registeredEvents).toContain("list:updated");
    expect(registeredEvents).toContain("list:deleted");
    expect(registeredEvents).toContain("board:updated");
    expect(registeredEvents).toContain("member:added");
    expect(registeredEvents).toContain("member:removed");
  });

  it("should leave board and unregister listeners on unmount", () => {
    const { unmount } = renderHook(() => useBoardSocket("board-1"));

    unmount();

    expect(mockLeaveBoard).toHaveBeenCalledWith("board-1");
    const unregisteredEvents = mockSocket.off.mock.calls.map((call: unknown[]) => call[0]);
    expect(unregisteredEvents).toContain("task:created");
    expect(unregisteredEvents).toContain("task:updated");
    expect(unregisteredEvents).toContain("task:deleted");
    expect(unregisteredEvents).toContain("task:moved");
    expect(unregisteredEvents).toContain("list:created");
    expect(unregisteredEvents).toContain("list:updated");
    expect(unregisteredEvents).toContain("list:deleted");
    expect(unregisteredEvents).toContain("board:updated");
    expect(unregisteredEvents).toContain("member:added");
    expect(unregisteredEvents).toContain("member:removed");
  });

  describe("event handlers", () => {
    function getHandler(eventName: string): (...args: unknown[]) => void {
      const call = mockSocket.on.mock.calls.find((c: unknown[]) => c[0] === eventName);
      return call![1] as (...args: unknown[]) => void;
    }

    it("task:created should add task to correct list", () => {
      const list = createListWithTasks({ id: "list-1", tasks: [] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:created");
      const newTask = createTask({ id: "task-new", list_id: "list-1" });
      handler({ boardId: "board-1", task: newTask });

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(1);
      expect(useBoardStore.getState().currentBoard!.lists[0].tasks[0].id).toBe("task-new");
    });

    it("task:created should not modify board when boardId mismatches", () => {
      const list = createListWithTasks({ id: "list-1", tasks: [] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:created");
      const newTask = createTask({ id: "task-new", list_id: "list-1" });
      handler({ boardId: "board-other", task: newTask });

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(0);
    });

    it("task:created should not modify when currentBoard is null", () => {
      useBoardStore.setState({ currentBoard: null });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:created");
      handler({ boardId: "board-1", task: createTask({ id: "task-new" }) });

      expect(useBoardStore.getState().currentBoard).toBeNull();
    });

    it("task:created should not duplicate existing tasks", () => {
      const task = createTask({ id: "task-1", list_id: "list-1" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:created");
      handler({ boardId: "board-1", task: task });

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(1);
    });

    it("task:updated should update task in list", () => {
      const task = createTask({ id: "task-1", list_id: "list-1", title: "Old" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:updated");
      handler({ boardId: "board-1", task: { ...task, title: "New" } });

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks[0].title).toBe("New");
    });

    it("task:updated should also update selectedTask", () => {
      const task = createTask({ id: "task-1", list_id: "list-1", title: "Old" });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:updated");
      handler({ boardId: "board-1", task: { ...task, title: "New" } });

      expect(useTaskStore.getState().selectedTask!.title).toBe("New");
    });

    it("task:deleted should remove task from list", () => {
      const task = createTask({ id: "task-1", list_id: "list-1" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:deleted");
      handler({ boardId: "board-1", taskId: "task-1" });

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(0);
    });

    it("task:deleted should clear selectedTask if matching", () => {
      const task = createTask({ id: "task-1" });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:deleted");
      handler({ boardId: "board-1", taskId: "task-1" });

      expect(useTaskStore.getState().selectedTask).toBeNull();
    });

    it("task:moved should move task to new list", () => {
      const task = createTask({ id: "task-1", list_id: "list-1", position: 0 });
      const list1 = createListWithTasks({ id: "list-1", tasks: [task] });
      const list2 = createListWithTasks({ id: "list-2", tasks: [] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list1, list2] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:moved");
      handler({ boardId: "board-1", task: { ...task, list_id: "list-2", position: 0 } });

      const state = useBoardStore.getState().currentBoard!;
      expect(state.lists.find((l) => l.id === "list-1")!.tasks).toHaveLength(0);
      expect(state.lists.find((l) => l.id === "list-2")!.tasks).toHaveLength(1);
    });

    it("list:created should add list to board", () => {
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("list:created");
      const newList = createListWithTasks({ id: "list-new", name: "New List", tasks: [] });
      handler({ boardId: "board-1", list: newList });

      expect(useBoardStore.getState().currentBoard!.lists).toHaveLength(1);
    });

    it("list:created should not duplicate existing lists", () => {
      const list = createListWithTasks({ id: "list-1" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("list:created");
      handler({ boardId: "board-1", list: list });

      expect(useBoardStore.getState().currentBoard!.lists).toHaveLength(1);
    });

    it("list:updated should update list properties", () => {
      const list = createListWithTasks({ id: "list-1", name: "Old Name" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("list:updated");
      handler({ boardId: "board-1", list: { ...list, name: "New Name" } });

      expect(useBoardStore.getState().currentBoard!.lists[0].name).toBe("New Name");
    });

    it("list:updated should not modify when boardId mismatches", () => {
      const list = createListWithTasks({ id: "list-1", name: "Old Name" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("list:updated");
      handler({ boardId: "board-other", list: { ...list, name: "New Name" } });

      expect(useBoardStore.getState().currentBoard!.lists[0].name).toBe("Old Name");
    });

    it("list:deleted should remove list from board", () => {
      const list = createListWithTasks({ id: "list-1" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("list:deleted");
      handler({ boardId: "board-1", listId: "list-1" });

      expect(useBoardStore.getState().currentBoard!.lists).toHaveLength(0);
    });

    it("board:updated should patch currentBoard", () => {
      useBoardStore.setState({
        currentBoard: createBoardDetail({ id: "board-1", name: "Old Name" }),
      });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("board:updated");
      handler({ boardId: "board-1", board: { name: "New Name" } });

      expect(useBoardStore.getState().currentBoard!.name).toBe("New Name");
    });

    it("member:removed should remove member from board", () => {
      const member = { id: "m1", user_id: "user-2", board_id: "board-1", role: "editor", joined_at: "", user: {} };
      useBoardStore.setState({
        currentBoard: createBoardDetail({ id: "board-1", members: [member as any] }),
      });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("member:removed");
      handler({ boardId: "board-1", userId: "user-2" });

      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(0);
    });

    it("member:added should add member to board", () => {
      useBoardStore.setState({
        currentBoard: createBoardDetail({ id: "board-1", members: [] }),
      });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("member:added");
      const newMember = { id: "m2", user_id: "user-3", board_id: "board-1", role: "viewer", joined_at: "", user: {} };
      handler({ boardId: "board-1", member: newMember });

      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(1);
    });

    it("member:added should not duplicate existing members", () => {
      const member = { id: "m1", user_id: "user-2", board_id: "board-1", role: "editor", joined_at: "", user: {} };
      useBoardStore.setState({
        currentBoard: createBoardDetail({ id: "board-1", members: [member as any] }),
      });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("member:added");
      handler({ boardId: "board-1", member: member });

      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(1);
    });

    it("member:added should not modify when boardId mismatches", () => {
      useBoardStore.setState({
        currentBoard: createBoardDetail({ id: "board-1", members: [] }),
      });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("member:added");
      handler({ boardId: "board-other", member: { id: "m2" } });

      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(0);
    });

    it("task:moved should handle same-list reorder", () => {
      const task1 = createTask({ id: "task-1", list_id: "list-1", position: 0 });
      const task2 = createTask({ id: "task-2", list_id: "list-1", position: 1 });
      const list = createListWithTasks({ id: "list-1", tasks: [task1, task2] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ id: "board-1", lists: [list] }) });

      renderHook(() => useBoardSocket("board-1"));
      const handler = getHandler("task:moved");
      // Move task-1 to position 1 (within same list)
      handler({ boardId: "board-1", task: { ...task1, list_id: "list-1", position: 1 } });

      const tasks = useBoardStore.getState().currentBoard!.lists[0].tasks;
      expect(tasks).toHaveLength(2);
      // Positions should be re-indexed 
      expect(tasks[0].position).toBe(0);
      expect(tasks[1].position).toBe(1);
    });
  });
});
