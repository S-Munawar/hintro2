import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loader from "@/components/Common/Loader";

describe("Loader", () => {
  it("should render with default medium size", () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector(".loader-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("loader-md");
  });

  it("should render with small size", () => {
    const { container } = render(<Loader size="sm" />);
    const spinner = container.querySelector(".loader-spinner");
    expect(spinner).toHaveClass("loader-sm");
  });

  it("should render with large size", () => {
    const { container } = render(<Loader size="lg" />);
    const spinner = container.querySelector(".loader-spinner");
    expect(spinner).toHaveClass("loader-lg");
  });

  it("should render with flex centering container", () => {
    const { container } = render(<Loader />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "items-center", "justify-center");
  });
});
