import { describe, it, expect } from "vitest";
import { portRule } from "../../rules/port.js";
import { portGenSchema } from "../../generated/port.js";
import type { InferInput, InferResult } from "../../rules.types.js";

describe("Inference rules – port", () => {
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
});
