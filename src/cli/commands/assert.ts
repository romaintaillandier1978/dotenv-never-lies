import path from "node:path";
import dnl from "../../index.js";
import { loadDef as loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { z } from "zod";
import { ValidationError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";

export type AssertCliOptions = ProgramCliOptions & {
    source?: string;
};

export const assertCommand = async (opts?: AssertCliOptions | undefined): Promise<void> => {
    const schemaPath = resolveSchemaPath(opts?.schema);

    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    try {
        envDef.assert({
            source: opts?.source ? dnl.readEnvFile(path.resolve(process.cwd(), opts.source)) : process.env,
        });
        console.log("✅ Environment is valid");
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError(
                "Invalid environment variables",
                error.issues.map((issue) => ({
                    key: issue.path.join("."),
                    message: issue.message,
                }))
            );
        }
        throw error;
    }
};
