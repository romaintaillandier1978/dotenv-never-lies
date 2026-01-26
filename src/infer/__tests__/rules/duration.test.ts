import { describe, it, expect } from "vitest";
import { durationRule } from "../../rules/duration.js";

describe("Inference rules – duration", () => {
    it("durationRule should match a valid duration", () => {
        const validDurations = ["5s", "10m", "2h", "3d", "4w", "5M", "6y"];
        for (const rawValue of validDurations) {
            const result = durationRule.tryInfer({
                name: "REQUEST_TIMEOUT",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("durationRule should ignore invalid durations", () => {
        const invalidDurations = ["5", "-55.5h"];
        for (const rawValue of invalidDurations) {
            const result = durationRule.tryInfer({
                name: "REQUEST_TIMEOUT",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
});
