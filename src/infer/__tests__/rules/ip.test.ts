import { describe, it, expect } from "vitest";
import { ipRule } from "../../rules/ip.js";
import { ipGenSchema } from "../../generated/ip.js";
import type { InferInput, InferResult } from "../../types.js";

describe("Inference rules – ip", () => {
    it("ipRule should match a valid IP address", () => {
        const validIps = ["192.168.0.1", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"];
        for (const rawValue of validIps) {
            const result = ipRule.tryInfer({
                name: "HOST_IP",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("ipRule should ignore invalid IP addresses", () => {
        const invalidIps = ["999.999.999.999", "666.666.666", "192.168.0.1.1", "::ffff:192.0.2.1", "::1"];
        for (const rawValue of invalidIps) {
            const result = ipRule.tryInfer({
                name: "HOST_IP",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
});
