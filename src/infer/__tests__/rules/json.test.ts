import { describe, it, expect } from "vitest";
import { jsonRule } from "../../rules/json.js";
import { jsonGenSchemaNoName } from "../../generated/json.js";

describe("Inference rules – json", () => {
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
            expect(result3?.reasons?.some((r) => r.includes("primitive"))).toBe(true);
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
});
