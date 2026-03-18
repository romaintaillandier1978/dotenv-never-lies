import { describe, it, expect } from "vitest";
import { durationRule } from "../../rules/duration.js";
import { expectNameInfluence, expectResilienceSurroundinSpaces } from "../common/common.js";

describe("Inference rules – duration", () => {
    it("durationRule should not match empty values, or non-boolean values", () => {
        const invalids = ["", "''", '""', "123abc", "abc", "http://example.com", "dev@example.com"];
        for (const invalid of invalids) {
            const result = durationRule.tryInfer({
                name: "IS_ENABLED",
                rawValue: invalid,
            });
            expect(result).toBeNull();
        }
    });
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
            expect(result).not.toBeNull();
            expect(result?.confidence).toBeLessThan(durationRule.meta.threshold);
        }
    });
    it("durationRule name should influence confidence", () => {
        expectNameInfluence(durationRule, "5s", "REQUEST_TIMEOUT");
    });
    it("durationRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(durationRule, "5s", "REQUEST_TIMEOUT");
    });
});
