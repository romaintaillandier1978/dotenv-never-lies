import { booleanRule } from "../../rules/boolean.js";
import { boolGenSchema } from "../../generated/boolean.js";
import { InferInput, InferResult } from "../../rules.types.js";
import { describe, it, expect } from "vitest";

describe("Inference rules – boolean", () => {
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
});
