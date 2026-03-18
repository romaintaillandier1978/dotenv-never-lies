import { describe, it, expect } from "vitest";
import { jsonRule } from "../../rules/json.js";
import { jsonGenSchemaNoName } from "../../generated/json.js";
import { expectResilienceSurroundinSpaces } from "../common/common.js";

describe("Inference rules – json", () => {
    it("jsonRule should not match empty values, or non-JSON values", () => {
        const invalids = ["", "''", '""', "123abc", "abc", "12.3.4", "http://example.com", "yes", "no", "y", "n", "dev@example.com"];
        for (const invalid of invalids) {
            const result = jsonRule.tryInfer({
                name: "CONFIG_JSON",
                rawValue: invalid,
            });
            expect(result).toBeNull();
        }
    });
    it("jsonRule should match JSON objects", () => {
        const jsonObjects = ['{"key":"value"}', '["value1","value2"]'];
        for (const rawValue of jsonObjects) {
            const result = jsonRule.tryInfer({
                name: "CONFIG_JSON",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("jsonRule should match JSON primitives, with low confidence", () => {
        const jsonPrimitives = ['"key"', "123", '"true"', '"false"', '"null"'];
        for (const rawValue of jsonPrimitives) {
            const result3 = jsonRule.tryInfer({
                name: "SOMETHING",
                rawValue,
            });
            expect(result3).not.toBeNull();
            expect(result3?.generated.imports[0].name).toBe(jsonGenSchemaNoName.imports[0].name);
            expect(result3!.confidence).toBeLessThan(jsonRule.meta.threshold);
            expect(result3?.reasons?.some((r: string) => r.includes("primitive"))).toBe(true);
        }
    });

    it("jsonRule should ignore invalid JSON", () => {
        const invalidJson = ['{"key":}', '["value1","value2"}'];
        for (const rawValue of invalidJson) {
            const result = jsonRule.tryInfer({
                name: "CONFIG_JSON",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
    it("jsonRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(jsonRule, '{"key":"value"}', "CONFIG_JSON");
    });
    // DO NOT TEST NAME INFLUENCE FOR JSON RULE, IT IS NOT APPLICABLE
});
