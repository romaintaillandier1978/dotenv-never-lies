import fs from "node:fs";
import path from "node:path";
import { SchemaNotFoundError } from "../../errors.js";
import { PackageJsonWithDnl, dnlConfigSchema } from "../../dnl-config.js";

const CANDIDATES = ["env.dnl.ts", "env.dnl.js", "dnl.config.ts", "dnl.config.js"];

const resolveIfExists = (relativePath: string): string | null => {
    const full = path.resolve(process.cwd(), relativePath);
    return fs.existsSync(full) ? full : null;
};

export const resolveSchemaPath = (cliPath?: string): string => {
    // 1. --schema
    if (cliPath) {
        const resolved = resolveIfExists(cliPath);
        if (resolved) return resolved;
        throw new SchemaNotFoundError(`Schema file not found: ${cliPath}`);
    }

    // 2. package.json
    const pkgPath = path.resolve(process.cwd(), "package.json");
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as PackageJsonWithDnl;
        const dnlConfig = pkg?.["dotenv-never-lies"];
        const parsed = dnlConfigSchema.safeParse(dnlConfig);
        if (parsed.success) {
            const resolved = resolveIfExists(parsed.data.schema);
            if (resolved) return resolved;
        }
    }

    // 3. convention
    for (const file of CANDIDATES) {
        const resolved = resolveIfExists(file);
        if (resolved) return resolved;

    }

    throw new SchemaNotFoundError("No env schema found. Use --schema, define dotenv-never-lies.schema in package.json, or add env.dnl.ts");
};
