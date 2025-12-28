import fs from "node:fs";
import path from "node:path";
import dnl from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { getDefaultEnvValue } from "../utils/printer.js";

export const generateCommand = async (opts: { schema?: string; out?: string; includeSecret?: boolean; force?: boolean }) => {
    const outFile = opts.out ?? ".env";
    const target = path.resolve(process.cwd(), outFile);

    if (fs.existsSync(target) && !opts.force) {
        console.error(`❌ ${outFile} already exists. Use --force to overwrite.`);
        process.exit(1);
    }

    const schemaPath = resolveSchemaPath(opts.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const lines: string[] = [];

    for (const [key, def] of Object.entries(envDef.def)) {
        const typedDef = def as unknown as dnl.EnvVarDefinition<any>;
        if (typedDef.description) {
            lines.push(`# ${typedDef.description}`);
        }
        const defaultValue = getDefaultEnvValue(typedDef.schema.def);
        lines.push(`${key}=${defaultValue ?? ""}`);
        lines.push(""); // blank line
    }

    const output = lines.join("\n");

    fs.writeFileSync(target, output);
    console.log(`✅ ${outFile} generated`);
};
