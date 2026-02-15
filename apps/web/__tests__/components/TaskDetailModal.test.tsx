import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskDetailModal from "@/components/Task/TaskDetailModal";
import { useTaskStore } from "@/store/useTaskStore";
import { useBoardStore } from "@/store/useBoardStore";
import { useToastStore } from "@/store/useToastStore";
import {
  createTask,
  createTaskAssignee,
  createBoardDetail,
  createBoardMember,
  createProfileSummary,
  createProfileWithAvatar,
  createProfileWithEmail,
} from "../helpers/factories";

vi.mock("@/store/useTaskStore", () => ({
  useTaskStore: vi.fn(),
}));

vi.mock("@/store/useBoardStore", () => ({
  useBoardStore: vi.fn(),
}));

vi.mock("@/store/useToastStore", () => ({
  useToastStore: vi.fn(),
}));

describe("TaskDetailModal", () => {
  const mockUpdateTask = vi.fn();
  const mockDeleteTask = vi.fn();
  const mockAssignUser = vi.fn();
  const mockUnassignUser = vi.fn();
  const mockFetchTaskDetail = vi.fn();
  const mockAddToast = vi.fn();
  const onClose = vi.fn();

  const selectedTask = createTask({
    id: "task-1",
    title: "Test Task",
    description: "Task description",
    priority: "high",
    due_date: "2025-06-15T00:00:00Z",
    creator: createProfileSummary({ first_name: "John", last_name: "Doe" }),
    assignees: [
      createTaskAssignee({
        id: "a1",
        user_id: "user-2",
        user: createProfileWithAvatar({ id: "user-2", first_name: "Jane", last_name: "Smith" }),
      }),
    ],
    list: { id: "list-1", name: "To Do" } as any,
  });

  const board = createBoardDetail({
    owner: createProfileWithEmail({ id: "user-1", first_name: "John", last_name: "Doe" }),
    members: [
      createBoardMember({
        user_id: "user-3",
        user: { id: "user-3", first_name: "Alice", last_name: "W", email: "alice@test.com", avatar_url: null },
      }),
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    vi.mocked(useTaskStore).mockReturnValue({
      selectedTask,
      selectedTaskLoading: false,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      assignUser: mockAssignUser,
      unassignUser: mockUnassignUser,
      fetchTaskDetail: mockFetchTaskDetail,
      activityLogs: [],
      activityLoading: false,
      fetchActivity: vi.fn(),
    } as any);

    vi.mocked(useBoardStore).mockReturnValue({
      currentBoard: board,
    } as any);

    vi.mocked(useToastStore).mockReturnValue({
      addToast: mockAddToast,
    } as any);
  });

  it("should render task details when open", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Task description")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={false} onClose={onClose} />);
    expect(screen.queryByDisplayValue("Test Task")).not.toBeInTheDocument();
  });

  it("should show loading state when task is loading", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      selectedTask: null,
      selectedTaskLoading: true,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      assignUser: mockAssignUser,
      unassignUser: mockUnassignUser,
      fetchTaskDetail: mockFetchTaskDetail,
      activityLogs: [],
      activityLoading: false,
      fetchActivity: vi.fn(),
    } as any);

    const { container } = render(
      <TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />,
    );
    // Should show loader, not the form
    expect(screen.queryByDisplayValue("Test Task")).not.toBeInTheDocument();
  });

  it("should render priority select with correct value", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    const select = screen.getByDisplayValue("High");
    expect(select).toBeInTheDocument();
  });

  it("should render all priority options", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("should render Save Changes button", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("should render Delete button", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should call updateTask on save", async () => {
    mockUpdateTask.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith("b1", "task-1", expect.objectContaining({
        title: "Test Task",
        description: "Task description",
        priority: "high",
      }));
    });
  });

  it("should show success toast on save", async () => {
    mockUpdateTask.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Task updated", "success");
    });
  });

  it("should show error toast on save failure", async () => {
    mockUpdateTask.mockRejectedValue(new Error("fail"));
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Failed to update task", "error");
    });
  });

  it("should call deleteTask on delete", async () => {
    mockDeleteTask.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith("b1", "task-1");
    });
  });

  it("should close modal after deletion", async () => {
    mockDeleteTask.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("should show error toast on delete failure", async () => {
    mockDeleteTask.mockRejectedValue(new Error("fail"));
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Failed to delete task", "error");
    });
  });

  it("should render assigned users", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should render unassigned members with assign button", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    // Alice W is a board member but not assigned
    expect(screen.getByText("Alice W")).toBeInTheDocument();
    // Owner John Doe appears both in creator info and as an unassigned member
    const johnDoes = screen.getAllByText("John Doe");
    expect(johnDoes.length).toBeGreaterThanOrEqual(2);
  });

  it("should call assignUser when assign button is clicked", async () => {
    mockAssignUser.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Alice W"));

    await waitFor(() => {
      expect(mockAssignUser).toHaveBeenCalledWith("b1", "task-1", "user-3");
    });
  });

  it("should show success toast on assign", async () => {
    mockAssignUser.mockResolvedValue({});
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Alice W"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("User assigned", "success");
    });
  });

  it("should render the list name", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("should render creator info", () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);
    // Creator: John Doe (from selectedTask.creator)
    expect(screen.getByText("Created by")).toBeInTheDocument();
  });

  it("should switch to Activity tab", async () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    await userEvent.click(screen.getByText("Activity"));

    // Should show activity log content (empty state in this case)
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });

  it("should switch between tabs", async () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    // Switch to Activity
    await userEvent.click(screen.getByText("Activity"));
    expect(screen.getByText("No activity yet")).toBeInTheDocument();

    // Switch back to Details
    await userEvent.click(screen.getByText("Details"));
    expect(screen.getByDisplayValue("Test Task")).toBeInTheDocument();
  });

  it("should disable Save when title is empty", async () => {
    render(<TaskDetailModal boardId="b1" taskId="task-1" isOpen={true} onClose={onClose} />);

    const titleInput = screen.getByDisplayValue("Test Task");
    await userEvent.clear(titleInput);

    expect(screen.getByText("Save Changes")).toBeDisabled();
  });
});
