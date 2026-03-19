import { describe, it, expect } from "vitest";
import { ipRule } from "../../rules/ip.js";
import { expectNameInfluence, expectResilienceSurroundinSpaces, expectValidToHaveGoodReasons } from "../common/common.js";
describe("Inference rules – ip", () => {
    it("ipRule should not match empty values, or non-IP values", () => {
        const invalids = ["", "''", '""', "123abc", "abc", "http://example.com", "dev@example.com"];
        for (const invalid of invalids) {
            const result = ipRule.tryInfer({
                name: "HOST_IP",
                rawValue: invalid,
            });
            expect(result).toBeNull();
        }
    });
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
    it("ipRule name should influence confidence", () => {
        expectNameInfluence(ipRule, "192.168.0.1", "HOST_IP");
    });
    it("ipRule should handle surrounding spaces", () => {
        expectResilienceSurroundinSpaces(ipRule, "192.168.0.1", "HOST_IP");
    });
    it("ipRule should have good reasons", () => {
        expectValidToHaveGoodReasons(ipRule, ["192.168.0.1", "2001:0db8:85a3:0000:0000:8a2e:0370:7334"], "HOST_IP");
    });
});
