import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Import the functions directly - these are pure utility functions
const { errorHandler, createError } = await import("../../middleware/errorHandler.js");

describe("createError()", () => {
  it("should create an error with statusCode, code, and message", () => {
    const err = createError(400, "BAD_REQUEST", "Invalid input");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Invalid input");
    expect((err as any).statusCode).toBe(400);
    expect((err as any).code).toBe("BAD_REQUEST");
  });

  it("should include details if provided", () => {
    const details = { field: "email", issue: "required" };
    const err = createError(422, "VALIDATION_ERROR", "Validation failed", details);
    expect((err as any).details).toEqual(details);
  });

  it("should work without details", () => {
    const err = createError(404, "NOT_FOUND", "Resource not found");
    expect((err as any).details).toBeUndefined();
  });

  it("should create a 500 error", () => {
    const err = createError(500, "INTERNAL_ERROR", "Something went wrong");
    expect((err as any).statusCode).toBe(500);
  });
});

describe("errorHandler()", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let statusFn: jest.Mock;
  let jsonFn: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    jsonFn = jest.fn();
    statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    mockRes = { status: statusFn, headersSent: false } as any;
    mockNext = jest.fn();
  });

  it("should handle an AppError with statusCode and code", () => {
    const err = createError(400, "BAD_REQUEST", "Bad request input");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Bad request input",
      },
    });
  });

  it("should default to 500 and INTERNAL_ERROR for plain errors", () => {
    const err = new Error("Unexpected failure");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: "INTERNAL_ERROR",
        }),
      }),
    );
  });

  it("should include details in the response if present", () => {
    const err = createError(422, "VALIDATION_ERROR", "Validation failed", { field: "name" });

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: { field: "name" },
      },
    });
  });

  it("should mask 500 error messages in production", () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const err = new Error("sensitive internal info");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(statusFn).toHaveBeenCalledWith(500);
    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });

    process.env.NODE_ENV = origEnv;
  });

  it("should preserve non-500 error messages in production", () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const err = createError(404, "NOT_FOUND", "Board not found");

    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Board not found",
      },
    });

    process.env.NODE_ENV = origEnv;
  });
});
