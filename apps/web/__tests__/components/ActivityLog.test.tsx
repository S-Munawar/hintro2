import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ActivityLog from "@/components/Activity/ActivityLog";
import { useTaskStore } from "@/store/useTaskStore";
import { createActivityLog, createProfileWithAvatar } from "../helpers/factories";

vi.mock("@/store/useTaskStore", () => ({
  useTaskStore: vi.fn(),
}));

vi.mock("@/store/useBoardStore", () => ({
  useBoardStore: vi.fn(() => ({ currentBoard: null })),
}));

describe("ActivityLog", () => {
  const mockFetchActivity = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading skeletons when loading", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [],
      activityLoading: true,
      fetchActivity: mockFetchActivity,
    } as any);

    const { container } = render(<ActivityLog boardId="b1" />);
    expect(container.querySelector(".skeleton")).toBeInTheDocument();
  });

  it("should show empty state when no activity", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });

  it("should call fetchActivity on mount", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(mockFetchActivity).toHaveBeenCalledWith("b1", undefined);
  });

  it("should call fetchActivity with taskId when provided", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" taskId="t1" />);
    expect(mockFetchActivity).toHaveBeenCalledWith("b1", "t1");
  });

  it("should render activity items", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a1",
          action_type: "create",
          entity_type: "task",
          user: createProfileWithAvatar({ first_name: "John", last_name: "Doe" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("created a task")).toBeInTheDocument();
  });

  it("should render 'added a member' for member_added action", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a2",
          action_type: "create",
          entity_type: "board",
          changes: { action: "member_added" },
          user: createProfileWithAvatar({ first_name: "Jane", last_name: "Smith" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("added a member")).toBeInTheDocument();
  });

  it("should render move action with list names", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a3",
          action_type: "update",
          entity_type: "task",
          changes: { action: "moved", from_list: "To Do", to_list: "In Progress" },
          user: createProfileWithAvatar({ first_name: "Alice", last_name: "W" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText(/moved task from "To Do" to "In Progress"/)).toBeInTheDocument();
  });

  it("should render delete actions", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a4",
          action_type: "delete",
          entity_type: "task",
          user: createProfileWithAvatar({ first_name: "Bob", last_name: "B" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("deleted a task")).toBeInTheDocument();
  });

  it("should render member_removed action", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a5",
          action_type: "delete",
          entity_type: "board",
          changes: { action: "member_removed" },
          user: createProfileWithAvatar({ first_name: "Eve", last_name: "E" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("removed a member")).toBeInTheDocument();
  });

  it("should render user assigned action", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a6",
          action_type: "create",
          entity_type: "task",
          changes: { action: "user_assigned" },
          user: createProfileWithAvatar({ first_name: "Dan", last_name: "D" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("assigned a user")).toBeInTheDocument();
  });

  it("should render user unassigned action", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a7",
          action_type: "delete",
          entity_type: "task",
          changes: { action: "user_unassigned" },
          user: createProfileWithAvatar({ first_name: "Fay", last_name: "F" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("unassigned a user")).toBeInTheDocument();
  });

  it("should render update action", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a8",
          action_type: "update",
          entity_type: "task",
          user: createProfileWithAvatar({ first_name: "Gal", last_name: "G" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("updated a task")).toBeInTheDocument();
  });

  it("should render 'just now' for very recent activity", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a9",
          created_at: new Date().toISOString(),
          user: createProfileWithAvatar({ first_name: "Hal", last_name: "H" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("just now")).toBeInTheDocument();
  });

  it("should render time in minutes for recent activity", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a10",
          created_at: fiveMinAgo,
          user: createProfileWithAvatar({ first_name: "Ivy", last_name: "I" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("5m ago")).toBeInTheDocument();
  });

  it("should render time in hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a11",
          created_at: twoHoursAgo,
          user: createProfileWithAvatar({ first_name: "Jay", last_name: "J" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("should render time in days", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a12",
          created_at: threeDaysAgo,
          user: createProfileWithAvatar({ first_name: "Kay", last_name: "K" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("3d ago")).toBeInTheDocument();
  });

  it("should render date for old activity", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a13",
          created_at: "2024-01-15T00:00:00Z",
          user: createProfileWithAvatar({ first_name: "Leo", last_name: "L" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("Jan 15")).toBeInTheDocument();
  });

  it("should render user avatar initials", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a14",
          user: createProfileWithAvatar({ first_name: "Mel", last_name: "M" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("M")).toBeInTheDocument(); // first letter of first_name
  });

  it("should render move action type", () => {
    vi.mocked(useTaskStore).mockReturnValue({
      activityLogs: [
        createActivityLog({
          id: "a15",
          action_type: "move",
          entity_type: "task",
          user: createProfileWithAvatar({ first_name: "Nina", last_name: "N" }),
        }),
      ],
      activityLoading: false,
      fetchActivity: mockFetchActivity,
    } as any);

    render(<ActivityLog boardId="b1" />);
    expect(screen.getByText("moved a task")).toBeInTheDocument();
  });
});
