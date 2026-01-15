import { describe, it, expect } from "vitest";
import { urlRule } from "../../rules/url.js";
import { databaseUrlGenSchema, httpUrlGenSchema } from "../../generated/url.js";
import type { InferInput, InferResult } from "../../types.js";

describe("Inference rules – url", () => {
    it("urlRule should match an HTTP URL", () => {
        const httpUrls = ["https://example.com", "http://example.com"];
        for (const rawValue of httpUrls) {
            const result = urlRule.tryInfer({
                name: "HTTP_URL",
                rawValue,
            });
            expect(result).not.toBeNull();
            expect(result?.generated.imports[0].name).toBe(httpUrlGenSchema(rawValue).imports[0].name);
            expect(result!.confidence).toBeGreaterThanOrEqual(urlRule.threshold);
        }
    });

    it("urlRule should match a database URL", () => {
        const databaseUrls = ["postgres://user:pass@localhost:5432/app"];
        for (const rawValue of databaseUrls) {
            const result = urlRule.tryInfer({
                name: "DATABASE_URL",
                rawValue,
            });
            expect(result).not.toBeNull();
            expect(result?.generated.imports[0].name).toBe(databaseUrlGenSchema(rawValue).imports[0].name);
            expect(result!.confidence).toBeGreaterThanOrEqual(urlRule.threshold);
        }
    });

    it("urlRule should ignore invalid URLs", () => {
        const invalidUrls = ["not-a-url", "https://", "not-a-url but contains a valid URL: https://example.com/path"];
        for (const rawValue of invalidUrls) {
            const result = urlRule.tryInfer({
                name: "API_URL",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
});
