**Real-Time Task Collaboration Platform**

End-to-End Architectural Document

PERN Stack (PostgreSQL, Express, React, Node.js)

Executive Summary

This document outlines the complete architecture for a Real-Time Task
Collaboration Platform (similar to Trello/Notion) built using the PERN
stack. The platform enables users to create boards, organize tasks
across multiple lists, collaborate in real-time, and track activity
history. The architecture emphasizes scalability, maintainability, and
seamless real-time synchronization across multiple concurrent users.

Key Architectural Highlights

- Frontend: React-based Single Page Application with Zustand for state
  management
- Backend: Node.js/Express REST API with GraphQL capability for
  complex queries
- Database: PostgreSQL with optimized schema and indexing strategies
- Real-time: WebSocket implementation via Socket.io for instant
  updates
- Authentication: Supabase Auth for secure session management
  (email/password, OAuth providers)
- Monorepo: Turborepo for unified frontend & backend development
- Deployment: Docker containerization with horizontal scaling support

1\. System Overview

1.1 High-Level Architecture

The system follows a three-tier architecture:

- Presentation Layer: React SPA with responsive UI
- Application Layer: Express server with REST endpoints and Socket.io
  for WebSockets
- Data Layer: PostgreSQL database with optimized queries and indexing

1.2 Technology Stack

---

  **Layer**               **Technology**          **Purpose**

  Frontend                React 18+               UI components and user
                                                  interactions

  State Management        Zustand                 Lightweight state
                                                  management

  HTTP Client             Axios                   API requests with
                                                  interceptors

  Real-time               Socket.io               WebSocket communication

  Backend Runtime         Node.js 18+             JavaScript runtime
                                                  environment

  Web Framework           Express.js              HTTP server and routing

  Database                PostgreSQL 14+          Relational data
                                                  persistence

  ORM                     Prisma                  Type-safe database
                                                  client and migrations

  Authentication          Supabase Auth           Managed authentication
                                                  (email, OAuth, sessions)

  Validation              Joi                     Schema validation

  Testing                 Jest + React Testing    Unit and integration
                          Library                 tests

  Monorepo                Turborepo               Unified build system,
                                                  caching, task orchestration

  Deployment              Docker                  Containerization

  Environment             PM2 / Kubernetes        Process/orchestration
                                                  management

---

1.3 Monorepo Structure (Turborepo)

The project is organized as a Turborepo monorepo with the following
top-level layout:

> /
>
> ├── apps/
>
> │ ├── web/ \# React frontend (SPA)
>
> │ └── api/ \# Express backend (REST API + WebSockets)
>
> ├── packages/
>
> │ ├── shared/ \# Shared types, constants, validators
>
> │ ├── eslint-config/ \# Shared ESLint configuration
>
> │ └── tsconfig/ \# Shared TypeScript configuration
>
> ├── turbo.json \# Turborepo pipeline configuration
>
> ├── package.json \# Root package.json (workspaces)
>
> └── docker-compose.yml \# Multi-service Docker setup

Turborepo Benefits

- Parallel builds - Frontend and backend build simultaneously
- Remote caching - Shared build cache across team members and CI
- Task pipelines - Defined dependency graph for build, lint, test
- Shared packages - Common types, validators, and config reused
  across apps
- Single repository - Unified version control, PRs, and code reviews

2\. Frontend Architecture

2.1 Component Structure

The React frontend lives in apps/web/ and is organized into a modular
component hierarchy:

> apps/web/src/
>
> ├── components/
>
> │ ├── Auth/ \# Login, Signup, PasswordReset (via Supabase)
>
> │ ├── Board/ \# Board view, List, Task components
>
> │ ├── Task/ \# Task detail, Task editor, Task assignee
>
> │ ├── Sidebar/ \# Navigation, Board list
>
> │ ├── Common/ \# Button, Modal, Loader, Toast
>
> │ └── Search/ \# Search bar, filters
>
> ├── pages/
>
> │ ├── BoardPage
>
> │ ├── LoginPage
>
> │ └── DashboardPage
>
> ├── store/
>
> │ ├── useAuthStore.js \# Auth state and actions
>
> │ ├── useBoardStore.js \# Board state and actions
>
> │ ├── useTaskStore.js \# Task state and actions
>
> │ └── useActivityStore.js \# Activity state and actions
>
> ├── services/
>
> │ ├── api.js \# Axios instance with interceptors
>
> │ ├── socketService.js
>
> │ ├── supabaseClient.js \# Supabase client initialization
>
> │ └── authService.js \# Wraps Supabase Auth methods
>
> ├── hooks/
>
> │ ├── useAuth.js
>
> │ ├── useSocket.js
>
> │ └── useBoard.js
>
> ├── utils/
>
> │ ├── constants.js
>
> │ ├── validators.js
>
> │ └── helpers.js
>
> └── App.js

2.2 State Management (Zustand)

Zustand manages application-wide state using lightweight stores with
colocated state and actions. Each store is a custom hook created via
Zustand's create() function.

Auth Store (useAuthStore)

- State: user (id, email, name, avatar), isAuthenticated, session
  (Supabase session object)
- Actions: loginUser (via supabase.auth.signInWithPassword),
  logoutUser (via supabase.auth.signOut), registerUser (via
  supabase.auth.signUp), updateProfile, loginWithOAuth
- Listens to supabase.auth.onAuthStateChange() to keep state in sync

Board Store (useBoardStore)

- State: boards (array), currentBoardId, isLoading, error
- Actions: fetchBoards, createBoard, updateBoard, deleteBoard,
  setCurrentBoard

Task Store (useTaskStore)

- State: tasks (by boardId), filter, sortBy, searchQuery
- Actions: fetchTasks, createTask, updateTask, deleteTask,
  dragAndDropTask, filterTasks

Activity Store (useActivityStore)

- State: activityLog (array), pagination
- Actions: fetchActivityLog, addActivity, clearActivityLog

Zustand Store Example

> import { create } from 'zustand';
>
> const useTaskStore = create((set, get) =\> ({
>
> tasks: {},
>
> filter: null,
>
> sortBy: 'position',
>
> searchQuery: '',
>
> fetchTasks: async (boardId) =\> {
>
> const res = await api.get(\`/boards/\${boardId}/tasks\`);
>
> set({ tasks: { ...get().tasks, [boardId]: res.data } });
>
> },
>
> createTask: async (listId, taskData) =\> {
>
> const res = await api.post(\`/lists/\${listId}/tasks\`, taskData);
>
> // update tasks in store
>
> },
>
> updateTaskInState: (data) =\> {
>
> // merge updated task into store
>
> },
>
> }));

2.3 Real-time Updates

Socket.io integration handles real-time events:

Socket Events Handled

- task:created - New task added to the board
- task:updated - Task details changed
- task:deleted - Task removed
- task:moved - Task position changed (drag & drop)
- user:joined - User connected to board
- user:left - User disconnected
- typing:start - User started editing
- typing:stop - User stopped editing

Implementation Pattern

Custom hook useSocket manages WebSocket lifecycle:

> const useSocket = (boardId) =\> {
>
> useEffect(() =\> {
>
> const socket = io(SOCKET_URL);
>
> socket.emit(\'join-board\', { boardId });
>
> socket.on(\'task:updated\', (data) =\> {
>
> useTaskStore.getState().updateTaskInState(data);
>
> });
>
> return () =\> socket.disconnect();
>
> }, \[boardId\]);
>
> };

2.4 Routing Architecture

---

  **Route**               **Component**           **Authentication**

  /                       DashboardPage           Required

  /login                  LoginPage               Not Required

  /signup                 SignupPage              Not Required

  /board/:boardId         BoardPage               Required

  /task/:taskId           TaskDetailModal         Required

  /settings               SettingsPage            Required

---

3\. Backend Architecture

3.1 API Endpoints

REST API following RESTful conventions:

Authentication

Authentication is fully handled by Supabase Auth on the client side.
The backend does not expose custom auth endpoints. Instead, the
frontend uses the Supabase JS SDK for signup, login, logout, password
reset, and OAuth flows. The backend verifies Supabase JWT tokens on
each protected request via middleware.

Supabase Auth Features Used

- Email/password signup and login
- OAuth providers (Google, GitHub)
- Magic link login (optional)
- Password reset via Supabase email templates
- Automatic session/token refresh handled by Supabase SDK

---

Board Endpoints

---

  **Method**              **Endpoint**                           **Description**

  GET                     /api/boards                            List user\'s boards
                                                                 (paginated)

  POST                    /api/boards                            Create new board

  GET                     /api/boards/:boardId                   Get board details with
                                                                 lists

  PUT                     /api/boards/:boardId                   Update board

  DELETE                  /api/boards/:boardId                   Delete board

  POST                    /api/boards/:boardId/members           Add member to board

  DELETE                  /api/boards/:boardId/members/:userId   Remove member from
                                                                 board

---

Task Endpoints

---

  **Method**              **Endpoint**                        **Description**

  GET                     /api/boards/:boardId/tasks          Get all tasks in board
                                                              (with filters)

  POST                    /api/lists/:listId/tasks            Create task in list

  GET                     /api/tasks/:taskId                  Get task details

  PUT                     /api/tasks/:taskId                  Update task

  DELETE                  /api/tasks/:taskId                  Delete task

  PUT                     /api/tasks/:taskId/position         Update task position
                                                              (drag/drop)

  POST                    /api/tasks/:taskId/assign           Assign user to task

  DELETE                  /api/tasks/:taskId/assign/:userId   Unassign user from task

---

Activity Endpoints

---

  **Method**              **Endpoint**                    **Description**

  GET                     /api/boards/:boardId/activity   Get activity log
                                                          (paginated)

  GET                     /api/tasks/:taskId/activity     Get task activity

---

3.2 Express Server Structure

The backend lives in apps/api/ within the Turborepo monorepo:

> apps/api/
>
> ├── src/
>
> │ ├── config/
>
> │ │ ├── database.js \# Database connection
>
> │ │ └── env.js \# Environment variables
>
> │ ├── middleware/
>
> │ │ ├── auth.js \# Supabase JWT verification
>
> │ │ ├── errorHandler.js \# Error handling
>
> │ │ └── validation.js \# Request validation
>
> │ ├── routes/
>
> │ │ ├── boards.js
>
> │ │ ├── tasks.js
>
> │ │ └── activity.js
>
> │ ├── controllers/
>
> │ │ ├── boardController.js
>
> │ │ └── taskController.js
>
> │ ├── services/
>
> │ │ ├── boardService.js
>
> │ │ └── taskService.js
>
> │ ├── sockets/
>
> │ │ └── handlers.js \# WebSocket event handlers
>
> │ ├── utils/
>
> │ │ ├── logger.js
>
> │ │ ├── supabase.js \# Supabase admin client (service role key)
>
> │ │ └── pagination.js
>
> │ └── app.js
>
> ├── prisma/
>
> │ └── schema.prisma \# Prisma schema (models, relations, enums)
>
> └── package.json

3.3 Middleware Stack

- CORS Middleware - Allow cross-origin requests from frontend
- Body Parser - Parse JSON and URL-encoded request bodies
- Authentication Middleware - Verify Supabase JWT tokens on protected
  routes using supabase.auth.getUser() or JWT verification with
  Supabase JWT secret
- Authorization Middleware - Check user permissions for resources
- Request Validation - Validate incoming data using Joi schemas
- Error Handler - Centralized error handling with consistent response
  format
- Request Logger - Log all incoming requests for debugging

3.4 Authentication Flow (Supabase)

Login Flow

- User submits email and password on the frontend
- Frontend calls supabase.auth.signInWithPassword({ email, password })
- Supabase validates credentials and returns a session with access
  token and refresh token
- Supabase JS SDK automatically stores the session and manages token
  refresh
- useAuthStore listens to onAuthStateChange() and updates state

OAuth Login Flow

- User clicks "Sign in with Google/GitHub"
- Frontend calls supabase.auth.signInWithOAuth({ provider })
- User is redirected to OAuth provider, then back to the app
- Supabase handles the callback and establishes the session

Protected Route Access

- Frontend retrieves the access token from Supabase session via
  supabase.auth.getSession()
- Sends request with access token in Authorization: Bearer header
- Backend middleware verifies the Supabase JWT using the Supabase JWT
  secret (SUPABASE_JWT_SECRET) or calls supabase.auth.getUser(token)
- If valid, attach user ID from token claims to request and proceed
- If expired, Supabase SDK auto-refreshes on the client side
- If session invalid, redirect to login

3.5 Service Layer Architecture

Services encapsulate business logic, separated from controllers:

Board Service

- getBoardsForUser(userId) - Fetch all boards with member count
- createBoard(userId, boardData) - Create board with initial list
- getBoardWithLists(boardId) - Get board with all lists and tasks
- updateBoard(boardId, userId, data) - Update board with permission
  check
- deleteBoard(boardId, userId) - Delete board and cascade delete tasks
- addMember(boardId, userId, newMemberId) - Add user to board

Task Service

- getTasksByBoardId(boardId, filters) - Get tasks with pagination and
  filtering
- createTask(listId, taskData) - Create task in list
- updateTask(taskId, userId, data) - Update task details
- deleteTask(taskId, userId) - Delete task and its activities
- moveTask(taskId, targetListId, position) - Handle drag & drop
- assignUser(taskId, userId) - Assign user to task

4\. Database Design (PostgreSQL)

4.1 Entity-Relationship Diagram

The database schema consists of the following core entities:

Tables Overview

- auth.users - Managed by Supabase Auth (stores credentials, email,
  OAuth identities)
- profiles - Application-specific user profile data (linked to
  auth.users via id)
- boards - Task boards
- board_members - Board membership and roles
- lists - Task lists within boards
- tasks - Individual tasks
- task_assignees - Task-user assignment mapping
- activity_logs - Activity history

4.2 Detailed Schema

profiles Table

(Linked to Supabase auth.users — user credentials, email, and
password are managed entirely by Supabase Auth. This table stores
application-specific profile data.)

---

  **Column**        **Type**          **Constraints**      **Notes**

  id                UUID              PRIMARY KEY,         References
                                      REFERENCES           auth.users.id
                                      auth.users(id)

  email             VARCHAR(255)      UNIQUE, NOT NULL     Synced from
                                                           Supabase auth

  first_name        VARCHAR(100)      NOT NULL

  last_name         VARCHAR(100)      NOT NULL

  avatar_url        TEXT              NULLABLE             Profile picture
                                                           URL

  is_active         BOOLEAN           DEFAULT true         Account status

  created_at        TIMESTAMP         DEFAULT NOW()        Profile creation
                                                           time

  updated_at        TIMESTAMP         DEFAULT NOW()        Last update time

---

Note: A database trigger or Supabase Auth hook automatically creates a
row in the profiles table when a new user signs up via Supabase Auth.

---

boards Table

---

  **Column**        **Type**          **Constraints**   **Notes**

  id                UUID              PRIMARY KEY

  owner_id          UUID              FOREIGN           Board creator
                                      KEY(users)

  name              VARCHAR(255)      NOT NULL          Board name

  description       TEXT              NULLABLE          Board description

  color             VARCHAR(7)        DEFAULT           Background color
                                      \'#4472C4\'

  is_archived       BOOLEAN           DEFAULT false     Archive status

  created_at        TIMESTAMP         DEFAULT NOW()

  updated_at        TIMESTAMP         DEFAULT NOW()

---

lists Table

---

  **Column**        **Type**          **Constraints**   **Notes**

  id                UUID              PRIMARY KEY

  board_id          UUID              FOREIGN           Parent board
                                      KEY(boards)

  name              VARCHAR(255)      NOT NULL          List name

  position          INTEGER           NOT NULL          Display order

  created_at        TIMESTAMP         DEFAULT NOW()

  updated_at        TIMESTAMP         DEFAULT NOW()

---

tasks Table

---

  **Column**        **Type**                            **Constraints**   **Notes**

  id                UUID                                PRIMARY KEY

  list_id           UUID                                FOREIGN           Parent list
                                                        KEY(lists)

  title             VARCHAR(255)                        NOT NULL          Task title

  description       TEXT                                NULLABLE          Task description

  position          INTEGER                             NOT NULL          Display order

  priority          ENUM(\'low\',\'medium\',\'high\')   DEFAULT           Task priority
                                                        \'medium\'

  due_date          DATE                                NULLABLE          Deadline

  is_completed      BOOLEAN                             DEFAULT false     Completion status

  created_by        UUID                                FOREIGN           Task creator
                                                        KEY(users)

  created_at        TIMESTAMP                           DEFAULT NOW()

  updated_at        TIMESTAMP                           DEFAULT NOW()

---

task_assignees Table

---

  **Column**        **Type**          **Constraints**   **Notes**

  id                UUID              PRIMARY KEY

  task_id           UUID              FOREIGN           Assigned task
                                      KEY(tasks)

  user_id           UUID              FOREIGN           Assigned user
                                      KEY(users)

  assigned_at       TIMESTAMP         DEFAULT NOW()     Assignment time

  CONSTRAINT        UNIQUE(task_id,                     Prevent
                    user_id)                            duplicates

---

activity_logs Table

---

  **Column**        **Type**                                          **Constraints**   **Notes**

  id                UUID                                              PRIMARY KEY

  board_id          UUID                                              FOREIGN           Related board
                                                                      KEY(boards)

  task_id           UUID                                              FOREIGN           Related task
                                                                      KEY(tasks),       (optional)
                                                                      NULLABLE

  user_id           UUID                                              FOREIGN           User who made
                                                                      KEY(users)        change

  action_type       ENUM(\'create\',\'update\',\'delete\',\'move\')                     Type of action

  entity_type       ENUM(\'board\',\'list\',\'task\',\'comment\')                       Entity affected

  changes           JSONB                                             NULLABLE          Field changes as
                                                                                        JSON

  created_at        TIMESTAMP                                         DEFAULT NOW()     Timestamp

---

board_members Table

---

  **Column**        **Type**                                **Constraints**   **Notes**

  id                UUID                                    PRIMARY KEY

  board_id          UUID                                    FOREIGN           Board
                                                            KEY(boards)

  user_id           UUID                                    FOREIGN           User
                                                            KEY(users)

  role              ENUM(\'admin\',\'editor\',\'viewer\')   DEFAULT           User role
                                                            \'editor\'

  joined_at         TIMESTAMP                               DEFAULT NOW()

  CONSTRAINT        UNIQUE(board_id, user_id)                                 Prevent
                                                                              duplicates

---

4.3 Indexing Strategy

---

  **Index Name**            **Table**         **Columns**            **Benefit**

  idx_tasks_list_position   tasks             (list_id, position)    Optimize task
                                                                     sorting

  idx_tasks_board_id        tasks             (list_id-\>board_id)   Find tasks by
                                                                     board

  idx_tasks_created_by      tasks             (created_by)           Find user\'s
                                                                     tasks

  idx_boards_owner_id       boards            (owner_id)             Find user\'s
                                                                     boards

  idx_activity_board_time   activity_logs     (board_id, created_at  Activity timeline
                                              DESC)

  idx_board_members_user    board_members     (user_id)              Find user\'s
                                                                     boards

  idx_task_assignees_user   task_assignees    (user_id)              Find user\'s
                                                                     tasks

  idx_users_email           users             (email)                Fast user lookup

---

4.4 SQL Queries - Key Operations

Get all tasks for a board (with pagination)

> SELECT t.\*, l.name as list_name, u.first_name, u.last_name
>
> FROM tasks t
>
> JOIN lists l ON t.list_id = l.id
>
> JOIN users u ON t.created_by = u.id
>
> WHERE l.board_id = \$1
>
> ORDER BY l.position, t.position
>
> LIMIT \$2 OFFSET \$3;

Get task with assignees

> SELECT t.\*, json_agg(json_build_object(
>
> \'id\', u.id, \'name\', u.first_name \|\| \' \' \|\| u.last_name
>
> )) as assignees
>
> FROM tasks t
>
> LEFT JOIN task_assignees ta ON t.id = ta.task_id
>
> LEFT JOIN users u ON ta.user_id = u.id
>
> WHERE t.id = \$1
>
> GROUP BY t.id;

5\. Real-time Communication (WebSockets)

5.1 Socket.io Architecture

Socket.io provides bidirectional, event-based communication between
client and server.

5.2 Event Flow

Client → Server Events

---

  **Event**               **Payload**             **Handler**

  join-board              {boardId: string}       Add to socket room,
                                                  fetch updates

  leave-board             {boardId: string}       Remove from socket room

  task:create             {listId, title, \...}   Create task, broadcast
                                                  to room

  task:update             {taskId, updates}       Update task, broadcast
                                                  changes

  task:delete             {taskId}                Delete task, notify
                                                  room

  task:move               {taskId, targetListId,  Move task, broadcast
                          position}

  typing:start            {taskId, userId}        Broadcast user is
                                                  editing

  typing:stop             {taskId, userId}        Broadcast user stopped
                                                  editing

---

Server → Client Events

---

  **Event**               **Payload**             **Broadcast To**

  task:created            {task object}           All in board room

  task:updated            {taskId, changes}       All in board room

  task:deleted            {taskId}                All in board room

  task:moved              {taskId, newListId,     All in board room
                          position}

  user:joined             {userId, userName}      All in board room

  user:left               {userId}                All in board room

  sync:update             {timestamp, entities}   All in board room

  error                   {message}               Requesting client only

---

5.3 Server-side Implementation

> const io = require(\'socket.io\')(server, { cors: {\...} });
>
> io.on(\'connection\', (socket) =\> {
>
> socket.on(\'join-board\', async ({ boardId }) =\> {
>
> socket.join(\`board:\${boardId}\`);
>
> // Fetch and send current state
>
> const board = await Board.findById(boardId).populate(\'tasks\');
>
> socket.emit(\'board:loaded\', board);
>
> });
>
> socket.on(\'task:create\', async ({ listId, title }) =\> {
>
> const task = await Task.create({\...});
>
> io.to(\`board:\${boardId}\`).emit(\'task:created\', task);
>
> await logActivity({\...});
>
> });
>
> });

5.4 Conflict Resolution

When multiple users edit simultaneously:

- Last-Write-Wins (LWW) - For simple updates, timestamp determines
  winner
- Operational Transform (OT) - For collaborative editing of task
  descriptions
- Locking Mechanism - For critical operations (e.g., task deletion)
- Version Numbers - Track entity versions to detect conflicts

5.5 Heartbeat & Reconnection

- Server sends ping every 25 seconds, client responds with pong
- If no pong received within 60 seconds, server considers client
  disconnected
- Client automatically attempts reconnection with exponential backoff
- On reconnection, client receives full board state and missed events

6\. API Contract Design

6.1 Request/Response Format

All API requests and responses follow consistent JSON format:

Success Response (200-201)

> {
>
> \"success\": true,
>
> \"data\": { /\* response data \*/ },
>
> \"message\": \"Operation successful\"
>
> }

Error Response (4xx-5xx)

> {
>
> \"success\": false,
>
> \"error\": {
>
> \"code\": \"VALIDATION_ERROR\",
>
> \"message\": \"Invalid input\",
>
> \"details\": { /\* field errors \*/ }
>
> }
>
> }

6.2 Authentication

> Authorization: Bearer \<supabase_access_token\>

Access tokens are issued and managed by Supabase Auth. The Supabase
JS SDK handles automatic token refresh on the client side. The backend
verifies the JWT using the Supabase JWT secret.

6.3 Pagination

> GET /api/boards?page=1&limit=10&sort=created_at&order=desc
>
> Response:
>
> {
>
> \"data\": \[\...\],
>
> \"pagination\": {
>
> \"page\": 1,
>
> \"limit\": 10,
>
> \"total\": 45,
>
> \"pages\": 5
>
> }
>
> }

6.4 Sample API Calls

Create Task

> POST /api/lists/list-123/tasks
>
> {
>
> \"title\": \"Implement authentication\",
>
> \"description\": \"Add Supabase auth integration\",
>
> \"priority\": \"high\",
>
> \"due_date\": \"2025-02-20\"
>
> }

Update Task Position

> PUT /api/tasks/task-123/position
>
> {
>
> \"list_id\": \"list-456\",
>
> \"position\": 3
>
> }

Search Tasks

> GET /api/boards/board-123/tasks?search=auth&priority=high&status=open

7\. Security & Authentication

7.1 Authentication Strategy

Supabase Auth (Managed Authentication)

- Authentication is delegated to Supabase Auth, removing the need for
  custom auth logic on the backend
- Supabase issues JWTs signed with a project-specific secret
- Access Token: Short-lived, automatically refreshed by Supabase SDK
- Session management handled entirely by Supabase client library
- User claims in token: sub (user id), email, role, aud
- Supported auth methods: email/password, Google OAuth, GitHub OAuth,
  magic links

7.2 Password Security

- Passwords are managed by Supabase Auth (bcrypt hashing handled
  internally)
- Password policies configurable via Supabase Dashboard
- Password reset via Supabase's built-in email reset flow
  (supabase.auth.resetPasswordForEmail())
- Email verification enforced via Supabase settings

7.3 Authorization Levels

---

  **Role**                **Permissions**         **Scope**

  Admin                   Full control            Board level

  Editor                  Create, edit, delete    Board level
                          tasks

  Viewer                  View only               Board level

  Owner                   Delete board, manage    Board level
                          members

---

7.4 API Security

- CORS - Restrict to frontend domain only
- Rate Limiting - 100 requests per minute per IP
- Input Validation - All inputs validated using Joi schemas
- SQL Injection Prevention - Parameterized queries via Prisma ORM
- CSRF Protection - SameSite=Strict cookie policy
- HTTPS Only - All communications encrypted

7.5 Data Privacy

- Sensitive data (tokens) never logged; passwords managed by Supabase
- User data encrypted at rest using PGP encryption for PII
- Activity logs retained for 90 days, then archived
- GDPR compliance - User data export and deletion capabilities

8\. Scalability & Performance

8.1 Frontend Performance

- Code splitting - Lazy load components with React.lazy()
- Memoization - Prevent unnecessary re-renders with React.memo()
- Virtual scrolling - Efficiently render large task lists
- Debouncing - Throttle search and drag-drop operations
- Service workers - Offline support and caching strategy

8.2 Backend Scaling

Horizontal Scaling

- Stateless design - Each server instance is independent
- Load balancer (Nginx) - Distribute traffic across multiple servers
- Redis for sessions - Shared session store across instances
- Socket.io adapter - Redis adapter for cross-server communication

Database Optimization

- Connection pooling - PgBouncer limits active connections
- Query optimization - Indexes on frequently filtered columns
- Read replicas - Distribute read-heavy queries
- Partitioning - Partition activity_logs table by board_id

8.3 Caching Strategy

---

  **Layer**         **Technology**    **TTL**           **Use Case**

  Frontend          Browser cache     30 min            Static assets

  Frontend          Zustand store     Session           Application state

  Backend           Redis             5-30 min          User, board data

  Database          Query cache       1 min             Frequently
                                                        accessed data

  CDN               CloudFront        1 hour            Static files,
                                                        images

---

8.4 Monitoring & Observability

- Application metrics - Prometheus for request duration, error rates
- Logs - ELK stack (Elasticsearch, Logstash, Kibana)
- APM - New Relic or DataDog for performance monitoring
- Alerting - PagerDuty for critical issues
- Health checks - /health endpoint for load balancer

9\. Deployment Architecture

9.1 Container Strategy

Each app in the Turborepo monorepo has its own Dockerfile. Turborepo's
pruning feature (turbo prune) creates a minimal, isolated workspace
for each Docker build.

> \# Dockerfile for backend (apps/api)
>
> FROM node:18-alpine AS builder
>
> WORKDIR /app
>
> RUN npm install -g turbo
>
> COPY . .
>
> RUN turbo prune api \--docker
>
> FROM node:18-alpine AS installer
>
> WORKDIR /app
>
> COPY \--from=builder /app/out/json/ .
>
> RUN npm ci
>
> COPY \--from=builder /app/out/full/ .
>
> RUN npx turbo run build \--filter=api
>
> FROM node:18-alpine AS runner
>
> WORKDIR /app
>
> COPY \--from=installer /app/apps/api/dist ./dist
>
> COPY \--from=installer /app/apps/api/prisma ./prisma
>
> COPY \--from=installer /app/apps/api/package.json .
>
> RUN npm ci \--only=production
>
> EXPOSE 5000
>
> CMD \[\"node\", \"dist/app.js\"\]

9.2 Kubernetes Deployment

Components

- Frontend - Served via Nginx ingress
- Backend API - Replicated pods with auto-scaling
- WebSocket server - Sticky sessions via affinity rules
- PostgreSQL - Managed database service (RDS/Cloud SQL)
- Redis - In-memory store for sessions and caching

9.3 CI/CD Pipeline

GitHub Actions Workflow (with Turborepo)

- Trigger: Push to main/develop branch
- Cache: Restore Turborepo remote cache for faster builds
- Build: Run turbo run lint test build (parallel, cached)
- Affected: Only rebuild/test apps affected by changed files
- Deploy: Push Docker images (web, api) to registry, update
  Kubernetes
- Verify: Smoke tests on staging environment
- Promote: Manual approval for production deployment

9.4 Environment Setup

---

  **Environment**   **Infrastructure**   **Database**      **WebSockets**

  Development       Local machine        Local PostgreSQL  Localhost

  Staging           Single Kubernetes    Managed RDS       Prod config
                    node

  Production        Multi-node           RDS with backups  Redis-backed
                    Kubernetes

---

10\. Assumptions & Trade-offs

10.1 Key Assumptions

- Users have stable internet connection for real-time features
- Maximum 1000 concurrent users per instance
- Board size limit: 500 tasks per board
- Activity logs retained for 90 days only
- No built-in encryption for user communications (relying on HTTPS)

10.2 Trade-offs Made

Choice: REST API over GraphQL

- Trade-off: More endpoints but simpler caching strategy
- Benefit: Easier for beginners, faster development
- Future: Can add GraphQL layer for complex queries

Choice: Polling + WebSockets over CRDT

- Trade-off: Potential race conditions in simultaneous edits
- Benefit: Simpler implementation, easier to debug
- Impact: Acceptable for task management (not real-time docs)

Choice: PostgreSQL over NoSQL

- Trade-off: Less flexible schema for evolving requirements
- Benefit: ACID compliance, data integrity, relational queries
- Suitable: Structured task data with clear relationships

Choice: Session storage in Redis

- Trade-off: Additional infrastructure dependency
- Benefit: Shared sessions for horizontal scaling
- Alternative: In-memory store for single-instance deployment

11\. Implementation Checklist

11.1 Phase 1: Core (Weeks 1-3)

- Setup: Turborepo monorepo scaffold (apps/web, apps/api,
  packages/shared), Docker setup, Supabase project setup,
  database migrations
- Backend: Supabase Auth integration, board CRUD, task CRUD endpoints
- Frontend: Login (Supabase Auth UI), dashboard, board view components
- Testing: Unit tests for API endpoints and auth middleware

11.2 Phase 2: Real-time (Weeks 4-5)

- WebSockets: Implement Socket.io integration
- Real-time sync: Task updates, activity broadcast
- Conflict resolution: Handle concurrent edits
- Integration: Connect frontend to WebSocket events

11.3 Phase 3: Advanced Features (Weeks 6-7)

- Drag & drop: Task movement across lists
- Search & filters: Advanced task filtering
- Activity history: Full audit trail
- Notifications: Email and in-app notifications

11.4 Phase 4: Polish & Deployment (Week 8)

- Performance: Caching, optimization, load testing
- Security: Penetration testing, security audit
- Documentation: API docs, deployment guide
- Production release: CI/CD pipeline, monitoring setup

12\. Conclusion

This PERN stack architecture provides a solid foundation for a scalable,
real-time task collaboration platform. The separation of concerns across
frontend, backend, and database layers enables independent scaling and
maintenance. The WebSocket implementation ensures users experience
real-time updates without polling overhead.

Key strengths of this design:

- Turborepo monorepo enables shared code, parallel builds, and
  unified CI/CD
- Modular architecture allows team parallelization
- REST API provides clear contracts and easy testing
- PostgreSQL ensures data consistency and ACID compliance
- WebSocket real-time features enable true collaboration
- Horizontal scalability through stateless design
- Comprehensive security with Supabase Auth and role-based access
  control

The implementation roadmap is realistic for an 8-week development cycle
with proper testing and deployment practices.
