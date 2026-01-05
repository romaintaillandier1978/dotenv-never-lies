import { ExportError } from "../../errors.js";
import fs from "node:fs";

export const toFile = async (content: string, path: string, force: boolean = false): Promise<void> => {
    if (fs.existsSync(path) && !force) {
        throw new ExportError(`${path} already exists. Use --force to overwrite.`);
    }
    fs.writeFileSync(path, content);
};
