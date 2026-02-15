import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { createMockUser, createMockSession } from "../helpers/factories";

// We need to partially mock useAuth's dependency on the store
// The hook calls initialize() and sets up onAuthStateChange listener

describe("useAuth", () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUnsubscribe = vi.fn();
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    } as any);
    vi.clearAllMocks();
  });

  it("should return auth state from store", () => {
    const mockUser = createMockUser();
    useAuthStore.setState({
      user: mockUser as any,
      isAuthenticated: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should compute userName from email", () => {
    const mockUser = createMockUser();
    useAuthStore.setState({ user: mockUser as any, isAuthenticated: true, isLoading: false });

    const { result } = renderHook(() => useAuth());

    expect(result.current.userName).toBe("john");
  });

  it("should return 'User' as default userName", () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });

    const { result } = renderHook(() => useAuth());

    expect(result.current.userName).toBe("User");
  });

  it("should subscribe to auth state changes", () => {
    renderHook(() => useAuth());

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });

  it("should unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("should expose store action functions", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loginUser).toBeDefined();
    expect(result.current.registerUser).toBeDefined();
    expect(result.current.loginWithOAuth).toBeDefined();
    expect(result.current.logoutUser).toBeDefined();
    expect(result.current.resetPassword).toBeDefined();
  });
});
