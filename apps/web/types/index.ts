// ─── API Response Types ──────────────────────────────────────────────
// Mirror the backend Prisma models + includes exactly as returned by the API.

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type BoardRole = "admin" | "editor" | "viewer";
export type ActionType = "create" | "update" | "delete" | "move";
export type EntityType = "board" | "list" | "task" | "comment";

// ─── Profiles ────────────────────────────────────────────────────────

export interface ProfileSummary {
  id: string;
  first_name: string;
  last_name: string;
}

export interface ProfileWithEmail extends ProfileSummary {
  email: string;
}

export interface ProfileWithAvatar extends ProfileSummary {
  avatar_url: string | null;
}

export interface ProfileFull extends ProfileWithEmail {
  avatar_url: string | null;
}

// ─── Board ───────────────────────────────────────────────────────────

/** Shape returned by GET /api/boards (list) */
export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_archived: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: ProfileWithEmail;
  _count: { members: number; lists: number };
}

/** Shape returned by GET /api/boards/:boardId (detail) */
export interface BoardDetail {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_archived: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: ProfileWithEmail;
  members: BoardMember[];
  lists: ListWithTasks[];
}

/** Shape returned by POST /api/boards (create) */
export interface BoardCreated {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_archived: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner: ProfileWithEmail;
  lists: List[];
}

// ─── Board Member ────────────────────────────────────────────────────

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: BoardRole;
  joined_at: string;
  user: ProfileFull;
}

// ─── List ────────────────────────────────────────────────────────────

export interface List {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ListWithTasks extends List {
  tasks: Task[];
}

// ─── Task ────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  position: number;
  priority: TaskPriority;
  due_date: string | null;
  is_completed: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: ProfileSummary;
  assignees?: TaskAssignee[];
  list?: { id: string; name: string; board_id?: string };
}

export interface TaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
  user: ProfileWithAvatar;
}

// ─── Activity ────────────────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string;
  board_id: string;
  task_id: string | null;
  user_id: string;
  action_type: ActionType;
  entity_type: EntityType;
  changes: Record<string, unknown> | null;
  created_at: string;
  user: ProfileWithAvatar;
  task: { id: string; title: string } | null;
}

// ─── API Response Wrappers ───────────────────────────────────────────

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
