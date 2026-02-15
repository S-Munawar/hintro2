import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BoardCard from "@/components/Board/BoardCard";
import { createBoardSummary } from "../helpers/factories";

describe("BoardCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render board name", () => {
    const board = createBoardSummary({ name: "My Project" });
    render(<BoardCard board={board} />);
    expect(screen.getByText("My Project")).toBeInTheDocument();
  });

  it("should render board description", () => {
    const board = createBoardSummary({ description: "A great board" });
    render(<BoardCard board={board} />);
    expect(screen.getByText("A great board")).toBeInTheDocument();
  });

  it("should not render description when null", () => {
    const board = createBoardSummary({ description: null });
    render(<BoardCard board={board} />);
    expect(screen.queryByText("A great board")).not.toBeInTheDocument();
  });

  it("should link to board detail page", () => {
    const board = createBoardSummary({ id: "board-123" });
    render(<BoardCard board={board} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/board/board-123");
  });

  it("should render list count", () => {
    const board = createBoardSummary({ _count: { members: 5, lists: 3 } });
    render(<BoardCard board={board} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render member count", () => {
    const board = createBoardSummary({ _count: { members: 5, lists: 3 } });
    render(<BoardCard board={board} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render owner first name", () => {
    const board = createBoardSummary();
    render(<BoardCard board={board} />);
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  it("should render owner initial in avatar", () => {
    const board = createBoardSummary();
    render(<BoardCard board={board} />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("should display board color", () => {
    const board = createBoardSummary({ color: "#ff0000" });
    const { container } = render(<BoardCard board={board} />);
    const colorBar = container.querySelector("[style*='background-color']");
    expect(colorBar).toBeInTheDocument();
  });
});
