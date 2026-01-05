import dnl from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { Explanation, toExplanation } from "../utils/printer.js";
import { UsageError } from "../../errors.js";

type ExplainCliOptions = {
    schema?: string | undefined;
    keys?: string[] | undefined;
    format?: "human" | "json" | undefined;
};

export const explainCommand = async (options?: ExplainCliOptions): Promise<{ format: "human" | "json"; result: Explanation[] }> => {
    const format = options?.format ?? "human";
    if (format !== "human" && format !== "json") {
        throw new UsageError(`Invalid format: ${format}`);
    }

    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const keysToSerialize = new Array<string>();
    if (options?.keys) {
        keysToSerialize.push(...options.keys);
    }

    const result = new Array<Explanation>();

    for (const [key, value] of Object.entries(envDef.def)) {
        if (keysToSerialize.length > 0 && !keysToSerialize.includes(key)) {
            continue;
        }
        result.push(toExplanation(key, value as dnl.EnvVarDefinition<any>));
    }

    if (result.length === 0) {
        throw new UsageError("No matching environment variables found");
    }
    return { format, result };
};

export const printHuman = (result: Explanation[]) => {
    if (result.length > 1) {
        for (const item of result) {
            console.log(`${item.key}: ${item.description}  \t\tfor more details :  dnl explain ${item.key}`);
        }
        return;
    }

    console.log(`${result[0].key}:`);
    console.log(`   Description: ${result[0].description}`);
    console.log(`   Type: ${result[0].type}`);
    if (result[0].required !== undefined) {
        console.log(`   Required: ${result[0].required ? "Yes" : "No"}`);
    }
    if (result[0].default !== undefined) {
        console.log(`   Default: ${result[0].default ?? "No"}`);
    }
    console.log(`   Secret: ${result[0].secret === true ? "Yes" : "No"}`);
    if (result[0].examples) {
        console.log(`   Examples: ${result[0].examples.join(", ")}`);
    }
};
