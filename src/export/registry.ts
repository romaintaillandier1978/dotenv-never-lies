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
    let mod: unknown;
    try {
        mod = await import(pluginPath);
    } catch (err) {
        console.warn(`[dnl] Failed to load exporter plugin "${source}":`, err);
        return;
    }

    const plugin = (mod as { default?: unknown })?.default ?? mod;

    if (!plugin || typeof plugin !== "object") {
        console.warn(`[dnl] Invalid exporter plugin "${source}": module does not export an object.`);
        return;
    }

    if (!("name" in plugin && typeof (plugin as DnlExporter).name === "string" && "run" in plugin && typeof (plugin as DnlExporter).run === "function")) {
        console.warn(`[dnl] Invalid exporter plugin "${source}": missing required fields { name, run }.`);
        return;
    }

    try {
        registerExporter(plugin as DnlExporter);
    } catch (err) {
        console.warn(`[dnl] Failed to register exporter plugin "${source}":`, err);
    }
}

export const loaderExporters = async () => {
    if (pluginsLoaded) {
        return exporters;
    }

    const pkg = readPackageJson() as PackageJsonWithDnlExports;

    const rootExports = loadExportsFromPackageJson(pkg);

    for (const exp of rootExports) {
        const pluginPath = path.resolve(process.cwd(), exp);
        await loadExporterFromPath(pluginPath, "root");
    }

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

    pluginsLoaded = true;
    return exporters;
};
