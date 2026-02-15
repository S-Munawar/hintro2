import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSocketStore } from "@/store/useSocketStore";
import { io } from "socket.io-client";

vi.mock("socket.io-client", () => {
  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
    connected: false,
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

describe("useSocketStore", () => {
  beforeEach(() => {
    useSocketStore.setState({ socket: null, connected: false });
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have null socket and disconnected state", () => {
      const state = useSocketStore.getState();
      expect(state.socket).toBeNull();
      expect(state.connected).toBe(false);
    });
  });

  describe("connect", () => {
    it("should create socket with auth token", () => {
      useSocketStore.getState().connect("test-token");

      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: "test-token" },
          transports: ["websocket", "polling"],
          reconnection: true,
        })
      );
      expect(useSocketStore.getState().socket).not.toBeNull();
    });

    it("should register connect/disconnect/error handlers", () => {
      useSocketStore.getState().connect("test-token");

      const socket = useSocketStore.getState().socket!;
      expect(socket.on).toHaveBeenCalledWith("connect", expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
      expect(socket.on).toHaveBeenCalledWith("connect_error", expect.any(Function));
    });

    it("should set connected true when connect handler fires", () => {
      useSocketStore.getState().connect("test-token");
      const socket = useSocketStore.getState().socket!;

      const connectCall = (socket.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (c: unknown[]) => c[0] === "connect"
      );
      const connectHandler = connectCall![1] as () => void;
      connectHandler();

      expect(useSocketStore.getState().connected).toBe(true);
    });

    it("should set connected false when disconnect handler fires", () => {
      useSocketStore.getState().connect("test-token");
      useSocketStore.setState({ connected: true });
      const socket = useSocketStore.getState().socket!;

      const disconnectCall = (socket.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (c: unknown[]) => c[0] === "disconnect"
      );
      const disconnectHandler = disconnectCall![1] as () => void;
      disconnectHandler();

      expect(useSocketStore.getState().connected).toBe(false);
    });

    it("should set connected false when connect_error handler fires", () => {
      useSocketStore.getState().connect("test-token");
      const socket = useSocketStore.getState().socket!;

      const errorCall = (socket.on as ReturnType<typeof vi.fn>).mock.calls.find(
        (c: unknown[]) => c[0] === "connect_error"
      );
      const errorHandler = errorCall![1] as (err: Error) => void;
      errorHandler(new Error("Connection refused"));

      expect(useSocketStore.getState().connected).toBe(false);
    });

    it("should not reconnect if already connected", () => {
      const mockSocket = { connected: true, on: vi.fn(), removeAllListeners: vi.fn(), disconnect: vi.fn() };
      useSocketStore.setState({ socket: mockSocket as any });

      useSocketStore.getState().connect("test-token");

      // io should not be called again because socket is already connected
      expect(io).not.toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("should disconnect and clear socket", () => {
      useSocketStore.getState().connect("test-token");
      const socket = useSocketStore.getState().socket!;

      useSocketStore.getState().disconnect();

      expect(socket.removeAllListeners).toHaveBeenCalled();
      expect(socket.disconnect).toHaveBeenCalled();
      expect(useSocketStore.getState().socket).toBeNull();
      expect(useSocketStore.getState().connected).toBe(false);
    });

    it("should do nothing if no socket exists", () => {
      useSocketStore.getState().disconnect();
      expect(useSocketStore.getState().socket).toBeNull();
    });
  });

  describe("joinBoard", () => {
    it("should emit join-board event", () => {
      useSocketStore.getState().connect("test-token");
      const socket = useSocketStore.getState().socket!;

      useSocketStore.getState().joinBoard("board-1");

      expect(socket.emit).toHaveBeenCalledWith("join-board", "board-1");
    });

    it("should not throw when socket is null", () => {
      expect(() => useSocketStore.getState().joinBoard("board-1")).not.toThrow();
    });
  });

  describe("leaveBoard", () => {
    it("should emit leave-board event", () => {
      useSocketStore.getState().connect("test-token");
      const socket = useSocketStore.getState().socket!;

      useSocketStore.getState().leaveBoard("board-1");

      expect(socket.emit).toHaveBeenCalledWith("leave-board", "board-1");
    });

    it("should not throw when socket is null", () => {
      expect(() => useSocketStore.getState().leaveBoard("board-1")).not.toThrow();
    });
  });
});
