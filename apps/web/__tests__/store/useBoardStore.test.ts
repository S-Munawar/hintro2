import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBoardStore } from "@/store/useBoardStore";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import {
  createBoardSummary,
  createBoardDetail,
  createBoardCreated,
  createBoardMember,
  createList,
  createListWithTasks,
  createTask,
  createApiResponse,
} from "../helpers/factories";

vi.mock("@/lib/api", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("useBoardStore", () => {
  beforeEach(() => {
    useBoardStore.setState({
      boards: [],
      boardsPagination: null,
      boardsLoading: false,
      currentBoard: null,
      currentBoardLoading: false,
    });
    vi.clearAllMocks();
  });

  describe("fetchBoards", () => {
    it("should fetch and set boards", async () => {
      const boards = [createBoardSummary(), createBoardSummary({ id: "board-2", name: "Board 2" })];
      vi.mocked(apiGet).mockResolvedValue(createApiResponse(boards, { pagination: { page: 1, limit: 20, total: 2, pages: 1 } }));

      await useBoardStore.getState().fetchBoards();

      expect(apiGet).toHaveBeenCalledWith("/boards", { page: 1, limit: 20 });
      expect(useBoardStore.getState().boards).toEqual(boards);
      expect(useBoardStore.getState().boardsLoading).toBe(false);
    });

    it("should set boardsLoading during fetch", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => { resolvePromise = resolve; });
      vi.mocked(apiGet).mockReturnValue(promise as any);

      const fetchPromise = useBoardStore.getState().fetchBoards();
      expect(useBoardStore.getState().boardsLoading).toBe(true);

      resolvePromise!(createApiResponse([]));
      await fetchPromise;
      expect(useBoardStore.getState().boardsLoading).toBe(false);
    });

    it("should set boardsLoading to false even on error", async () => {
      vi.mocked(apiGet).mockRejectedValue(new Error("fail"));
      await expect(useBoardStore.getState().fetchBoards()).rejects.toThrow();
      expect(useBoardStore.getState().boardsLoading).toBe(false);
    });
  });

  describe("fetchBoard", () => {
    it("should fetch and set currentBoard", async () => {
      const board = createBoardDetail();
      vi.mocked(apiGet).mockResolvedValue(createApiResponse(board));

      await useBoardStore.getState().fetchBoard("board-1");

      expect(apiGet).toHaveBeenCalledWith("/boards/board-1");
      expect(useBoardStore.getState().currentBoard).toEqual(board);
      expect(useBoardStore.getState().currentBoardLoading).toBe(false);
    });
  });

  describe("createBoard", () => {
    it("should create board and add to boards list", async () => {
      const created = createBoardCreated();
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(created));

      const result = await useBoardStore.getState().createBoard({ name: "New Board" });

      expect(apiPost).toHaveBeenCalledWith("/boards", { name: "New Board" });
      expect(result).toEqual(created);
      expect(useBoardStore.getState().boards).toHaveLength(1);
      expect(useBoardStore.getState().boards[0].name).toBe("Test Board");
    });
  });

  describe("updateBoard", () => {
    it("should update board in list", async () => {
      const board = createBoardSummary();
      useBoardStore.setState({ boards: [board] });
      vi.mocked(apiPut).mockResolvedValue(createApiResponse({ ...board, name: "Updated" }));

      await useBoardStore.getState().updateBoard("board-1", { name: "Updated" });

      expect(useBoardStore.getState().boards[0].name).toBe("Updated");
    });

    it("should update currentBoard if it matches", async () => {
      const board = createBoardDetail();
      useBoardStore.setState({ boards: [createBoardSummary()], currentBoard: board });
      vi.mocked(apiPut).mockResolvedValue(createApiResponse({ ...board, name: "Updated" }));

      await useBoardStore.getState().updateBoard("board-1", { name: "Updated" });

      expect(useBoardStore.getState().currentBoard!.name).toBe("Updated");
    });
  });

  describe("deleteBoard", () => {
    it("should remove board from list", async () => {
      useBoardStore.setState({ boards: [createBoardSummary()] });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useBoardStore.getState().deleteBoard("board-1");

      expect(useBoardStore.getState().boards).toHaveLength(0);
    });

    it("should clear currentBoard if it matches", async () => {
      useBoardStore.setState({
        boards: [createBoardSummary()],
        currentBoard: createBoardDetail(),
      });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useBoardStore.getState().deleteBoard("board-1");

      expect(useBoardStore.getState().currentBoard).toBeNull();
    });
  });

  describe("addMember", () => {
    it("should add member to currentBoard", async () => {
      const board = createBoardDetail();
      const member = createBoardMember();
      useBoardStore.setState({ currentBoard: board });
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(member));

      const result = await useBoardStore.getState().addMember("board-1", "user-2");

      expect(result).toEqual(member);
      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(1);
    });
  });

  describe("removeMember", () => {
    it("should remove member from currentBoard", async () => {
      const member = createBoardMember();
      const board = createBoardDetail({ members: [member] });
      useBoardStore.setState({ currentBoard: board });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useBoardStore.getState().removeMember("board-1", "user-2");

      expect(useBoardStore.getState().currentBoard!.members).toHaveLength(0);
    });
  });

  describe("createList", () => {
    it("should add list to currentBoard", async () => {
      useBoardStore.setState({ currentBoard: createBoardDetail() });
      const newList = createList({ id: "list-new", name: "New List" });
      vi.mocked(apiPost).mockResolvedValue(createApiResponse(newList));

      const result = await useBoardStore.getState().createList("board-1", "New List");

      expect(result).toEqual(newList);
      const lists = useBoardStore.getState().currentBoard!.lists;
      expect(lists).toHaveLength(1);
      expect(lists[0].name).toBe("New List");
      expect(lists[0].tasks).toEqual([]);
    });
  });

  describe("updateList", () => {
    it("should update list in currentBoard", async () => {
      const list = createListWithTasks();
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiPut).mockResolvedValue(createApiResponse(undefined));

      await useBoardStore.getState().updateList("board-1", "list-1", { name: "Updated List" });

      expect(useBoardStore.getState().currentBoard!.lists[0].name).toBe("Updated List");
    });
  });

  describe("deleteList", () => {
    it("should remove list from currentBoard", async () => {
      const list = createListWithTasks();
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list] }) });
      vi.mocked(apiDelete).mockResolvedValue(createApiResponse(undefined));

      await useBoardStore.getState().deleteList("board-1", "list-1");

      expect(useBoardStore.getState().currentBoard!.lists).toHaveLength(0);
    });
  });

  describe("optimisticMoveTask", () => {
    it("should move task between lists", () => {
      const task1 = createTask({ id: "task-1", list_id: "list-1", position: 0 });
      const task2 = createTask({ id: "task-2", list_id: "list-1", position: 1 });
      const list1 = createListWithTasks({ id: "list-1", tasks: [task1, task2] });
      const list2 = createListWithTasks({ id: "list-2", name: "Done", tasks: [] });
      useBoardStore.setState({ currentBoard: createBoardDetail({ lists: [list1, list2] }) });

      useBoardStore.getState().optimisticMoveTask("task-1", "list-1", "list-2", 0);

      const state = useBoardStore.getState();
      const srcList = state.currentBoard!.lists.find((l) => l.id === "list-1")!;
      const dstList = state.currentBoard!.lists.find((l) => l.id === "list-2")!;

      expect(srcList.tasks).toHaveLength(1);
      expect(srcList.tasks[0].id).toBe("task-2");
      expect(dstList.tasks).toHaveLength(1);
      expect(dstList.tasks[0].id).toBe("task-1");
      expect(dstList.tasks[0].list_id).toBe("list-2");
    });

    it("should do nothing if currentBoard is null", () => {
      useBoardStore.setState({ currentBoard: null });
      useBoardStore.getState().optimisticMoveTask("task-1", "list-1", "list-2", 0);
      expect(useBoardStore.getState().currentBoard).toBeNull();
    });
  });

  describe("clearCurrentBoard", () => {
    it("should set currentBoard to null", () => {
      useBoardStore.setState({ currentBoard: createBoardDetail() });
      useBoardStore.getState().clearCurrentBoard();
      expect(useBoardStore.getState().currentBoard).toBeNull();
    });
  });
});
