import dnl from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { Explanation, toExplanation } from "../utils/printer.js";

type ExplainCliOptions = {
    schema?: string | undefined;
    keys?: string[] | undefined;
    format?: "human" | "json" | undefined;
};

export const explainCommand = async (options?: ExplainCliOptions): Promise<number> => {
    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const format = options?.format ?? "human";
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
        console.error("No variables found");
        return 1;
    }

    switch (format) {
        case "json":
            console.log(JSON.stringify(result, null, 2));
            return 0;
        case "human":
            printHuman(result);
            return 0;
        default:
            console.error(`Invalid format: ${format}`);
            return 1;
    }
};

const printHuman = (result: Explanation[]) => {
    if (result.length > 1) {
        for (const item of result) {
            console.log(`${item.key}: ${item.description}  --- dnl explain ${item.key} --format human  for more details`);
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
