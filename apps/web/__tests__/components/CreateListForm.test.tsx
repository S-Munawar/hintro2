import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateListForm from "@/components/Board/CreateListForm";
import { useBoardStore } from "@/store/useBoardStore";
import { useToastStore } from "@/store/useToastStore";

describe("CreateListForm", () => {
  const mockCreateList = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useBoardStore.setState({
      boards: [],
      currentBoard: null,
      boardsLoading: false,
      currentBoardLoading: false,
      boardsPagination: null,
      createList: mockCreateList,
    } as any);
    useToastStore.setState({
      toasts: [],
      addToast: mockAddToast,
      removeToast: vi.fn(),
    });
  });

  it("should render 'Add List' button initially", () => {
    render(<CreateListForm boardId="board-1" />);
    expect(screen.getByText("Add List")).toBeInTheDocument();
  });

  it("should show form when Add List is clicked", async () => {
    render(<CreateListForm boardId="board-1" />);
    await userEvent.click(screen.getByText("Add List"));

    expect(screen.getByPlaceholderText("List name...")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should hide form when Cancel is clicked", async () => {
    render(<CreateListForm boardId="board-1" />);
    await userEvent.click(screen.getByText("Add List"));
    await userEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("Add List")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("List name...")).not.toBeInTheDocument();
  });

  it("should hide form on Escape key", async () => {
    render(<CreateListForm boardId="board-1" />);
    await userEvent.click(screen.getByText("Add List"));

    const input = screen.getByPlaceholderText("List name...");
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.getByText("Add List")).toBeInTheDocument();
  });

  it("should submit form and create list", async () => {
    mockCreateList.mockResolvedValue({ id: "list-1", name: "New List" });
    render(<CreateListForm boardId="board-1" />);

    await userEvent.click(screen.getByText("Add List"));
    const input = screen.getByPlaceholderText("List name...");
    await userEvent.type(input, "New List");

    const addButton = screen.getByRole("button", { name: "Add List" });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateList).toHaveBeenCalledWith("board-1", "New List");
    });
  });

  it("should show error toast on submit failure", async () => {
    mockCreateList.mockRejectedValue(new Error("fail"));
    render(<CreateListForm boardId="board-1" />);

    await userEvent.click(screen.getByText("Add List"));
    await userEvent.type(screen.getByPlaceholderText("List name..."), "Test");
    await userEvent.click(screen.getByRole("button", { name: "Add List" }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Failed to create list", "error");
    });
  });

  it("should disable submit button when name is empty", async () => {
    render(<CreateListForm boardId="board-1" />);
    await userEvent.click(screen.getByText("Add List"));

    const submitButton = screen.getByRole("button", { name: "Add List" });
    expect(submitButton).toBeDisabled();
  });

  it("should auto-focus the input when form opens", async () => {
    render(<CreateListForm boardId="board-1" />);
    await userEvent.click(screen.getByText("Add List"));

    const input = screen.getByPlaceholderText("List name...");
    expect(input).toHaveFocus();
  });
});
