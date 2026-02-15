import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Providers from "@/components/Providers";
import { useToastStore } from "@/store/useToastStore";

describe("Providers", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it("should render children", () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>
    );
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should not render toast container when no toasts", () => {
    const { container } = render(
      <Providers>
        <div>Child</div>
      </Providers>
    );
    expect(container.querySelector(".fixed.bottom-5")).not.toBeInTheDocument();
  });

  it("should render toasts when they exist", () => {
    useToastStore.setState({
      toasts: [
        { id: "1", message: "Test toast", type: "info" },
      ],
    });

    render(
      <Providers>
        <div>Child</div>
      </Providers>
    );
    expect(screen.getByText("Test toast")).toBeInTheDocument();
  });

  it("should render multiple toasts", () => {
    useToastStore.setState({
      toasts: [
        { id: "1", message: "First toast", type: "success" },
        { id: "2", message: "Second toast", type: "error" },
      ],
    });

    render(
      <Providers>
        <div>Child</div>
      </Providers>
    );
    expect(screen.getByText("First toast")).toBeInTheDocument();
    expect(screen.getByText("Second toast")).toBeInTheDocument();
  });
});
