import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/lib/authService";
import { createMockSession, createMockUser } from "../helpers/factories";

vi.mock("@/lib/authService", () => ({
  authService: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
    });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
    });
  });

  describe("initialize", () => {
    it("should set user and session when session exists", async () => {
      const mockSession = createMockSession();
      const mockUser = createMockUser();
      vi.mocked(authService.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(authService.getUser).mockResolvedValue(mockUser as any);

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("should clear state when no session exists", async () => {
      vi.mocked(authService.getSession).mockResolvedValue(null);

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(authService.getSession).mockRejectedValue(new Error("Network error"));

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it("should handle getSession success but getUser failure", async () => {
      const mockSession = createMockSession();
      vi.mocked(authService.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(authService.getUser).mockRejectedValue(new Error("User fetch failed"));

      await useAuthStore.getState().initialize();
      const state = useAuthStore.getState();

      // Falls into catch block
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("loginUser", () => {
    it("should set user and session on successful login", async () => {
      const mockSession = createMockSession();
      const mockUser = createMockUser();
      vi.mocked(authService.signIn).mockResolvedValue({
        session: mockSession as any,
        user: mockUser as any,
      });

      await useAuthStore.getState().loginUser("john@example.com", "password");
      const state = useAuthStore.getState();

      expect(authService.signIn).toHaveBeenCalledWith("john@example.com", "password");
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
    });

    it("should throw error on failed login", async () => {
      vi.mocked(authService.signIn).mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        useAuthStore.getState().loginUser("john@example.com", "wrong")
      ).rejects.toThrow("Invalid credentials");
    });

    it("should not set authenticated on failed login", async () => {
      vi.mocked(authService.signIn).mockRejectedValue(new Error("Invalid credentials"));

      try {
        await useAuthStore.getState().loginUser("john@example.com", "wrong");
      } catch {}

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe("registerUser", () => {
    it("should register user and set state", async () => {
      const mockSession = createMockSession();
      const mockUser = createMockUser();
      vi.mocked(authService.signUp).mockResolvedValue({
        session: mockSession as any,
        user: mockUser as any,
      });

      await useAuthStore.getState().registerUser("john@example.com", "password", "John", "Doe");

      expect(authService.signUp).toHaveBeenCalledWith("john@example.com", "password", "John", "Doe");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it("should handle registration without immediate session", async () => {
      vi.mocked(authService.signUp).mockResolvedValue({
        session: null,
        user: createMockUser() as any,
      });

      await useAuthStore.getState().registerUser("john@example.com", "password", "John", "Doe");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it("should throw error on registration failure", async () => {
      vi.mocked(authService.signUp).mockRejectedValue(new Error("Email already registered"));

      await expect(
        useAuthStore.getState().registerUser("john@example.com", "password", "John", "Doe")
      ).rejects.toThrow("Email already registered");
    });
  });

  describe("logoutUser", () => {
    it("should clear state on logout", async () => {
      // Set authenticated state first
      useAuthStore.setState({
        user: createMockUser() as any,
        session: createMockSession() as any,
        isAuthenticated: true,
      });
      vi.mocked(authService.signOut).mockResolvedValue(undefined);

      await useAuthStore.getState().logoutUser();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe("loginWithOAuth", () => {
    it("should call authService.signInWithOAuth", async () => {
      vi.mocked(authService.signInWithOAuth).mockResolvedValue(undefined as any);

      await useAuthStore.getState().loginWithOAuth("google");
      expect(authService.signInWithOAuth).toHaveBeenCalledWith("google");
    });

    it("should throw error on OAuth failure", async () => {
      vi.mocked(authService.signInWithOAuth).mockRejectedValue(new Error("OAuth failed"));

      await expect(
        useAuthStore.getState().loginWithOAuth("google")
      ).rejects.toThrow("OAuth failed");
    });
  });

  describe("resetPassword", () => {
    it("should call authService.resetPassword", async () => {
      vi.mocked(authService.resetPassword).mockResolvedValue(undefined);

      await useAuthStore.getState().resetPassword("john@example.com");
      expect(authService.resetPassword).toHaveBeenCalledWith("john@example.com");
    });

    it("should throw error on reset failure", async () => {
      vi.mocked(authService.resetPassword).mockRejectedValue(new Error("Not found"));

      await expect(
        useAuthStore.getState().resetPassword("bad@example.com")
      ).rejects.toThrow("Not found");
    });
  });

  describe("setSession", () => {
    it("should update session and derived state", () => {
      const mockSession = createMockSession();
      useAuthStore.getState().setSession(mockSession as any);

      const state = useAuthStore.getState();
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockSession.user);
    });

    it("should clear state when session is null", () => {
      useAuthStore.setState({ isAuthenticated: true });
      useAuthStore.getState().setSession(null);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });
});
