import type {
  BoardSummary,
  BoardDetail,
  BoardCreated,
  BoardMember,
  List,
  ListWithTasks,
  Task,
  TaskAssignee,
  ActivityLogEntry,
  ProfileSummary,
  ProfileWithEmail,
  ProfileFull,
  ProfileWithAvatar,
  ApiResponse,
} from "@/types";

// ── Profile Factories ─────────────────────────────────────────────────

export function createProfileSummary(overrides?: Partial<ProfileSummary>): ProfileSummary {
  return {
    id: "user-1",
    first_name: "John",
    last_name: "Doe",
    ...overrides,
  };
}

export function createProfileWithEmail(overrides?: Partial<ProfileWithEmail>): ProfileWithEmail {
  return {
    ...createProfileSummary(),
    email: "john@example.com",
    ...overrides,
  };
}

export function createProfileFull(overrides?: Partial<ProfileFull>): ProfileFull {
  return {
    ...createProfileWithEmail(),
    avatar_url: null,
    ...overrides,
  };
}

export function createProfileWithAvatar(overrides?: Partial<ProfileWithAvatar>): ProfileWithAvatar {
  return {
    ...createProfileSummary(),
    avatar_url: null,
    ...overrides,
  };
}

// ── Board Factories ───────────────────────────────────────────────────

export function createBoardSummary(overrides?: Partial<BoardSummary>): BoardSummary {
  return {
    id: "board-1",
    name: "Test Board",
    description: "A test board",
    color: "#6366f1",
    is_archived: false,
    owner_id: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    owner: createProfileWithEmail(),
    _count: { members: 2, lists: 3 },
    ...overrides,
  };
}

export function createBoardDetail(overrides?: Partial<BoardDetail>): BoardDetail {
  return {
    id: "board-1",
    name: "Test Board",
    description: "A test board",
    color: "#6366f1",
    is_archived: false,
    owner_id: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    owner: createProfileWithEmail(),
    members: [],
    lists: [],
    ...overrides,
  };
}

export function createBoardCreated(overrides?: Partial<BoardCreated>): BoardCreated {
  return {
    id: "board-1",
    name: "Test Board",
    description: null,
    color: "#6366f1",
    is_archived: false,
    owner_id: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    owner: createProfileWithEmail(),
    lists: [],
    ...overrides,
  };
}

// ── List Factories ────────────────────────────────────────────────────

export function createList(overrides?: Partial<List>): List {
  return {
    id: "list-1",
    board_id: "board-1",
    name: "To Do",
    position: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

export function createListWithTasks(overrides?: Partial<ListWithTasks>): ListWithTasks {
  return {
    ...createList(),
    tasks: [],
    ...overrides,
  };
}

// ── Task Factories ────────────────────────────────────────────────────

export function createTask(overrides?: Partial<Task>): Task {
  return {
    id: "task-1",
    list_id: "list-1",
    title: "Test Task",
    description: null,
    position: 0,
    priority: "medium",
    due_date: null,
    is_completed: false,
    created_by: "user-1",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    creator: createProfileSummary(),
    assignees: [],
    ...overrides,
  };
}

export function createTaskAssignee(overrides?: Partial<TaskAssignee>): TaskAssignee {
  return {
    id: "assignee-1",
    task_id: "task-1",
    user_id: "user-2",
    assigned_at: "2025-01-01T00:00:00Z",
    user: createProfileWithAvatar({ id: "user-2", first_name: "Jane", last_name: "Smith" }),
    ...overrides,
  };
}

// ── Board Member Factory ──────────────────────────────────────────────

export function createBoardMember(overrides?: Partial<BoardMember>): BoardMember {
  return {
    id: "member-1",
    board_id: "board-1",
    user_id: "user-2",
    role: "editor",
    joined_at: "2025-01-01T00:00:00Z",
    user: createProfileFull({ id: "user-2", first_name: "Jane", last_name: "Smith" }),
    ...overrides,
  };
}

// ── Activity Log Factory ──────────────────────────────────────────────

export function createActivityLog(overrides?: Partial<ActivityLogEntry>): ActivityLogEntry {
  return {
    id: "activity-1",
    board_id: "board-1",
    task_id: "task-1",
    user_id: "user-1",
    action_type: "create",
    entity_type: "task",
    changes: null,
    created_at: "2025-01-01T00:00:00Z",
    user: createProfileWithAvatar(),
    task: { id: "task-1", title: "Test Task" },
    ...overrides,
  };
}

// ── API Response Wrapper ──────────────────────────────────────────────

export function createApiResponse<T>(data: T, overrides?: Partial<ApiResponse<T>>): ApiResponse<T> {
  return {
    success: true,
    data,
    ...overrides,
  };
}

// ── Mock Session & User ───────────────────────────────────────────────

export function createMockSession() {
  return {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_at: Date.now() / 1000 + 3600,
    expires_in: 3600,
    token_type: "bearer" as const,
    user: createMockUser(),
  };
}

export function createMockUser() {
  return {
    id: "user-1",
    email: "john@example.com",
    app_metadata: {},
    user_metadata: { first_name: "John", last_name: "Doe" },
    aud: "authenticated",
    created_at: "2025-01-01T00:00:00Z",
  };
}
