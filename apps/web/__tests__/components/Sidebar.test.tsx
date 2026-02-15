import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/Layout/Sidebar";
import { useBoardStore } from "@/store/useBoardStore";
import { createBoardSummary } from "../helpers/factories";

vi.mock("@/store/useBoardStore", () => ({
  useBoardStore: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    logoutUser: mockLogout,
    userName: "John Doe",
  }),
}));

const mockLogout = vi.fn();

describe("Sidebar", () => {
  const mockFetchBoards = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBoardStore).mockReturnValue({
      boards: [],
      fetchBoards: mockFetchBoards,
      boardsLoading: false,
    } as any);
  });

  it("should render brand name", () => {
    render(<Sidebar />);
    expect(screen.getByText("Hintro")).toBeInTheDocument();
  });

  it("should render Dashboard link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("should render Settings link", () => {
    render(<Sidebar />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should render Sign Out button", () => {
    render(<Sidebar />);
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("should call fetchBoards on mount", () => {
    render(<Sidebar />);
    expect(mockFetchBoards).toHaveBeenCalledWith(1, 50);
  });

  it("should render boards list", () => {
    vi.mocked(useBoardStore).mockReturnValue({
      boards: [
        createBoardSummary({ id: "b1", name: "Board One" }),
        createBoardSummary({ id: "b2", name: "Board Two" }),
      ],
      fetchBoards: mockFetchBoards,
      boardsLoading: false,
    } as any);

    render(<Sidebar />);
    expect(screen.getByText("Board One")).toBeInTheDocument();
    expect(screen.getByText("Board Two")).toBeInTheDocument();
  });

  it("should show board count", () => {
    vi.mocked(useBoardStore).mockReturnValue({
      boards: [
        createBoardSummary({ id: "b1" }),
        createBoardSummary({ id: "b2" }),
      ],
      fetchBoards: mockFetchBoards,
      boardsLoading: false,
    } as any);

    render(<Sidebar />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should show empty state when no boards", () => {
    render(<Sidebar />);
    expect(screen.getByText(/No boards yet/)).toBeInTheDocument();
  });

  it("should show loading skeletons when loading", () => {
    vi.mocked(useBoardStore).mockReturnValue({
      boards: [],
      fetchBoards: mockFetchBoards,
      boardsLoading: true,
    } as any);

    const { container } = render(<Sidebar />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("should render user name", () => {
    render(<Sidebar />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render user avatar with first letter", () => {
    render(<Sidebar />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("should call logoutUser when Sign Out is clicked", async () => {
    render(<Sidebar />);
    await userEvent.click(screen.getByText("Sign Out"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("should toggle to collapsed state", async () => {
    render(<Sidebar />);
    // Click collapse button
    const collapseButton = screen.getByTitle("Collapse sidebar");
    await userEvent.click(collapseButton);

    // In collapsed state, text labels should be hidden
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Hintro")).not.toBeInTheDocument();
  });

  it("should expand from collapsed state", async () => {
    render(<Sidebar />);
    
    // Collapse
    await userEvent.click(screen.getByTitle("Collapse sidebar"));
    
    // Expand
    await userEvent.click(screen.getByTitle("Expand sidebar"));
    
    // Labels should be visible again
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Hintro")).toBeInTheDocument();
  });

  it("should render board links with correct hrefs", () => {
    vi.mocked(useBoardStore).mockReturnValue({
      boards: [createBoardSummary({ id: "board-123", name: "My Board" })],
      fetchBoards: mockFetchBoards,
      boardsLoading: false,
    } as any);

    render(<Sidebar />);
    const boardLink = screen.getByText("My Board").closest("a");
    expect(boardLink).toHaveAttribute("href", "/board/board-123");
  });

  it("should render Dashboard link with correct href", () => {
    render(<Sidebar />);
    const link = screen.getByText("Dashboard").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("should render Settings link with correct href", () => {
    render(<Sidebar />);
    const link = screen.getByText("Settings").closest("a");
    expect(link).toHaveAttribute("href", "/settings");
  });
});
