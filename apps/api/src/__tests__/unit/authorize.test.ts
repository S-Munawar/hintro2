import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Mock Prisma before importing authorize
jest.unstable_mockModule("../../config/database.js", () => ({
  prisma: {
    board: {
      findUnique: jest.fn(),
    },
    boardMember: {
      findUnique: jest.fn(),
    },
  },
}));

const { authorize } = await import("../../middleware/authorize.js");
const { prisma } = await import("../../config/database.js");

const mockBoardFindUnique = prisma.board.findUnique as jest.MockedFunction<any>;
const mockMemberFindUnique = prisma.boardMember.findUnique as jest.MockedFunction<any>;

function createMockReq(params: Record<string, string> = {}, userId?: string) {
  return {
    params,
    userId,
  } as unknown as Request;
}

function createMockRes() {
  return {} as Response;
}

describe("authorize() middleware", () => {
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it("should return 400 if boardId is missing", async () => {
    const req = createMockReq({}, "user-1");
    const middleware = authorize();

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing board ID or user ID",
        statusCode: 400,
      }),
    );
  });

  it("should return 400 if userId is missing", async () => {
    const req = createMockReq({ boardId: "board-1" });
    const middleware = authorize();

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Missing board ID or user ID",
        statusCode: 400,
      }),
    );
  });

  it("should return 404 if board is not found", async () => {
    const req = createMockReq({ boardId: "board-1" }, "user-1");
    mockBoardFindUnique.mockResolvedValue(null);
    const middleware = authorize();

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Board not found",
        statusCode: 404,
      }),
    );
  });

  it("should allow board owner full access", async () => {
    const req = createMockReq({ boardId: "board-1" }, "owner-1");
    mockBoardFindUnique.mockResolvedValue({ owner_id: "owner-1" });
    const middleware = authorize("admin");

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(); // called without error
    expect(mockMemberFindUnique).not.toHaveBeenCalled();
  });

  it("should return 403 if user is not board member", async () => {
    const req = createMockReq({ boardId: "board-1" }, "stranger-1");
    mockBoardFindUnique.mockResolvedValue({ owner_id: "owner-1" });
    mockMemberFindUnique.mockResolvedValue(null);
    const middleware = authorize();

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "You are not a member of this board",
        statusCode: 403,
      }),
    );
  });

  it("should allow member with no role restriction", async () => {
    const req = createMockReq({ boardId: "board-1" }, "member-1");
    mockBoardFindUnique.mockResolvedValue({ owner_id: "owner-1" });
    mockMemberFindUnique.mockResolvedValue({ role: "viewer" });
    const middleware = authorize(); // no role restriction

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(); // called without error
  });

  it("should allow member with matching role", async () => {
    const req = createMockReq({ boardId: "board-1" }, "member-1");
    mockBoardFindUnique.mockResolvedValue({ owner_id: "owner-1" });
    mockMemberFindUnique.mockResolvedValue({ role: "editor" });
    const middleware = authorize("admin", "editor");

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(); // called without error
  });

  it("should return 403 if member role does not match allowed roles", async () => {
    const req = createMockReq({ boardId: "board-1" }, "member-1");
    mockBoardFindUnique.mockResolvedValue({ owner_id: "owner-1" });
    mockMemberFindUnique.mockResolvedValue({ role: "viewer" });
    const middleware = authorize("admin", "editor");

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Requires one of: admin, editor",
        statusCode: 403,
      }),
    );
  });

  it("should forward unexpected errors to next", async () => {
    const req = createMockReq({ boardId: "board-1" }, "user-1");
    const dbError = new Error("DB connection failed");
    mockBoardFindUnique.mockRejectedValue(dbError);
    const middleware = authorize();

    await middleware(req, createMockRes(), next as NextFunction);

    expect(next).toHaveBeenCalledWith(dbError);
  });
});
