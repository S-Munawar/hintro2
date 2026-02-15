import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/Auth/LoginForm";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";

// Stable mock references for asserting calls
const mockLoginUser = vi.fn();
const mockLoginWithOAuth = vi.fn();
const mockRegisterUser = vi.fn();
const mockLogoutUser = vi.fn();
const mockResetPassword = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => {
    const store = useAuthStore.getState();
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      loginUser: mockLoginUser,
      registerUser: mockRegisterUser,
      loginWithOAuth: mockLoginWithOAuth,
      logoutUser: mockLogoutUser,
      resetPassword: mockResetPassword,
      userName: "User",
    };
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it("should render login form", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("should render Google OAuth button", () => {
    render(<LoginForm />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("should render link to signup page", () => {
    render(<LoginForm />);
    const signupLink = screen.getByText("Sign up");
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("should render forgot password link", () => {
    render(<LoginForm />);
    const forgotLink = screen.getByText("Forgot?");
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink.closest("a")).toHaveAttribute("href", "/forgot-password");
  });

  it("should toggle password visibility", async () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    // Find the toggle button (closest to the password input)
    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons.find((btn) => btn.getAttribute("tabindex") === "-1");
    if (toggleButton) {
      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    }
  });

  it("should have required fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });

  it("should have email input type", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("should have minimum password length", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "6");
  });

  it("should call loginUser on form submission", async () => {
    mockLoginUser.mockResolvedValue(undefined);
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  it("should show error message on login failure", async () => {
    mockLoginUser.mockRejectedValue(new Error("Invalid credentials"));
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("should show generic error when non-Error is thrown", async () => {
    mockLoginUser.mockRejectedValue("unknown error");
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Login failed")).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    let resolveLogin: () => void;
    mockLoginUser.mockReturnValue(new Promise<void>((resolve) => { resolveLogin = resolve; }));
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    resolveLogin!();
  });

  it("should call loginWithOAuth when Google button is clicked", async () => {
    mockLoginWithOAuth.mockResolvedValue(undefined);
    render(<LoginForm />);

    await userEvent.click(screen.getByText("Google"));

    expect(mockLoginWithOAuth).toHaveBeenCalledWith("google");
  });

  it("should clear error on new submission", async () => {
    mockLoginUser.mockRejectedValueOnce(new Error("First error"));
    mockLoginUser.mockResolvedValueOnce(undefined);
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Submit again - error should clear
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });
});
