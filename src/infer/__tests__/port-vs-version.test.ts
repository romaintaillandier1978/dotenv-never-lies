import { describe, it, expect } from "vitest";
import { portRule } from "../rules/port.js";
import { versionRule } from "../rules/version.js";

describe("Inference rules – port vs version", () => {
    it("portRule should NOT match API_VERSION=2.0", () => {
        const result = portRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0",
        });

        // la règle ne s'applique pas → null
        expect(result).toBeNull();
    });

    it("versionRule should not match API_VERSION=2.0", () => {
        const result = versionRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0",
        });

        // la règle reconnaît un pattern version
        expect(result).toBeNull();
    });

    it("versionRule should not match API_VERSION=2.0.0", () => {
        const result = versionRule.tryInfer({
            name: "API_VERSION",
            rawValue: "2.0.0",
        });

        // la règle reconnaît un pattern version
        expect(result).not.toBeNull();
        expect(result?.generated.code).toContain("versionSchema");
        expect(result!.confidence).toBeGreaterThanOrEqual(versionRule.threshold);
    });
});
