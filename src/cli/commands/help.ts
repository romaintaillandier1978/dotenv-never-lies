import path from "node:path";
import dnl from "../../index.js";
import { loadSchema } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";

export const printCommand = async (opts: { schema: string }) => {
    const schemaPath = resolveSchemaPath(opts.schema);
    console.log("schemaPath", schemaPath);
    console.log("opts", opts);

    const envDef = (await loadSchema(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    envDef.help();
};
