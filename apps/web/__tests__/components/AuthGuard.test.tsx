import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthGuard from "@/components/Auth/AuthGuard";
import { useAuthStore } from "@/store/useAuthStore";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => {
    const store = useAuthStore.getState();
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      loginUser: vi.fn(),
      registerUser: vi.fn(),
      loginWithOAuth: vi.fn(),
      logoutUser: vi.fn(),
      resetPassword: vi.fn(),
      userName: "User",
    };
  },
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loader when loading", () => {
    useAuthStore.setState({ isLoading: true, isAuthenticated: false });

    const { container } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(container.querySelector(".loader-spinner")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated", () => {
    useAuthStore.setState({ isLoading: false, isAuthenticated: true });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should not render children when not authenticated", () => {
    useAuthStore.setState({ isLoading: false, isAuthenticated: false });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to /login when not authenticated", async () => {
    const { useRouter } = await import("next/navigation");
    const router = useRouter();

    useAuthStore.setState({ isLoading: false, isAuthenticated: false });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(router.push).toHaveBeenCalledWith("/login");
  });
});
