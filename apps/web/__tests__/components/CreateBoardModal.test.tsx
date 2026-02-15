import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateBoardModal from "@/components/Board/CreateBoardModal";
import { useBoardStore } from "@/store/useBoardStore";
import { useToastStore } from "@/store/useToastStore";

const mockPush = vi.fn();

vi.mock("next/navigation", async () => {
  return {
    useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  };
});

vi.mock("@/store/useBoardStore", () => ({
  useBoardStore: vi.fn(),
}));

vi.mock("@/store/useToastStore", () => ({
  useToastStore: vi.fn(),
}));

describe("CreateBoardModal", () => {
  const mockCreateBoard = vi.fn();
  const mockAddToast = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBoardStore).mockReturnValue({ createBoard: mockCreateBoard } as any);
    vi.mocked(useToastStore).mockReturnValue({ addToast: mockAddToast } as any);
  });

  it("should render the modal when isOpen is true", () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    // "Create Board" appears in both heading and submit button
    expect(screen.getAllByText("Create Board").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Board Name/)).toBeInTheDocument();
  });

  it("should not render when isOpen is false", () => {
    render(<CreateBoardModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText("Create Board")).not.toBeInTheDocument();
  });

  it("should render all color options", () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    const colorButtons = screen.getAllByRole("button").filter(
      (btn) => btn.style.backgroundColor && btn.style.backgroundColor !== "",
    );
    expect(colorButtons.length).toBe(10); // 10 COLORS
  });

  it("should have description textarea", () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("should disable submit when name is empty", () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Create Board", { selector: "button[type='submit']" })).toBeDisabled();
  });

  it("should enable submit when name is entered", async () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    await userEvent.type(screen.getByLabelText(/Board Name/), "My Board");

    expect(screen.getByText("Create Board", { selector: "button[type='submit']" })).not.toBeDisabled();
  });

  it("should show preview when name is entered", async () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    await userEvent.type(screen.getByLabelText(/Board Name/), "My Project");

    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("should call createBoard on submit", async () => {
    mockCreateBoard.mockResolvedValue({ id: "new-board-1" });
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText(/Board Name/), "New Board");
    await userEvent.click(screen.getByText("Create Board", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockCreateBoard).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Board",
          color: expect.any(String),
        }),
      );
    });
  });

  it("should navigate to new board after creation", async () => {
    mockCreateBoard.mockResolvedValue({ id: "board-123" });
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText(/Board Name/), "Board");
    await userEvent.click(screen.getByText("Create Board", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/board/board-123");
    });
  });

  it("should show success toast after creation", async () => {
    mockCreateBoard.mockResolvedValue({ id: "board-123" });
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText(/Board Name/), "Board");
    await userEvent.click(screen.getByText("Create Board", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Board created!", "success");
    });
  });

  it("should show error toast on creation failure", async () => {
    mockCreateBoard.mockRejectedValue(new Error("Server error"));
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);

    await userEvent.type(screen.getByLabelText(/Board Name/), "Board");
    await userEvent.click(screen.getByText("Create Board", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Server error", "error");
    });
  });

  it("should call onClose when Cancel is clicked", async () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("should allow selecting different colors", async () => {
    render(<CreateBoardModal isOpen={true} onClose={onClose} />);
    const colorButtons = screen.getAllByRole("button").filter(
      (btn) => btn.style.backgroundColor && btn.style.backgroundColor !== "",
    );
    // Click the 3rd color
    await userEvent.click(colorButtons[2]!);
    // The check icon should appear in the selected color
    expect(colorButtons[2]!.querySelector("svg")).toBeInTheDocument();
  });
});
