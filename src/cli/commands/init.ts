import fs from "node:fs";
import path from "node:path";
import dnl from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { getDefaultEnvValue } from "../utils/printer.js";
import { ExportError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";

export type initCliOptions = ProgramCliOptions & {
    out?: string;
    includeSecret?: boolean;
    force?: boolean;
};
export type InitResult = {
    content: string;
    out: string;
};

export const initCommand = async (opts?: initCliOptions | undefined): Promise<{ content: string; out: string }> => {
    const outFile = opts?.out ?? ".env";
    const target = path.resolve(process.cwd(), outFile);

    if (fs.existsSync(target) && !opts?.force) {
        throw new ExportError(`${outFile} already exists. Use --force to overwrite.`);
    }

    const schemaPath = resolveSchemaPath(opts?.schema);
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

    return {
        content: output,
        out: target,
    };
};
