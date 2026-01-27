import { describe, it, expect } from "vitest";
import { numberRule, emailRule, stringRule } from "../../rules/basic.js";
import { zEmailGenSchema, zNumberGenSchema, zStringGenSchema } from "../../generated/basic.js";
import type { InferInput } from "../../infer.types.js";
import type { HeuristicResult } from "../../heuristic.types.js";

describe("Inference rules – basic", () => {
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
});

describe("Inference rules – email", () => {
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
});

describe("Inference rules – string", () => {
    it("stringRule should always fallback to string", () => {
        const input: InferInput = {
            name: "ANY_VALUE",
            rawValue: "whatever",
        };
        const result: HeuristicResult | null = stringRule.tryInfer(input);

        expect(result).not.toBeNull();
        expect(result?.generated.code).toBe(zStringGenSchema.code);
        expect(result!.confidence).toBeGreaterThanOrEqual(stringRule.meta.threshold);
    });
});
