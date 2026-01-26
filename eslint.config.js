import js from "@eslint/js";
import { configs } from "typescript-eslint";

export default [
    js.configs.recommended,
    ...configs.recommended,
    {
        rules: {
            "no-console": "off",
        },
    },
    {
        languageOptions: {
            globals: {
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                global: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly",
            },
        },
    },
    {
        ignores: ["node_modules", "dist", "build", "package/dist"],
    },
];
