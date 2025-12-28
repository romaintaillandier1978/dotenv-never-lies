import { build } from "esbuild";
import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { EnvDefinitionHelper } from "../../core.js";

export const loadDef = async (schemaPath: string): Promise<EnvDefinitionHelper<any>> => {
    const outDir = path.join(process.cwd(), ".dnl");
    await fs.mkdir(outDir, { recursive: true });

    const outFile = path.join(outDir, "env.dnl.mjs");

    await build({
        entryPoints: [schemaPath],
        outfile: outFile,
        format: "esm",
        platform: "node",
        target: "node18",
        bundle: false,
    });

    const mod = await import(pathToFileURL(outFile).href);

    if (!mod.default) {
        throw new Error("Le fichier env.dnl.ts doit exporter un schéma par défaut (export default).");
    }

    return mod.default;
};
