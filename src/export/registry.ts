import { DnlExporter } from "./export.types.js";
import { createRequire } from "node:module";
import { readPackageJson } from "../utils/read-user-package-json.js";
import path from "node:path";
import fs from "node:fs";
import { PackageJson } from "type-fest";

const require = createRequire(import.meta.url);

/**
 * internal, do not use for your own exporters.
 * Map of registered exporters.
 */
const exporters = new Map<string, DnlExporter>();

/**
 * Register an exporter.
 * @param exp - The exporter to register.
 */

export function registerExporter(exp: DnlExporter) {
    const existing = exporters.get(exp.name);

    if (existing) {
        console.warn(`[dnl] Exporter "${exp.name}" overridden\n`);
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

export type PackageJsonWithDnlExports = PackageJson & {
    dnl?: { export?: string; exports?: string[] };
};

const loadExportsFromPackageJson = (pkg: PackageJsonWithDnlExports | null) => {
    if (!pkg) return [];
    const exportsList: string[] = [];
    if (pkg.dnl?.export) {
        exportsList.push(pkg.dnl.export);
    }
    if (pkg.dnl?.exports) {
        exportsList.push(...pkg.dnl.exports);
    }
    return exportsList;
};

async function loadExporterFromPath(pluginPath: string, source: string) {
    const before = exporters.size;
    let exporter: DnlExporter | undefined;
    try {
        const mod = await import(pluginPath);
        exporter = mod.default;
    } catch (err) {
        console.warn(`[dnl] Failed to load exporter plugin "${source}":`, err);
        return;
    }
    if (exporters.size === before) {
        console.warn(`[dnl] Plugin "${exporter?.name}" did not register any new exporter (might have failed or overridden another exporter = false positive).`);
    }
}

export const loaderExporters = async () => {
    if (pluginsLoaded) {
        return exporters;
    }
    // A ce stade, tous les exporters internes sont déjà chargés.

    const pkg = readPackageJson() as PackageJsonWithDnlExports;

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

        const depPkg = readPackageJson(pkgPath) as PackageJsonWithDnlExports;
        const depExports = loadExportsFromPackageJson(depPkg);

        for (const exp of depExports) {
            const pluginPath = path.resolve(path.dirname(pkgPath), exp);
            await loadExporterFromPath(pluginPath, dep);
        }
    }

    // A ce stade tous les exporters des deps ont été chargés.

    const rootExports = loadExportsFromPackageJson(pkg);

    for (const exp of rootExports) {
        const pluginPath = path.resolve(process.cwd(), exp);
        await loadExporterFromPath(pluginPath, "userProject");
    }

    // A ce stade tous les exporters du projet utilisateur ont été chargés.

    pluginsLoaded = true;
    return exporters;
};
