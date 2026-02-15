import { paginate, paginationMeta } from "../../utils/pagination.js";

describe("paginate()", () => {
  it("should return correct skip and take for page 1", () => {
    expect(paginate({ page: 1, limit: 10 })).toEqual({ skip: 0, take: 10 });
  });

  it("should return correct skip and take for page 2", () => {
    expect(paginate({ page: 2, limit: 10 })).toEqual({ skip: 10, take: 10 });
  });

  it("should return correct skip and take for page 3 with limit 5", () => {
    expect(paginate({ page: 3, limit: 5 })).toEqual({ skip: 10, take: 5 });
  });

  it("should handle page 1 with limit 1", () => {
    expect(paginate({ page: 1, limit: 1 })).toEqual({ skip: 0, take: 1 });
  });

  it("should handle large page numbers", () => {
    expect(paginate({ page: 100, limit: 25 })).toEqual({ skip: 2475, take: 25 });
  });

  it("should handle limit of 0", () => {
    expect(paginate({ page: 1, limit: 0 })).toEqual({ skip: 0, take: 0 });
  });
});

describe("paginationMeta()", () => {
  it("should calculate pages correctly", () => {
    expect(paginationMeta(1, 10, 25)).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      pages: 3,
    });
  });

  it("should return 1 page when total equals limit", () => {
    expect(paginationMeta(1, 10, 10)).toEqual({
      page: 1,
      limit: 10,
      total: 10,
      pages: 1,
    });
  });

  it("should return 0 pages when total is 0", () => {
    expect(paginationMeta(1, 10, 0)).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
  });

  it("should handle total less than limit", () => {
    expect(paginationMeta(1, 10, 3)).toEqual({
      page: 1,
      limit: 10,
      total: 3,
      pages: 1,
    });
  });

  it("should handle total exactly divisible by limit", () => {
    expect(paginationMeta(2, 5, 20)).toEqual({
      page: 2,
      limit: 5,
      total: 20,
      pages: 4,
    });
  });

  it("should handle large datasets", () => {
    expect(paginationMeta(10, 50, 1000)).toEqual({
      page: 10,
      limit: 50,
      total: 1000,
      pages: 20,
    });
  });

  it("should handle limit of 1", () => {
    expect(paginationMeta(1, 1, 5)).toEqual({
      page: 1,
      limit: 1,
      total: 5,
      pages: 5,
    });
  });
});
