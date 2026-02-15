import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

const { validate } = await import("../../middleware/validation.js");

function createMockReqResNext(body = {}, query = {}, params = {}) {
  const req = { body, query, params } as unknown as Request;
  const jsonFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn }) as any;
  const res = { status: statusFn, json: jsonFn } as unknown as Response;
  const next = jest.fn() as unknown as NextFunction;
  return { req, res, next, statusFn, jsonFn };
}

describe("validate() middleware", () => {
  const bodySchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
  });

  describe("body validation", () => {
    it("should call next() on valid body", () => {
      const { req, res, next } = createMockReqResNext({ name: "John", email: "john@test.com" });
      const middleware = validate(bodySchema, "body");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: "John", email: "john@test.com" });
    });

    it("should return 400 on invalid body", () => {
      const { req, res, next, statusFn, jsonFn } = createMockReqResNext({ name: "" });
      const middleware = validate(bodySchema, "body");

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(statusFn).toHaveBeenCalledWith(400);
      expect(jsonFn).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: expect.any(Object),
          }),
        }),
      );
    });

    it("should include field-level errors in details", () => {
      const { req, res, next, jsonFn } = createMockReqResNext({});
      const middleware = validate(bodySchema, "body");

      middleware(req, res, next);

      const response = jsonFn.mock.calls[0]![0] as any;
      expect(response.error.details).toHaveProperty("name");
      expect(response.error.details).toHaveProperty("email");
    });

    it("should default source to body", () => {
      const { req, res, next } = createMockReqResNext({ name: "John", email: "a@b.co" });
      const middleware = validate(bodySchema);

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should replace req.body with parsed data (strips extra fields)", () => {
      const { req, res, next } = createMockReqResNext({
        name: "John",
        email: "john@test.com",
        extraField: "should be stripped",
      });
      const middleware = validate(bodySchema, "body");

      middleware(req, res, next);

      expect(req.body).toEqual({ name: "John", email: "john@test.com" });
      expect(req.body.extraField).toBeUndefined();
    });
  });

  describe("query validation", () => {
    const querySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
    });

    it("should store parsed data in req.validatedQuery", () => {
      const { req, res, next } = createMockReqResNext({}, { page: "1", limit: "10" });
      const middleware = validate(querySchema, "query");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validatedQuery).toEqual({ page: "1", limit: "10" });
    });

    it("should return 400 on invalid query", () => {
      const strictQuerySchema = z.object({
        page: z.string().regex(/^\d+$/, "Must be a number"),
      });
      const { req, res, next, statusFn } = createMockReqResNext({}, { page: "abc" });
      const middleware = validate(strictQuerySchema, "query");

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(statusFn).toHaveBeenCalledWith(400);
    });
  });

  describe("params validation", () => {
    const paramsSchema = z.object({
      id: z.string().uuid("Invalid ID format"),
    });

    it("should store parsed data in req.validatedParams", () => {
      const validId = "550e8400-e29b-41d4-a716-446655440000";
      const { req, res, next } = createMockReqResNext({}, {}, { id: validId });
      const middleware = validate(paramsSchema, "params");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validatedParams).toEqual({ id: validId });
    });

    it("should return 400 on invalid params", () => {
      const { req, res, next, statusFn } = createMockReqResNext({}, {}, { id: "not-a-uuid" });
      const middleware = validate(paramsSchema, "params");

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(statusFn).toHaveBeenCalledWith(400);
    });
  });

  describe("formatZodError edge cases", () => {
    it("should use _root for path-less errors", () => {
      // Use a refinement that produces a path-less error
      const schema = z.string().min(1, "Required");
      const { req, res, next, jsonFn } = createMockReqResNext(undefined);
      // Patch req body to be an invalid type
      req.body = "";
      const middleware = validate(schema, "body");

      middleware(req, res, next);

      const response = jsonFn.mock.calls[0]![0] as any;
      expect(response.error.details).toHaveProperty("_root");
    });

    it("should handle nested path errors", () => {
      const schema = z.object({
        address: z.object({
          city: z.string().min(1, "City required"),
        }),
      });
      const { req, res, next, jsonFn } = createMockReqResNext({ address: { city: "" } });
      const middleware = validate(schema, "body");

      middleware(req, res, next);

      const response = jsonFn.mock.calls[0]![0] as any;
      expect(response.error.details["address.city"]).toBe("City required");
    });
  });
});
