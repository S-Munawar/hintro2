import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Toast from "@/components/Common/Toast";

describe("Toast", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render message", () => {
    render(<Toast message="Hello world" onClose={onClose} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("should render close button", () => {
    render(<Toast message="Test" onClose={onClose} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should call onClose when close button is clicked", () => {
    render(<Toast message="Test" onClose={onClose} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClose).toHaveBeenCalled();
  });

  it("should auto-dismiss after duration", () => {
    render(<Toast message="Auto" duration={3000} onClose={onClose} />);

    vi.advanceTimersByTime(3000);
    // After the visibility timer fires, there's a 300ms delay for animation
    vi.advanceTimersByTime(300);

    expect(onClose).toHaveBeenCalled();
  });
});
