import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";
import { createMockSession } from "../helpers/factories";

describe("useSocket", () => {
  const mockConnect = vi.fn();
  const mockDisconnect = vi.fn();

  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
    });
    useSocketStore.setState({
      socket: null,
      connected: false,
      connect: mockConnect,
      disconnect: mockDisconnect,
      joinBoard: vi.fn(),
      leaveBoard: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it("should connect when authenticated with access token", () => {
    const session = createMockSession();
    useAuthStore.setState({ isAuthenticated: true, session: session as any });

    renderHook(() => useSocket());

    expect(mockConnect).toHaveBeenCalledWith(session.access_token);
  });

  it("should disconnect when not authenticated", () => {
    useAuthStore.setState({ isAuthenticated: false, session: null });

    renderHook(() => useSocket());

    expect(mockDisconnect).toHaveBeenCalled();
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("should return connected status", () => {
    useSocketStore.setState({ connected: true });

    const { result } = renderHook(() => useSocket());

    expect(result.current.connected).toBe(true);
  });

  it("should reconnect when session changes", () => {
    const session1 = createMockSession();
    useAuthStore.setState({ isAuthenticated: true, session: session1 as any });

    const { rerender } = renderHook(() => useSocket());
    expect(mockConnect).toHaveBeenCalledWith(session1.access_token);

    vi.clearAllMocks();
    const session2 = { ...session1, access_token: "new-token" };
    useAuthStore.setState({ session: session2 as any });

    rerender();
    expect(mockConnect).toHaveBeenCalledWith("new-token");
  });
});
