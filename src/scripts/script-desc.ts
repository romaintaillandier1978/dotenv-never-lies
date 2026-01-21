import { PackageJson } from "type-fest";

import pkg from "../../package.json" with { type: "json" };
export type ScriptsDesc = { [key in keyof PackageJson.Scripts]: string };

export const scriptDesc = (): void => {
    const myPackageJson = pkg as PackageJson;
    const scripts: PackageJson.Scripts | undefined = myPackageJson.scripts;
    const descriptions =
        typeof myPackageJson["scripts-descriptions"] === "object"
            ? (myPackageJson["scripts-descriptions"] as ScriptsDesc)
            : undefined;

    if (!scripts || !descriptions) {
        console.error("No scripts or descriptions found in package.json");
        return;
    }

    Object.keys(scripts).forEach((script: string) => {
        console.log(`yarn ${script}:`);
        if (descriptions[script]) {
            console.log(`    ${scripts[script]}`);
            console.log(`    ${descriptions[script] || "No description available. Please complete the Package.json (scripts-descriptions key)"}`);
        } else console.log(`     \x1b[31m%s\x1b[0m`, "No description available. Please complete the Package.json (scripts-descriptions key)");
        console.log("");
    });
}

// Execute if the script is launched directly
if (import.meta.url === `file://${process.argv[1]}`) {
    scriptDesc();
}
