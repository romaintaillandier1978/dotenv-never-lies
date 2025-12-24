import path from "node:path";
import dnl from "../../index.js";
import { loadSchema } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";

export const checkCommand = async (opts: { schema: string; source: string }) => {
    const schemaPath = resolveSchemaPath(opts.schema);

    const envDef = (await loadSchema(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const ok = envDef.check({
        source: opts.source ? dnl.readEnvFile(path.resolve(process.cwd(), opts.source)) : undefined,
    });

    if (ok) {
        console.log("✅ Environment is valid");
        process.exitCode = 0;
    } else {
        console.log("❌ Environment is invalid");
        process.exitCode = 1;
    }
};
