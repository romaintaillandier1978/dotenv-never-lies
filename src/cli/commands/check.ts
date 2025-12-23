import path from "node:path";
import dnl from "../../index.js";
import { loadSchema } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";

export const checkCommand = async (opts: { schema: string; mode: dnl.LoadMode; source: string }) => {
    const schemaPath = resolveSchemaPath(opts.schema);
    console.log("schemaPath", schemaPath);
    console.log("opts", opts);

    const envDef = (await loadSchema(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const ok = envDef.check({
        source: opts.source ? dnl.readEnvFile(path.resolve(process.cwd(), opts.source)) : process.env,
        mode: opts.mode,
    });

    ok ? console.log("✅ Environment is valid") : console.log("❌ Environment is invalid");
};
