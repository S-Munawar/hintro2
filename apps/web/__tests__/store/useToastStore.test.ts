import { describe, it, expect, beforeEach, vi } from "vitest";
import { useToastStore } from "@/store/useToastStore";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("addToast", () => {
    it("should add a toast with default type 'info'", () => {
      useToastStore.getState().addToast("Hello");

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe("Hello");
      expect(toasts[0].type).toBe("info");
      expect(toasts[0].id).toBeDefined();
    });

    it("should add a toast with specified type", () => {
      useToastStore.getState().addToast("Error!", "error");

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe("error");
    });

    it("should add multiple toasts", () => {
      useToastStore.getState().addToast("First");
      useToastStore.getState().addToast("Second", "success");
      useToastStore.getState().addToast("Third", "error");

      expect(useToastStore.getState().toasts).toHaveLength(3);
    });

    it("should auto-remove toast after 4 seconds", () => {
      useToastStore.getState().addToast("Temporary");
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(4000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("should only remove the specific toast after timeout", () => {
      useToastStore.getState().addToast("First");
      vi.advanceTimersByTime(2000);
      useToastStore.getState().addToast("Second");

      vi.advanceTimersByTime(2000); // 4s for first, 2s for second
      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].message).toBe("Second");
    });
  });

  describe("removeToast", () => {
    it("should remove toast by id", () => {
      useToastStore.getState().addToast("To remove");
      const id = useToastStore.getState().toasts[0].id;

      useToastStore.getState().removeToast(id);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it("should not affect other toasts", () => {
      useToastStore.getState().addToast("Keep");
      useToastStore.getState().addToast("Remove");
      const removeId = useToastStore.getState().toasts[1].id;

      useToastStore.getState().removeToast(removeId);

      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].message).toBe("Keep");
    });
  });
});
