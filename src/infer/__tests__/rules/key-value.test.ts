import { describe, it, expect } from "vitest";
import { keyValueRule } from "../../rules/key-value.js";

describe("Inference rules – list", () => {
    it("keyValueRule should  match valid key=value pair", () => {
        const keyValue = [
            "a=b",
            "firstname=Romain",
            "lastname=Taillandier",
            "ip=1.2.3.4.5.6",
            "port=8080",
            "url=https://example.com",
            "email=user@example.com",
            "BOOLE1N=true",
            "boolean=f",
            "number=123",
            "string=hello",
        ];
        for (const rawValue of keyValue) {
            const result = keyValueRule.tryInfer({
                name: "APP_CONFIG",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });
    it("keyValueRule should not match invalid key=value pair", () => {
        const keyValue = ["a=b=c=d", "a=b,&c=d", "=b", "b=", "=b=c", "no eq", "KEY:value"];
        for (const rawValue of keyValue) {
            const result = keyValueRule.tryInfer({
                name: "APP_CONFIG",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
    it("keyValueRule should not match invalid key part of the key=value pair", () => {
        const keyValue = ["1KEY=value", "key with space=value", "strange#key=value"];
        for (const rawValue of keyValue) {
            const result = keyValueRule.tryInfer({
                name: "APP_CONFIG",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
    it("keyValueRule should not match URLs-like strings", () => {
        const values = ["http://somewhere.com/?a=b", "x:y", "mailto:user@example.com"];

        for (const rawValue of values) {
            const result = keyValueRule.tryInfer({
                name: "APP_CONFIG",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
});
