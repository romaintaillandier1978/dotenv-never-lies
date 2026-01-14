// import { describe, it, expect } from "vitest";
// import { infer } from "../../cli/utils/infer-schema.js";
// import { portRule } from "../port.js";

// describe("Inference – port vs version", () => {
//     const importedSchemas = new Set<string>();
//     const verbose: Array<string> = [];
//     it("does not infer port from API_VERSION=2.0", () => {
//         const result = infer("API_VERSION", "2.0", importedSchemas, verbose);

//         expect(result).not.toBe("portSchema");
//     });

//     it("does not infer version from API_VERSION=2.0 (major.minor only)", () => {
//         const result = infer("API_VERSION", "2.0", importedSchemas, verbose);

//         expect(result.type).not.toBe("version");
//     });

//     it("falls back to string for API_VERSION=2.0", () => {
//         const result = infer("API_VERSION", "2.0", importedSchemas, verbose);

//         expect(result.schema).toBe("z.string()");
//         expect(result.confidence).toBe(0);
//     });
// });
