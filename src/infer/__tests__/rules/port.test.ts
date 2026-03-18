import { describe, it, expect } from "vitest";
import { portRule } from "../../rules/port.js";
import { expectNameInfluence, expectResilienceSurroundinSpaces } from "../common/common.js";

describe("Inference rules – port", () => {
    it("portRule should not match empty values, or non-port values", () => {
        const invalids = ["", "''", '""', "123abc", "abc", "12.3.4", "http://example.com", "dev@example.com"];
        for (const invalid of invalids) {
            const result = portRule.tryInfer({
                name: "PORT",
                rawValue: invalid,
            });
            expect(result).toBeNull();
        }
    });
    it("portRule should match a valid port number", () => {
        const validPorts = ["5432", "8080", "3000"];
        for (const rawValue of validPorts) {
            const result = portRule.tryInfer({
                name: "DB_PORT",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("portRule should ignore invalid port numbers", () => {
        const invalidPorts = ["70000", "0", "-1", "65536"];

        for (const rawValue of invalidPorts) {
            const result = portRule.tryInfer({
                name: "PORT",
                rawValue,
            });

            expect(result).toBeNull();
        }
    });
    it("portRule name should influence confidence", () => {
        expectNameInfluence(portRule, "8080", "PORT");
    });
    it("portRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(portRule, "8080", "PORT");
    });
});
