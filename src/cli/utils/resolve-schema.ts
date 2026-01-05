import fs from "node:fs";
import path from "node:path";
import { SchemaNotFoundError } from "../../errors.js";

const CANDIDATES = ["env.dnl.ts", "env.dnl.js", "dnl.config.ts", "dnl.config.js"];

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
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        const schema = pkg?.["dotenv-never-lies"]?.schema;
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
