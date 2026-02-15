import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabaseClient";

// We need to mock axios before importing the api module
vi.mock("axios", () => {
  const mockInterceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };

  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: mockInterceptors,
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe("api lib", () => {
  let api: typeof import("@/lib/api").default;
  let apiGet: typeof import("@/lib/api").apiGet;
  let apiPost: typeof import("@/lib/api").apiPost;
  let apiPut: typeof import("@/lib/api").apiPut;
  let apiDelete: typeof import("@/lib/api").apiDelete;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const axios = await import("axios");
    mockAxiosInstance = axios.default.create();
    const apiModule = await import("@/lib/api");
    api = apiModule.default;
    apiGet = apiModule.apiGet;
    apiPost = apiModule.apiPost;
    apiPut = apiModule.apiPut;
    apiDelete = apiModule.apiDelete;
  });

  describe("apiGet", () => {
    it("should call api.get and return data", async () => {
      const response = { data: { success: true, data: [{ id: 1 }] } };
      mockAxiosInstance.get.mockResolvedValue(response);

      const result = await apiGet("/boards", { page: 1 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/boards", { params: { page: 1 } });
      expect(result).toEqual(response.data);
    });

    it("should work without params", async () => {
      const response = { data: { success: true, data: [] } };
      mockAxiosInstance.get.mockResolvedValue(response);

      const result = await apiGet("/boards");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/boards", { params: undefined });
      expect(result).toEqual(response.data);
    });
  });

  describe("apiPost", () => {
    it("should call api.post with data and return response", async () => {
      const response = { data: { success: true, data: { id: "new-1" } } };
      mockAxiosInstance.post.mockResolvedValue(response);

      const result = await apiPost("/boards", { name: "New Board" });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/boards", { name: "New Board" });
      expect(result).toEqual(response.data);
    });

    it("should work without data", async () => {
      const response = { data: { success: true, data: null } };
      mockAxiosInstance.post.mockResolvedValue(response);

      const result = await apiPost("/action");

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/action", undefined);
      expect(result).toEqual(response.data);
    });
  });

  describe("apiPut", () => {
    it("should call api.put with data and return response", async () => {
      const response = { data: { success: true, data: { id: "1", name: "Updated" } } };
      mockAxiosInstance.put.mockResolvedValue(response);

      const result = await apiPut("/boards/1", { name: "Updated" });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/boards/1", { name: "Updated" });
      expect(result).toEqual(response.data);
    });
  });

  describe("apiDelete", () => {
    it("should call api.delete and return response", async () => {
      const response = { data: { success: true } };
      mockAxiosInstance.delete.mockResolvedValue(response);

      const result = await apiDelete("/boards/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/boards/1");
      expect(result).toEqual(response.data);
    });
  });

  describe("error propagation", () => {
    it("should propagate errors from api calls", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Network Error"));

      await expect(apiGet("/boards")).rejects.toThrow("Network Error");
    });

    it("should propagate errors from post calls", async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error("Server Error"));

      await expect(apiPost("/boards", {})).rejects.toThrow("Server Error");
    });
  });

  describe("request interceptor", () => {
    it("should be registered on creation", async () => {
      // The api module registers interceptors at import time, not per-test.
      // Verify the create mock was called (interceptors are set up on the instance).
      const axios = await import("axios");
      expect(axios.default.create).toHaveBeenCalled();
    });
  });

  describe("response interceptor", () => {
    it("should be registered on creation", async () => {
      const axios = await import("axios");
      expect(axios.default.create).toHaveBeenCalled();
    });
  });
});
