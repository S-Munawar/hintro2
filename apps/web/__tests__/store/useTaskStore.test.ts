import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoardStore } from "@/store/useBoardStore";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  createTask,
  createTaskAssignee,
  createBoardDetail,
  createListWithTasks,
  createActivityLog,
  createApiResponse,
} from "../helpers/factories";

vi.mock("@/lib/api", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("useTaskStore", () => {
  beforeEach(() => {
    useTaskStore.setState({
      selectedTask: null,
      selectedTaskLoading: false,
      activityLogs: [],
      activityPagination: null,
      activityLoading: false,
    });
    useBoardStore.setState({
      boards: [],
      currentBoard: null,
      boardsLoading: false,
      currentBoardLoading: false,
      boardsPagination: null,
    });
    vi.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create task and add to board list", async () => {
      const list = createListWithTasks({ id: "list-1" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      const newTask = createTask({ id: "task-new", list_id: "list-1" });
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(newTask));

      const result = await useTaskStore.getState().createTask("board-1", { list_id: "list-1", title: "New Task" });

      expect(apiPost).toHaveBeenCalledWith("/boards/board-1/tasks", { list_id: "list-1", title: "New Task" });
      expect(result).toEqual(newTask);
      const boardList = useBoardStore.getState().currentBoard!.lists[0];
      expect(boardList.tasks).toHaveLength(1);
    });

    it("should propagate error on API failure", async () => {
      const list = createListWithTasks({ id: "list-1" });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiPost).mockRejectedValue(new Error("Server error"));

      await expect(
        useTaskStore.getState().createTask("board-1", { list_id: "list-1", title: "New" })
      ).rejects.toThrow("Server error");
    });

    it("should not modify board when currentBoard is null", async () => {
      const newTask = createTask({ id: "task-new", list_id: "list-1" });
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(newTask));

      const result = await useTaskStore.getState().createTask("board-1", { list_id: "list-1", title: "New" });
      expect(result).toEqual(newTask);
      expect(useBoardStore.getState().currentBoard).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update task in board list", async () => {
      const task = createTask({ id: "task-1", title: "Original" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      const updated = { ...task, title: "Updated" };
      vi.mocked(apiPut).mockResolvedValue(createApiResponse(updated));

      const result = await useTaskStore.getState().updateTask("board-1", "task-1", { title: "Updated" });

      expect(result.title).toBe("Updated");
      const boardTask = useBoardStore.getState().currentBoard!.lists[0].tasks[0];
      expect(boardTask.title).toBe("Updated");
    });

    it("should also update selectedTask if same id", async () => {
      const task = createTask({ id: "task-1", title: "Original" });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      const updated = { ...task, title: "Updated" };
      vi.mocked(apiPut).mockResolvedValue(createApiResponse(updated));

      await useTaskStore.getState().updateTask("board-1", "task-1", { title: "Updated" });

      expect(useTaskStore.getState().selectedTask!.title).toBe("Updated");
    });

    it("should propagate error on API failure", async () => {
      const task = createTask({ id: "task-1", title: "Original" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiPut).mockRejectedValue(new Error("Update failed"));

      await expect(
        useTaskStore.getState().updateTask("board-1", "task-1", { title: "Updated" })
      ).rejects.toThrow("Update failed");
    });

    it("should not update selectedTask if different id", async () => {
      const task = createTask({ id: "task-1", title: "Original" });
      useTaskStore.setState({ selectedTask: createTask({ id: "task-other", title: "Other" }) });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      const updated = { ...task, title: "Updated" };
      vi.mocked(apiPut).mockResolvedValue(createApiResponse(updated));

      await useTaskStore.getState().updateTask("board-1", "task-1", { title: "Updated" });

      expect(useTaskStore.getState().selectedTask!.title).toBe("Other");
    });
  });

  describe("deleteTask", () => {
    it("should remove task from board list", async () => {
      const task = createTask({ id: "task-1" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useTaskStore.getState().deleteTask("board-1", "task-1");

      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(0);
    });

    it("should clear selectedTask if it matches", async () => {
      const task = createTask({ id: "task-1" });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useTaskStore.getState().deleteTask("board-1", "task-1");

      expect(useTaskStore.getState().selectedTask).toBeNull();
    });

    it("should propagate error on API failure", async () => {
      const task = createTask({ id: "task-1" });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiDelete).mockRejectedValue(new Error("Delete failed"));

      await expect(
        useTaskStore.getState().deleteTask("board-1", "task-1")
      ).rejects.toThrow("Delete failed");

      // Board should be unchanged
      expect(useBoardStore.getState().currentBoard!.lists[0].tasks).toHaveLength(1);
    });
  });

  describe("moveTask", () => {
    it("should call API to move task", async () => {
      vi.mocked(apiPut).mockResolvedValue(createApiResponse(undefined));

      await useTaskStore.getState().moveTask("board-1", "task-1", { list_id: "list-2", position: 0 });

      expect(apiPut).toHaveBeenCalledWith("/boards/board-1/tasks/task-1/move", { list_id: "list-2", position: 0 });
    });

    it("should propagate error on API failure", async () => {
      vi.mocked(apiPut).mockRejectedValue(new Error("Move failed"));

      await expect(
        useTaskStore.getState().moveTask("board-1", "task-1", { list_id: "list-2", position: 0 })
      ).rejects.toThrow("Move failed");
    });
  });

  describe("fetchTaskDetail", () => {
    it("should fetch and set selectedTask", async () => {
      const task = createTask();
      vi.mocked(apiGet).mockResolvedValue(createApiResponse(task));

      await useTaskStore.getState().fetchTaskDetail("board-1", "task-1");

      expect(useTaskStore.getState().selectedTask).toEqual(task);
      expect(useTaskStore.getState().selectedTaskLoading).toBe(false);
    });

    it("should set loading state", async () => {
      let resolvePromise: (value: any) => void;
      vi.mocked(apiGet).mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }) as any);

      const promise = useTaskStore.getState().fetchTaskDetail("board-1", "task-1");
      expect(useTaskStore.getState().selectedTaskLoading).toBe(true);

      resolvePromise!(createApiResponse(createTask()));
      await promise;
      expect(useTaskStore.getState().selectedTaskLoading).toBe(false);
    });

    it("should reset loading on error", async () => {
      vi.mocked(apiGet).mockRejectedValue(new Error("Not found"));

      await useTaskStore.getState().fetchTaskDetail("board-1", "task-1").catch(() => {});

      expect(useTaskStore.getState().selectedTaskLoading).toBe(false);
    });
  });

  describe("clearSelectedTask", () => {
    it("should set selectedTask to null", () => {
      useTaskStore.setState({ selectedTask: createTask() });
      useTaskStore.getState().clearSelectedTask();
      expect(useTaskStore.getState().selectedTask).toBeNull();
    });
  });

  describe("assignUser", () => {
    it("should add assignee to selectedTask and board list", async () => {
      const task = createTask({ id: "task-1", assignees: [] });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      const assignee = createTaskAssignee();
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(assignee));

      const result = await useTaskStore.getState().assignUser("board-1", "task-1", "user-2");

      expect(result).toEqual(assignee);
      expect(useTaskStore.getState().selectedTask!.assignees).toHaveLength(1);
      expect(useBoardStore.getState().currentBoard!.lists[0].tasks[0].assignees).toHaveLength(1);
    });

    it("should propagate error on API failure", async () => {
      const task = createTask({ id: "task-1", assignees: [] });
      useTaskStore.setState({ selectedTask: task });
      vi.mocked(apiPost).mockRejectedValue(new Error("Assign failed"));

      await expect(
        useTaskStore.getState().assignUser("board-1", "task-1", "user-2")
      ).rejects.toThrow("Assign failed");
    });

    it("should not update selectedTask if different task id", async () => {
      const task = createTask({ id: "task-other", assignees: [] });
      useTaskStore.setState({ selectedTask: task });
      const assignee = createTaskAssignee();
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(assignee));

      await useTaskStore.getState().assignUser("board-1", "task-1", "user-2");

      expect(useTaskStore.getState().selectedTask!.assignees).toHaveLength(0);
    });
  });

  describe("unassignUser", () => {
    it("should remove assignee from selectedTask and board list", async () => {
      const assignee = createTaskAssignee();
      const task = createTask({ id: "task-1", assignees: [assignee] });
      useTaskStore.setState({ selectedTask: task });
      const list = createListWithTasks({ id: "list-1", tasks: [task] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useTaskStore.getState().unassignUser("board-1", "task-1", "user-2");

      expect(useTaskStore.getState().selectedTask!.assignees).toHaveLength(0);
      expect(useBoardStore.getState().currentBoard!.lists[0].tasks[0].assignees).toHaveLength(0);
    });

    it("should propagate error on API failure", async () => {
      const assignee = createTaskAssignee();
      const task = createTask({ id: "task-1", assignees: [assignee] });
      useTaskStore.setState({ selectedTask: task });
      vi.mocked(apiDelete).mockRejectedValue(new Error("Unassign failed"));

      await expect(
        useTaskStore.getState().unassignUser("board-1", "task-1", "user-2")
      ).rejects.toThrow("Unassign failed");
    });
  });

  describe("fetchActivity", () => {
    it("should fetch activity logs", async () => {
      const logs = [createActivityLog(), createActivityLog({ id: "activity-2" })];
      vi.mocked(apiGet).mockResolvedValue(createApiResponse(logs, { pagination: { page: 1, limit: 20, total: 2, pages: 1 } }));

      await useTaskStore.getState().fetchActivity("board-1", "task-1");

      expect(apiGet).toHaveBeenCalledWith("/boards/board-1/activity", { page: 1, limit: 20, task_id: "task-1" });
      expect(useTaskStore.getState().activityLogs).toEqual(logs);
      expect(useTaskStore.getState().activityLoading).toBe(false);
    });

    it("should fetch without task_id filter", async () => {
      vi.mocked(apiGet).mockResolvedValue(createApiResponse([]));

      await useTaskStore.getState().fetchActivity("board-1");

      expect(apiGet).toHaveBeenCalledWith("/boards/board-1/activity", { page: 1, limit: 20 });
    });

    it("should forward page parameter", async () => {
      vi.mocked(apiGet).mockResolvedValue(createApiResponse([], { pagination: { page: 2, limit: 20, total: 30, pages: 2 } }));

      await useTaskStore.getState().fetchActivity("board-1", "task-1", 2);

      expect(apiGet).toHaveBeenCalledWith("/boards/board-1/activity", { page: 2, limit: 20, task_id: "task-1" });
    });

    it("should set activityPagination", async () => {
      const pagination = { page: 1, limit: 20, total: 5, pages: 1 };
      vi.mocked(apiGet).mockResolvedValue(createApiResponse([], { pagination }));

      await useTaskStore.getState().fetchActivity("board-1");

      expect(useTaskStore.getState().activityPagination).toEqual(pagination);
    });

    it("should reset loading on error", async () => {
      vi.mocked(apiGet).mockRejectedValue(new Error("Fetch failed"));

      await useTaskStore.getState().fetchActivity("board-1").catch(() => {});

      expect(useTaskStore.getState().activityLoading).toBe(false);
    });
  });
});
