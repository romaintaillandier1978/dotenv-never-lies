import { describe, it, expect } from "vitest";
import { versionRule } from "../../rules/version.js";
import { versionGenSchema } from "../../generated/version.js";
import type { InferInput, InferResult } from "../../types.js";

describe("Inference rules – version", () => {
    it("versionRule should match a strict semver value", () => {
        const validVersions = ["1.2.3", "123.345.567336"];
        for (const rawValue of validVersions) {
            const result = versionRule.tryInfer({
                name: "APP_VERSION",
                rawValue,
            });
            expect(result).not.toBeNull();
            expect(result?.generated.imports[0].name).toBe(versionGenSchema(rawValue).imports[0].name);
            expect(result!.confidence).toBeGreaterThanOrEqual(versionRule.threshold);
        }
    });

    it("versionRule should ignore two-part versions", () => {
        const invalidVersions = ["2.0"];
        for (const rawValue of invalidVersions) {
            const result = versionRule.tryInfer({
                name: "APP_VERSION",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });

    it("versionRule should ignore invalid versions", () => {
        const invalidVersions = ["v3.0", "v1.2.3", "3.0.0-rc", "123.345.A", "1.2.3A"];
        for (const rawValue of invalidVersions) {
            const result = versionRule.tryInfer({
                name: "APP_VERSION",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
});
