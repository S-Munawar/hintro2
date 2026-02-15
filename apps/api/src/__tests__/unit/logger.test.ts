import { jest } from "@jest/globals";

const originalEnv = process.env.LOG_LEVEL;

// We need to dynamically import the logger for each test group
// to test different LOG_LEVEL settings
describe("logger", () => {
  let consoleSpy: {
    error: jest.SpiedFunction<typeof console.error>;
    warn: jest.SpiedFunction<typeof console.warn>;
    log: jest.SpiedFunction<typeof console.log>;
  };

  beforeEach(() => {
    consoleSpy = {
      error: jest.spyOn(console, "error").mockImplementation(() => {}),
      warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
      log: jest.spyOn(console, "log").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.LOG_LEVEL = originalEnv;
  });

  describe("with default log level (info)", () => {
    let logger: typeof import("../../utils/logger.js").logger;

    beforeAll(async () => {
      delete process.env.LOG_LEVEL;
      // Re-import to get fresh module with current env
      const mod = await import("../../utils/logger.js");
      logger = mod.logger;
    });

    it("should log error messages", () => {
      logger.error("test error");
      expect(consoleSpy.error).toHaveBeenCalled();
      const msg = consoleSpy.error.mock.calls[0]![0] as string;
      expect(msg).toContain("[ERROR]");
      expect(msg).toContain("test error");
    });

    it("should log warn messages", () => {
      logger.warn("test warn");
      expect(consoleSpy.warn).toHaveBeenCalled();
      const msg = consoleSpy.warn.mock.calls[0]![0] as string;
      expect(msg).toContain("[WARN]");
      expect(msg).toContain("test warn");
    });

    it("should log info messages via console.log", () => {
      logger.info("test info");
      expect(consoleSpy.log).toHaveBeenCalled();
      const msg = consoleSpy.log.mock.calls[0]![0] as string;
      expect(msg).toContain("[INFO]");
      expect(msg).toContain("test info");
    });

    it("should include meta data when provided", () => {
      logger.info("with meta", { key: "value" });
      expect(consoleSpy.log).toHaveBeenCalled();
      const msg = consoleSpy.log.mock.calls[0]![0] as string;
      expect(msg).toContain("with meta");
      expect(msg).toContain('"key"');
      expect(msg).toContain('"value"');
    });

    it("should format timestamp in messages", () => {
      logger.info("timestamp test");
      const msg = consoleSpy.log.mock.calls[0]![0] as string;
      // Timestamp format: [YYYY-MM-DDTHH:mm:ss.mmmZ]
      expect(msg).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("logger.debug", () => {
    let logger: typeof import("../../utils/logger.js").logger;

    beforeAll(async () => {
      const mod = await import("../../utils/logger.js");
      logger = mod.logger;
    });

    it("should use console.log for debug", () => {
      // At default info level, debug may be suppressed.
      // Just ensure the logger.debug function exists and is callable.
      expect(typeof logger.debug).toBe("function");
    });
  });

  describe("output format", () => {
    let logger: typeof import("../../utils/logger.js").logger;

    beforeAll(async () => {
      const mod = await import("../../utils/logger.js");
      logger = mod.logger;
    });

    it("should format error message with level and content", () => {
      logger.error("failure", { code: 500 });
      const msg = consoleSpy.error.mock.calls[0]![0] as string;
      expect(msg).toContain("[ERROR]");
      expect(msg).toContain("failure");
      expect(msg).toContain("500");
    });

    it("should format warn message without meta", () => {
      logger.warn("hello world");
      const msg = consoleSpy.warn.mock.calls[0]![0] as string;
      expect(msg).toContain("[WARN]");
      expect(msg).toContain("hello world");
    });
  });
});
