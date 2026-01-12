import { looksLikePath, looksLikeFilename, looksLikeFilePath } from "../schemas/path.js";
import { InferencePass, matchesEnvKey } from "./index.js";
const FILE_KEYS = ["_FILE", "_CERT", "_KEY", "_PATH"];

export const filePathRule: InferencePass = {
    type: "filePath",
    priority: 4,
    threshold: 4,

    tryInfer({ name, rawValue }) {
        if (!looksLikeFilePath(rawValue)) return null;

        let confidence = 4;

        if (matchesEnvKey(name, FILE_KEYS)) {
            confidence += 1;
        }

        return {
            schema: `filePathSchema(${JSON.stringify(name)})`,
            importedSchema: "filePathSchema",
            confidence,
            reason: "value looks like a file path",
        };
    },
};
const PATH_KEYS = ["_PATH", "_DIR", "_HOME", "_ROOT"];

export const pathRule: InferencePass = {
    type: "path",
    priority: 3,
    threshold: 4,

    tryInfer({ name, rawValue }) {
        if (!looksLikePath(rawValue)) return null;
        if (looksLikeFilePath(rawValue)) return null; // important

        let confidence = 4;

        if (matchesEnvKey(name, PATH_KEYS)) {
            confidence += 1;
        }

        return {
            schema: `pathSchema(${JSON.stringify(name)})`,
            importedSchema: "pathSchema",
            confidence,
            reason: "value looks like a directory path",
        };
    },
};

const FILENAME_KEYS = ["_FILE", "_FILENAME", "_NAME"];

export const filenameRule: InferencePass = {
    type: "filename",
    priority: 2,
    threshold: 4,

    tryInfer({ name, rawValue }) {
        if (!looksLikeFilename(rawValue)) return null;

        let confidence = 4;

        if (matchesEnvKey(name, FILENAME_KEYS)) {
            confidence += 1;
        }

        return {
            schema: `filenameSchema(${JSON.stringify(name)})`,
            importedSchema: "filenameSchema",
            confidence,
            reason: "value looks like a filename",
        };
    },
};
