import { describe, it, expect } from "vitest";
import { heuristicEngine } from "../../heuristic.js";
import { InferContext } from "../../infer.types.js";
import { EvaluatedRule } from "../../report.types.js";

describe("Inference – rule selection", () => {
    const expectedResults = [
        // === JSON ===
        { name: "CONFIG", value: '{"a":1}', expected: "json" },
        { name: "CONFIG", value: '{"port":8080}', expected: "json" },

        // === LIST ===
        { name: "IDS", value: "1,2,3", expected: "list" },
        { name: "ALLOWED_HOSTS", value: "a,b,c", expected: "list" },
        { name: "VALUE", value: "a,b", expected: "list" },
        { name: "VALUE", value: "a=b,c=d", expected: "list" },
        {
            name: "VALUE",
            value: "https://google.com;https://github.com;https://www.npmjs.com/package/@romaintaillandier1978/dotenv-never-lies?activeTab=readme",
            expected: "list",
        },
        { name: "VALUE", value: "env=prod,region=eu", expected: "list" },
        { name: "VALUE", value: "user@mail.com,admin@mail.com,rom@gmail.com", expected: "list" },

        // === PORTS AND NUMBERS  ===
        { name: "VALUE", value: "123", expected: "port" },
        { name: "VERSION", value: "123", expected: "port" },
        { name: "APP_PORT", value: "3000", expected: "port" },
        { name: "PORT", value: "5432", expected: "port" },
        { name: "URL", value: "123", expected: "port" },
        { name: "EMAIL", value: "123", expected: "port" },
        { name: "DURATION", value: "10", expected: "port" },
        { name: "INTERVAL", value: "5", expected: "port" },
        { name: "DURATION", value: "1", expected: "port" },

        // === DURATION ===
        { name: "TIMEOUT", value: "5s", expected: "duration" },
        { name: "TTL", value: "10m", expected: "duration" },
        { name: "DELAY", value: "5s", expected: "duration" },
        { name: "DURATION", value: "10y", expected: "duration" },
        { name: "INTERVAL", value: "5ms", expected: "duration" },

        // === BOOLEAN ===
        { name: "ENABLED", value: "true", expected: "boolean" },
        { name: "IS_ACTIVE", value: "false", expected: "boolean" },
        { name: "VALUE", value: "true", expected: "boolean" },
        { name: "INTERVAL", value: "0", expected: "boolean" },
        { name: "ENABLED", value: "0", expected: "boolean" },
        { name: "ENABLED", value: "yes", expected: "boolean" },
        { name: "ENABLED", value: "no", expected: "boolean" },

        // IP
        { name: "HOST", value: "192.168.1.1", expected: "ip" },
        { name: "HOST", value: "10.168.1.1", expected: "ip" },
        { name: "HOST", value: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", expected: "ip" },

        // VERSION
        { name: "VALUE", value: "1.2.3", expected: "version" },
        { name: "VERSION", value: "1.2.3", expected: "version" },
        { name: "HOST", value: "666.666.666", expected: "version" },

        // url vs email (important)
        { name: "CONTACT", value: "dev@example.com", expected: "email" },
        { name: "DATABASE_URL", value: "postgres://user:pass@localhost:5432/db", expected: "url" },
        { name: "API_URL", value: "http://example.com", expected: "url" },
        { name: "EMAIL", value: "dev@example.com", expected: "email" },
        { name: "CONTACT_EMAIL", value: "user@test.org", expected: "email" },

        // keyValue
        { name: "HEADERS", value: "key=value", expected: "keyValue" },
        { name: "IP", value: "ip=1.2.3.4.5.6", expected: "keyValue" },
        { name: "CONFIG", value: "port=8080", expected: "keyValue" },

        // === NUMBERS ===
        { name: "VALUE", value: "3e4", expected: "number" },
        { name: "VALUE", value: "12.3", expected: "number" },
        { name: "VALUE", value: "54.32", expected: "number" },
        { name: "PORT", value: "3e4", expected: "number" },
        { name: "PORT", value: "12.3", expected: "number" },
        { name: "PORT", value: "54.32", expected: "number" },

        // string and  fallback string
        { name: "VALUE", value: "http//invalid", expected: "string" },
        { name: "VALUE", value: "trueish", expected: "string" },
        { name: "VALUE", value: '{"a":}', expected: "string" },
        { name: "CONFIG", value: "{port=8080}", expected: "string" },
        { name: "PORT", value: "not-a-number", expected: "string" },
        { name: "HOST", value: "192.168.1.1:8080", expected: "string" },
        { name: "HOST", value: "999.999.999.999", expected: "string" },
        { name: "HOST", value: "192.168.0.1.1", expected: "string" },
        { name: "HOST", value: "::ffff:192.0.2.1", expected: "string" },
        { name: "HOST", value: "::1", expected: "string" },
        { name: "VERSION", value: "v3.0", expected: "string" },
        { name: "VERSION", value: "v1.2.3", expected: "string" },
        { name: "VERSION", value: "3.0.0-rc", expected: "string" },
        { name: "VERSION", value: "123.345.A", expected: "string" },
        { name: "VERSION", value: "1.2.3A", expected: "string" },
    ];
    it("should select portRule for a plain number in priority", () => {
        for (const { name, value, expected } of expectedResults) {
            const context: InferContext = { name, rawValue: value, imports: [], reasons: [], codeWarnings: [] };
            const result: Array<EvaluatedRule<"heuristic">> = heuristicEngine(context);
            expect(result.length).toBeGreaterThanOrEqual(1);
            const accepted = result.find((r) => r.outcome === "accepted")?.result.generated;
            expect(accepted).toBeDefined();
            expect(accepted!.kind).toBe(expected);
        }
    });
});
