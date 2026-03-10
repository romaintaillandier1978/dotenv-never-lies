import { ExportCliOptions } from "../cli/commands/export.js";
import { EnvDefinitionHelper } from "../core.js";
import { EnvDefinition } from "../core.js";
import { createRequire } from "node:module";
import { readPackageJson } from "../utils/read-user-package-json.js";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);

export interface DnlExporter {
    name: string;
    description?: string;
    run(envDef: EnvDefinitionHelper<EnvDefinition>, options: ExportCliOptions, warnings: string[]): string;
}

const exporters = new Map<string, DnlExporter>();

export function registerExporter(exp: DnlExporter) {
    if (exporters.has(exp.name)) {
        throw new Error(`Exporter ${exp.name} already registered`);
    }
    exporters.set(exp.name, exp);
}

export function getExporter(name: string): DnlExporter | undefined {
    return exporters.get(name);
}

export function listExporters(): string[] {
    return [...exporters.keys()];
}

// Singleton : should not load multiple times
let pluginsLoaded = false;

export const loaderExporters = async () => {
    if (pluginsLoaded) {
        console.log("exportersalready loaded ", JSON.stringify(exporters, null, 2));
        return exporters;
    }
    const pkg = readPackageJson();
    const deps = [
        ...(pkg?.dependencies ? Object.keys(pkg.dependencies as Record<string, string>) : []),
        ...(pkg?.devDependencies ? Object.keys(pkg.devDependencies as Record<string, string>) : []),
        ...(pkg?.optionalDependencies ? Object.keys(pkg.optionalDependencies) : []),
    ];
    for (const dep of deps) {
        let entry: string;

        try {
            entry = require.resolve(dep, { paths: [process.cwd()] });
        } catch {
            continue;
        }

        let dir = path.dirname(entry);
        let pkgPath: string | undefined;

        while (dir !== path.dirname(dir)) {
            const candidate = path.join(dir, "package.json");
            if (fs.existsSync(candidate)) {
                pkgPath = candidate;
                break;
            }
            dir = path.dirname(dir);
        }

        if (!pkgPath) continue;

        const depPkg = readPackageJson(pkgPath) as {
            dnl?: { export?: string };
        };

        if (depPkg.dnl?.export) {
            const pluginPath = path.resolve(path.dirname(pkgPath), depPkg.dnl.export);
            const plugin = await import(pluginPath);
            registerExporter(plugin.default ?? plugin);
            console.debug(`DNL exporter plugin loaded: ${dep}`);
        }
    }
    pluginsLoaded = true;
    return exporters;
};
