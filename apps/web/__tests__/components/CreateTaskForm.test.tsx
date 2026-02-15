import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateTaskForm from "@/components/Task/CreateTaskForm";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";

vi.mock("@/store/useTaskStore", () => ({
  useTaskStore: vi.fn(),
}));

vi.mock("@/store/useToastStore", () => ({
  useToastStore: vi.fn(),
}));

describe("CreateTaskForm", () => {
  const mockCreateTask = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTaskStore).mockReturnValue({ createTask: mockCreateTask } as any);
    vi.mocked(useToastStore).mockReturnValue({ addToast: mockAddToast } as any);
  });

  it("should render the 'Add task' button initially", () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    expect(screen.getByText("Add task")).toBeInTheDocument();
  });

  it("should not show form initially", () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    expect(screen.queryByPlaceholderText("Task title...")).not.toBeInTheDocument();
  });

  it("should show form when 'Add task' button is clicked", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));

    expect(screen.getByPlaceholderText("Task title...")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should close form when Cancel is clicked", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));
    await userEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByPlaceholderText("Task title...")).not.toBeInTheDocument();
    expect(screen.getByText("Add task")).toBeInTheDocument();
  });

  it("should close form when Escape is pressed", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));

    const input = screen.getByPlaceholderText("Task title...");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByPlaceholderText("Task title...")).not.toBeInTheDocument();
  });

  it("should disable Add button when title is empty", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));

    expect(screen.getByText("Add")).toBeDisabled();
  });

  it("should enable Add button when title has text", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "New Task");

    expect(screen.getByText("Add")).not.toBeDisabled();
  });

  it("should call createTask on form submission", async () => {
    mockCreateTask.mockResolvedValue({});
    render(<CreateTaskForm boardId="b1" listId="l1" />);

    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "New Task");
    await userEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith("b1", {
        list_id: "l1",
        title: "New Task",
      });
    });
  });

  it("should close form and reset title after successful creation", async () => {
    mockCreateTask.mockResolvedValue({});
    render(<CreateTaskForm boardId="b1" listId="l1" />);

    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "New Task");
    await userEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(screen.getByText("Add task")).toBeInTheDocument();
    });
  });

  it("should show toast on creation error", async () => {
    mockCreateTask.mockRejectedValue(new Error("Server error"));
    render(<CreateTaskForm boardId="b1" listId="l1" />);

    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "New Task");
    await userEvent.click(screen.getByText("Add"));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Failed to create task", "error");
    });
  });

  it("should show 'Adding...' while submitting", async () => {
    let resolveCreate: () => void;
    mockCreateTask.mockReturnValue(new Promise((r) => { resolveCreate = r; }));

    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "New Task");
    await userEvent.click(screen.getByText("Add"));

    expect(screen.getByText("Adding...")).toBeInTheDocument();
    resolveCreate!();
  });

  it("should not submit with whitespace-only title", async () => {
    render(<CreateTaskForm boardId="b1" listId="l1" />);
    await userEvent.click(screen.getByText("Add task"));
    await userEvent.type(screen.getByPlaceholderText("Task title..."), "   ");

    expect(screen.getByText("Add")).toBeDisabled();
  });
});
