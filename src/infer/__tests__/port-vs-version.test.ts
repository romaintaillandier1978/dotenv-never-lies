import { describe, it, expect } from "vitest";
import { portRule } from "../rules/port.js";
import { versionRule } from "../rules/version.js";
import { versionGenSchemaNoName } from "../generated/version.js";

describe("Inference rules – port vs version", () => {
    it("portRule should NOT match API_VERSION=2.0", () => {
        const result = portRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0",
        });

        // rule does not apply → null
        expect(result).toBeNull();
    });

    it("versionRule should not match API_VERSION=2.0", () => {
        const result = versionRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0",
        });

        // rule does not recognizes a version pattern
        expect(result).toBeNull();
    });

    it("versionRule should not match API_VERSION=2.0.0", () => {
        const result = versionRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0.0",
        });

        // rule recognizes a version pattern
        expect(result).not.toBeNull();
        expect(result?.generated.code).toContain(versionGenSchemaNoName.imports[0].name);
        expect(result!.confidence).toBeGreaterThanOrEqual(versionRule.threshold);
    });
});
