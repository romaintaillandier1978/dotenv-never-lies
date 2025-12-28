import path from "node:path";
import dnl from "../../index.js";
import { loadDef as loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { z } from "zod";

export const assertCommand = async (opts: { schema: string; source: string }) => {
    const schemaPath = resolveSchemaPath(opts.schema);

    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    try {
        envDef.assert({
            source: opts.source ? dnl.readEnvFile(path.resolve(process.cwd(), opts.source)) : process.env,
        });
        console.log("✅ Environment is valid");
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Invalid environment variables:\n");

            for (const issue of error.issues) {
                const key = issue.path.join(".");
                console.error(`- ${key}`);
                console.error(`  → ${issue.message}`);
            }

            process.exit(1);
        }
        throw error;
    }
};
