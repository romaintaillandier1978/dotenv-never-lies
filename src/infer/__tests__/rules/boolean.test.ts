import { booleanRule } from "../../rules/boolean.js";

import { describe, it, expect } from "vitest";
import { expectNameInfluence, expectResilienceSurroundinSpaces } from "../common/common.js";

describe("Inference rules – boolean", () => {
    it("booleanRule should not match empty values, or non-boolean values", () => {
        const invalids = ["", "''", '""', "123abc", "abc", "http://example.com", "dev@example.com"];
        for (const invalid of invalids) {
            const result = booleanRule.tryInfer({
                name: "IS_ENABLED",
                rawValue: invalid,
            });
            expect(result).toBeNull();
        }
    });
    it("booleanRule should match strict boolean values", () => {
        const trueFalseValues = ["true", "false"];
        for (const rawValue of trueFalseValues) {
            const result = booleanRule.tryInfer({
                name: "IS_ENABLED",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("booleanRule should match 0 or 1 values", () => {
        const zeroOneValues = ["0", "1"];
        for (const rawValue of zeroOneValues) {
            const result = booleanRule.tryInfer({
                name: "IS_ENABLED",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });
    it("booleanRule should match yes,no,y,n values", () => {
        const yesNoValues = ["yes", "no", "y", "n"];
        for (const rawValue of yesNoValues) {
            const result = booleanRule.tryInfer({
                name: "IS_ENABLED",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });
    it("booleanRule name should influence confidence", () => {
        expectNameInfluence(booleanRule, "true", "IS_ENABLED");
    });
    it("booleanRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(booleanRule, "true", "IS_ENABLED");
    });
});
