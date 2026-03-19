import { describe, it, expect } from "vitest";
import { numberRule, emailRule, stringRule } from "../../rules/basic.js";
import { zEmailGenSchema, zNumberGenSchema, zStringGenSchema } from "../../generated/basic.js";
import type { InferInput } from "../../infer.types.js";
import type { HeuristicResult } from "../../heuristic.types.js";
import { expectNameInfluence, expectResilienceSurroundinSpaces, expectValidToHaveGoodReasons } from "../common/common.js";

describe("Inference rules – basic", () => {
    it("numberRule should not match non-numeric values", () => {
        const invalidValues = ["123abc", "abc", "12.3.4"];

        for (const rawValue of invalidValues) {
            const result = numberRule.tryInfer({
                name: "NUMBER",
                rawValue,
            });

            expect(result).toBeNull();
        }
    });
    it("numberRule should match a valid number", () => {
        const input: InferInput = {
            name: "NUMBER",
            rawValue: "123",
        };
        const result: HeuristicResult | null = numberRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zNumberGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(numberRule.meta.threshold);
    });
    it("numberRule should match a valid number wrapped in quotes", () => {
        const input: InferInput = {
            name: "NUMBER",
            rawValue: '"123"',
        };
        const result: HeuristicResult | null = numberRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zNumberGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(numberRule.meta.threshold);
    });

    it("numberRule should match float values", () => {
        const input: InferInput = {
            name: "RATE",
            rawValue: "-12.5",
        };
        const result: HeuristicResult | null = numberRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zNumberGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(numberRule.meta.threshold);
    });

    it("numberRule should match integers outside port range", () => {
        const input: InferInput = {
            name: "BIG_NUMBER",
            rawValue: "+7e6",
        };
        const result: HeuristicResult | null = numberRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zNumberGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(numberRule.meta.threshold);
    });

    it("numberRule name should influence confidence", () => {
        expectNameInfluence(numberRule, "123", "NUMBER");
    });

    it("numberRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(numberRule, "123", "NUMBER");
    });
    it("numberRule should have good reasons", () => {
        expectValidToHaveGoodReasons(numberRule, ["123", "+7e6", "-12.5"], "NUMBER");
    });
});

describe("Inference rules – email", () => {
    it("emailRule should not match non-email values", () => {
        const invalidValues = ["123abc", "abc", "12.3.4", "http://example.com"];

        for (const rawValue of invalidValues) {
            const result = emailRule.tryInfer({
                name: "CONTACT_EMAIL",
                rawValue,
            });

            expect(result).toBeNull();
        }
    });
    it("emailRule should match a valid email-like value", () => {
        const input: InferInput = {
            name: "CONTACT_EMAIL",
            rawValue: "dev@example.com",
        };
        const result: HeuristicResult | null = emailRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zEmailGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(emailRule.meta.threshold);
    });

    it("emailRule should ignore non-email values", () => {
        const input: InferInput = {
            name: "NOT_EMAIL",
            rawValue: "dev@example",
        };
        const result: HeuristicResult | null = emailRule.tryInfer(input);

        expect(result).toBeNull();
    });

    it("emailRule should ignore non-email values (database URL)", () => {
        const input: InferInput = {
            name: "DATABASE_URL",
            rawValue: "postgres://user:pass@localhost:5432/app",
        };
        const result: HeuristicResult | null = emailRule.tryInfer(input);

        expect(result).toBeNull();
    });
    it("emailRule name should influence confidence", () => {
        expectNameInfluence(emailRule, "dev@example.com", "CONTACT_EMAIL");
    });
    it("emailRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(emailRule, "dev@example.com", "CONTACT_EMAIL");
    });
    it("emailRule should have good reasons", () => {
        expectValidToHaveGoodReasons(emailRule, ["dev@example.com"], "CONTACT_EMAIL");
    });
});

describe("Inference rules – string", () => {
    it("stringRule should always fallback to string", () => {
        const invalids = [
            "123abc",
            "abc",
            "12.3.4",
            "http://example.com",
            "true",
            "false",
            "0",
            "1",
            "yes",
            "no",
            "y",
            "n",
            "dev@example.com",
            '{"key":"value"}',
        ];

        for (const invalid of invalids) {
            const result = stringRule.tryInfer({
                name: "ANY_VALUE",
                rawValue: invalid,
            });

            expect(result).not.toBeNull();
            expect(result?.generated.code).toBe(zStringGenSchema.code);
            expect(result!.confidence).toBeGreaterThanOrEqual(stringRule.meta.threshold);
        }
    });

    it("stringRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(stringRule, "whatever", "ANY_VALUE");
    });
    // DO NOT TEST NAME INFLUENCE FOR STRING RULE, IT IS NOT APPLICABLE
});
