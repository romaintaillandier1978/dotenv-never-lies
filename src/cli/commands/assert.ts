import path from "node:path";
import dnl from "../../index.js";
import { loadDef as loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { z } from "zod";
import { ValidationError } from "../../errors.js";
import { ProgramCliOptions } from "./program.js";

export type AssertCliOptions = ProgramCliOptions & {
    source?: string;
    warnOnDuplicates?: boolean;
};
export type AssertResult = {
    warnings: string[];
};

export const assertCommand = async (opts?: AssertCliOptions | undefined): Promise<AssertResult> => {
    const schemaPath = resolveSchemaPath(opts?.schema);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const warnings: string[] = [];
    try {
        envDef.assert({
            source: opts?.source
                ? dnl.readEnvFile(path.resolve(process.cwd(), opts.source), { onDuplicate: opts?.warnOnDuplicates ? "warn" : "error" }, warnings)
                : process.env,
        });
        return { warnings };
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
