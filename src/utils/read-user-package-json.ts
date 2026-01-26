import fs from "node:fs";
import path from "node:path";
import type { PackageJson } from "type-fest";
import { DnlConfig, dnlConfigSchema } from "../dnl-config.js";

export const readUserPackageJson = (): PackageJson | null => {
    // Do not create a cached singleton !
    // We need to read the package.json file each time, to get the latest version.
    // The user may be tweaking their package.json to make the best dnl inference possible. => no cached singleton !
    const pkgPath = path.resolve(process.cwd(), "package.json");
    try {
        const content = fs.readFileSync(pkgPath, "utf8");
        return JSON.parse(content) as PackageJson;
    } catch {
        return null;
    }
};

export const readDnlConfigInUserPackageJson = (): DnlConfig | null => {
    const pkg = readUserPackageJson();
    if (!pkg) return null;
    const dnlConfig = pkg["dotenv-never-lies"];
    const parsed = dnlConfigSchema.safeParse(dnlConfig);
    if (parsed.success) return parsed.data;
    return null;
};
