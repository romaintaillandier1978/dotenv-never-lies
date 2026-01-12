import { looksLikePath, looksLikeFilename, looksLikeFilePath } from "../schemas/path.js";
import { looksLikeUrl } from "../schemas/urls.js";
import { InferencePass, matchesEnvKey } from "./index.js";

const FILE_KEYS = ["_FILE", "_CERT", "_KEY", "_PATH"];

export const filePathRule: InferencePass = {
    type: "filePath",
    priority: 4,
    threshold: 4,

    tryInfer({ name, rawValue }) {
        if (!looksLikeFilePath(rawValue)) return null;
        if (looksLikeUrl(rawValue)) return null;
        let confidence = 4;
        const reasons: string[] = ["Value looks like a file path (+4)"];

        const { matched, reason } = matchesEnvKey(name, FILE_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            schema: `filePathSchema(${JSON.stringify(name)})`,
            importedSchemas: ["filePathSchema"],
            confidence,
            reasons,
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
        if (looksLikeUrl(rawValue)) return null;
        let confidence = 4;
        const reasons: string[] = ["Value looks like a directory path (+4)"];

        const { matched, reason } = matchesEnvKey(name, PATH_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            schema: `pathSchema(${JSON.stringify(name)})`,
            importedSchemas: ["pathSchema"],
            confidence,
            reasons,
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
        const reasons: string[] = ["Value looks like a filename (+4)"];
        const { matched, reason } = matchesEnvKey(name, FILENAME_KEYS);
        if (matched) {
            confidence += 1;
            reasons.push(`${reason} (+1)`);
        }

        return {
            schema: `filenameSchema(${JSON.stringify(name)})`,
            importedSchemas: ["filenameSchema"],
            confidence,
            reasons,
        };
    },
};
