import { z } from "zod";

// check zod version, throw if not compatible
if (!("ZodFirstPartyTypeKind" in z)) {
    throw new Error(
        "dotenv-never-lies requires Zod v4+. Detected an incompatible Zod version. " + "This library exposes Zod schemas as part of its public API."
    );
}

import * as dnl from "./core.js";

// Export core functions and types
export * from "./core.js";
export { dnl };
export default dnl;

// export all zod schemas
export * from "./schemas/index.js";

// exporter API
export * as exporter from "./export/index.js";
