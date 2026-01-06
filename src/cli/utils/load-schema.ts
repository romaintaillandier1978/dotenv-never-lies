import { build } from "esbuild";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { EnvDefinitionHelper } from "../../core.js";
import { SchemaNotFoundError } from "../../errors.js";

export const loadDef = async (schemaPath: string): Promise<EnvDefinitionHelper<any>> => {
    const outDir = path.join(process.cwd(), ".dnl");
    await fs.mkdir(outDir, { recursive: true });

    // We always overwrite the file here; this could be an issue.
    const outFile = path.join(outDir, "env.dnl.mjs");
    try {
        await build({
            entryPoints: [schemaPath],
            outfile: outFile,
            format: "esm",
            platform: "node",
            target: "node18",
            bundle: true,
            packages: "external",
        });

        const mod = await import(pathToFileURL(outFile).href);

        if (!mod.default) {
            throw new SchemaNotFoundError(`The file ${schemaPath} must export a default schema (export default).`);
        }

        return mod.default;
    } catch (error) {
        throw new SchemaNotFoundError(`Unable to load DNL schema (${schemaPath}): ${error}`);
    }
};
