import { describe, it, expect } from "vitest";
import { keyValueListRule, keyValueRule, listRule } from "../../rules/list.js";
import { keyValueListSchemaGen, keyValueSchemaGen, listSchemaGen } from "../../generated/list.js";
import type { InferInput, InferResult } from "../../types.js";

describe("Inference rules – list", () => {
    it("keyValueListRule should match multiple key-value pairs", () => {
        const keyValueList = [
            "env=prod;region=eu",
            "env=prod,region=eu",
            "env=prod&region=eu",
            "env:prod&region:eu",
            "a=b;c=d",
            "a=b;c=d;e=f",
            "a:b;c:d",
            "a:b;c:d;e:f",
        ];
        for (const rawValue of keyValueList) {
            const result = keyValueListRule.tryInfer({
                name: "APP_LABELS",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("keyValueListRule should match multiple key=value strange with various splitters", () => {
        const keyValueList = ["a=b,c=d;e=f", "a=b;e=f,c=d", "a=b&c=d,e=f", "a=b,e=f&c=d", "a=b;c=d,e"];
        for (const rawValue of keyValueList) {
            const result = keyValueListRule.tryInfer({
                name: "APP_LABELS",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("keyValueListRule should not match multiple ambigous key=value strange with various splitters", () => {
        const keyValueList = ["a=b;c=d,e=f&g=h", "a:b;c:d,e:f&g:h", "a=b;c:d", "a:b;c=d", "a=b,c:d", "a=b;c", "a,b,c", "a;b;c", "abc", "1;2;3"];
        for (const rawValue of keyValueList) {
            const result = keyValueListRule.tryInfer({
                name: "APP_LABELS",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });

    it("keyValueListRule should not match multiple ambigous key=value strange with various splitters", () => {
        const keyValueList = ["a=b;c=d,e=f&g=h", "a:b;c:d,e:f&g:h", "a=b;c:d", "a:b;c=d", "a=b,c:d", "a=b;c", "a,b,c", "a;b;c", "abc", "1;2;3"];
        for (const rawValue of keyValueList) {
            const result = keyValueListRule.tryInfer({
                name: "APP_LABELS",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });
    it("keyValueRule should match incomplete key=value pair", () => {
        const keyValue = ["a=b;;c=d", "a=b,&c=d", "a=b;", ";a=b"];
        for (const rawValue of keyValue) {
            const result = keyValueRule.tryInfer({
                name: "APP_CONFIG",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("listRule should match comma-separated values", () => {
        const list = [
            "a;b",
            "a;b;c",
            "1;2;3",
            "foo;bar;baz",
            "8080;8081;8082",
            "red;green;blue",
            "https://google.com;https://github.com;https://www.npmjs.com/package/@romaintaillandier1978/dotenv-never-lies?activeTab=readme",
            "user@mail.com;admin@mail.com",
            "a,b",
            "a,b,c",
            "1,2,3",
            "foo,bar,baz",
            "8080,8081,8082",
            "red,green,blue",
            "http://a.com,http://b.com",
            "user@mail.com,admin@mail.com",
        ];
        for (const rawValue of list) {
            const result = listRule.tryInfer({
                name: "ALLOWED_LIST",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("listRule should prioritize ';' over ',' when both are present", () => {
        const list = ["a,b;c,d", "1,2;3,4", "foo,bar;baz", "http://a.com,http://b.com;http://c.com"];
        for (const rawValue of list) {
            const result = listRule.tryInfer({
                name: "MIXED_LIST",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });

    it("listRule should not match something that is not a list (not a list)", () => {
        const list = ["a", "1", "true", "false", "listRule should not match something that is not a list (not a list)", ""];
        for (const rawValue of list) {
            const result = listRule.tryInfer({
                name: "MIXED_LIST",
                rawValue,
            });
            expect(result).toBeNull();
        }
    });

    it("listRule should match border cases of list with empty values, or containing space", () => {
        const list = ["a,,b", "a;;b", "a;;b;;", ",a,b", ";a;b", "a; b ;c", "a , b , c"];
        for (const rawValue of list) {
            const result = listRule.tryInfer({
                name: "MIXED_LIST",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });
    it("listRule should match border casesonly empt values", () => {
        const list = [";;;;"];
        for (const rawValue of list) {
            const result = listRule.tryInfer({
                name: "MIXED_LIST",
                rawValue,
            });
            expect(result).not.toBeNull();
        }
    });
});
