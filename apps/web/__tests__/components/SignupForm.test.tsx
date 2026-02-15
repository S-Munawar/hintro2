import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "@/components/Auth/SignupForm";
import { useAuthStore } from "@/store/useAuthStore";

const mockRegisterUser = vi.fn();
const mockLoginWithOAuth = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => {
    const store = useAuthStore.getState();
    return {
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      loginUser: vi.fn(),
      registerUser: mockRegisterUser,
      loginWithOAuth: mockLoginWithOAuth,
      logoutUser: vi.fn(),
      resetPassword: vi.fn(),
      userName: "User",
    };
  },
}));

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it("should render signup form", () => {
    render(<SignupForm />);

    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("should render Google OAuth button", () => {
    render(<SignupForm />);
    expect(screen.getByText("Google")).toBeInTheDocument();
  });

  it("should render link to login page", () => {
    render(<SignupForm />);
    const loginLink = screen.getByText("Sign in");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("should have required fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("First name")).toBeRequired();
    expect(screen.getByLabelText("Last name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });

  it("should toggle password visibility", async () => {
    render(<SignupForm />);
    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen.getAllByRole("button");
    const toggleButton = toggleButtons.find((btn) => btn.getAttribute("tabindex") === "-1");
    if (toggleButton) {
      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");
    }
  });

  it("should show subtitle", () => {
    render(<SignupForm />);
    expect(screen.getByText("Start collaborating with your team")).toBeInTheDocument();
  });

  it("should have minimum password length of 6", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "6");
  });

  it("should call registerUser on form submission", async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith("john@example.com", "password123", "John", "Doe");
    });
  });

  it("should show success screen after registration", async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Check your email")).toBeInTheDocument();
    });
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should show Back to Login link on success screen", async () => {
    mockRegisterUser.mockResolvedValue(undefined);
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      const backLink = screen.getByText("Back to Login");
      expect(backLink.closest("a")).toHaveAttribute("href", "/login");
    });
  });

  it("should show error message on registration failure", async () => {
    mockRegisterUser.mockRejectedValue(new Error("Email already registered"));
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Email already registered")).toBeInTheDocument();
    });
  });

  it("should show generic error when non-Error is thrown", async () => {
    mockRegisterUser.mockRejectedValue("something went wrong");
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Registration failed")).toBeInTheDocument();
    });
  });

  it("should show loading state during submission", async () => {
    let resolveRegister: () => void;
    mockRegisterUser.mockReturnValue(new Promise<void>((resolve) => { resolveRegister = resolve; }));
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });

    resolveRegister!();
  });

  it("should call loginWithOAuth when Google button is clicked", async () => {
    mockLoginWithOAuth.mockResolvedValue(undefined);
    render(<SignupForm />);

    await userEvent.click(screen.getByText("Google"));

    expect(mockLoginWithOAuth).toHaveBeenCalledWith("google");
  });

  it("should clear error on new submission", async () => {
    mockRegisterUser.mockRejectedValueOnce(new Error("First error"));
    mockRegisterUser.mockResolvedValueOnce(undefined);
    render(<SignupForm />);

    await userEvent.type(screen.getByLabelText("First name"), "John");
    await userEvent.type(screen.getByLabelText("Last name"), "Doe");
    await userEvent.type(screen.getByLabelText("Email"), "john@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Submit again - error should clear
    await userEvent.click(screen.getByRole("button", { name: "Create Account" }));

    await waitFor(() => {
      expect(screen.queryByText("First error")).not.toBeInTheDocument();
    });
  });
});
