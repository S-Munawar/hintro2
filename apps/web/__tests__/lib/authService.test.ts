import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "@/lib/authService";
import { supabase } from "@/lib/supabaseClient";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUp", () => {
    it("should call supabase.auth.signUp with email, password, and metadata", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: "u1" } as any, session: null },
        error: null,
      });

      const result = await authService.signUp("john@test.com", "pass123", "John", "Doe");

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "john@test.com",
        password: "pass123",
        options: {
          data: { first_name: "John", last_name: "Doe" },
        },
      });
      expect(result.user).toBeDefined();
    });

    it("should throw on signup error", async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Email taken", name: "AuthError", status: 400 } as any,
      });

      await expect(authService.signUp("x@x.com", "pass", "A", "B")).rejects.toEqual(
        expect.objectContaining({ message: "Email taken" }),
      );
    });
  });

  describe("signIn", () => {
    it("should call supabase.auth.signInWithPassword", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: "u1" } as any, session: { access_token: "tok" } as any },
        error: null,
      });

      const result = await authService.signIn("john@test.com", "pass123");

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "john@test.com",
        password: "pass123",
      });
      expect(result.session).toBeDefined();
    });

    it("should throw on invalid credentials", async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null } as any,
        error: { message: "Invalid credentials", name: "AuthError", status: 401 } as any,
      });

      await expect(authService.signIn("a@b.com", "wrong")).rejects.toEqual(
        expect.objectContaining({ message: "Invalid credentials" }),
      );
    });
  });

  describe("signInWithOAuth", () => {
    it("should call supabase.auth.signInWithOAuth with google provider", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: "google", url: "https://accounts.google.com" },
        error: null,
      });

      const result = await authService.signInWithOAuth("google");

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: expect.stringContaining("/auth/callback"),
        },
      });
      expect(result.url).toBeDefined();
    });

    it("should throw on OAuth error", async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: "google", url: null },
        error: { message: "OAuth disabled", name: "AuthError" } as any,
      });

      await expect(authService.signInWithOAuth("google")).rejects.toEqual(
        expect.objectContaining({ message: "OAuth disabled" }),
      );
    });
  });

  describe("signOut", () => {
    it("should call supabase.auth.signOut", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it("should throw on sign out error", async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: "Session expired", name: "AuthError" } as any,
      });

      await expect(authService.signOut()).rejects.toEqual(
        expect.objectContaining({ message: "Session expired" }),
      );
    });
  });

  describe("resetPassword", () => {
    it("should call supabase.auth.resetPasswordForEmail", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      await authService.resetPassword("john@test.com");

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("john@test.com", {
        redirectTo: expect.stringContaining("/auth/reset-password"),
      });
    });

    it("should throw on reset error", async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: { message: "User not found", name: "AuthError" } as any,
      });

      await expect(authService.resetPassword("x@x.com")).rejects.toEqual(
        expect.objectContaining({ message: "User not found" }),
      );
    });
  });

  describe("getSession", () => {
    it("should return session data", async () => {
      const mockSession = { access_token: "tok", user: { id: "u1" } };
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      const result = await authService.getSession();
      expect(result).toEqual(mockSession);
    });

    it("should return null when no session", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getSession();
      expect(result).toBeNull();
    });

    it("should throw on getSession error", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: "Network error", name: "AuthError" } as any,
      });

      await expect(authService.getSession()).rejects.toEqual(
        expect.objectContaining({ message: "Network error" }),
      );
    });
  });

  describe("getUser", () => {
    it("should return user data", async () => {
      const mockUser = { id: "u1", email: "john@test.com" };
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser as any },
        error: null,
      });

      const result = await authService.getUser();
      expect(result).toEqual(mockUser);
    });

    it("should throw on getUser error", async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: "Unauthorized", name: "AuthError" } as any,
      });

      await expect(authService.getUser()).rejects.toEqual(
        expect.objectContaining({ message: "Unauthorized" }),
      );
    });
  });
});
