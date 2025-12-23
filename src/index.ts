import * as dnl from "./core.js";
import { z } from "zod";

if (!("ZodFirstPartyTypeKind" in z)) {
    throw new Error(
        "dotenv-never-lies requires Zod v4+. Detected an incompatible Zod version. " + "This library exposes Zod schemas as part of its public API."
    );
}

export * from "./core.js";
export { dnl };
export default dnl;
