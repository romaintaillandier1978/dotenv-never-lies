import fs from "node:fs";
import path from "node:path";
import { SchemaNotFoundError } from "../../errors.js";
import type { PackageJson } from "type-fest";

const CANDIDATES = ["env.dnl.ts", "env.dnl.js", "dnl.config.ts", "dnl.config.js"];

// TODO : regarde l'extensibilité de ce package JSON pour les trucs persos.
export type PackageJsonDotenvNeverLies = PackageJson["dotenv-never-lies"] & {
    schema: string;
};

export const resolveSchemaPath = (cliPath?: string): string => {
    // 1. --schema
    if (cliPath) {
        const full = path.resolve(process.cwd(), cliPath);
        if (!fs.existsSync(full)) {
            throw new SchemaNotFoundError(`Schema file not found: ${cliPath}`);
        }
        return full;
    }

    // 2. package.json
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as PackageJson;
        const schema = (pkg?.["dotenv-never-lies"] as PackageJsonDotenvNeverLies | undefined)?.schema;
        if (schema) {
            return path.resolve(process.cwd(), schema);
        }
    }

    // 3. convention
    for (const file of CANDIDATES) {
        const full = path.resolve(process.cwd(), file);
        if (fs.existsSync(full)) {
            return full;
        }
    }

    throw new SchemaNotFoundError("No env schema found. Use --schema, define dotenv-never-lies.schema in package.json, or add env.dnl.ts");
};
