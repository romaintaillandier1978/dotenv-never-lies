import dnl, { } from "../../index.js";
import { loadDef } from "../utils/load-schema.js";
import { resolveSchemaPath } from "../utils/resolve-schema.js";
import { isRequired } from "../utils/printer.js";
import { ProgramCliOptions } from "./program.js";
import path from "node:path";

export type TypesCliOptions = ProgramCliOptions & {
    out?: string | undefined;
    force?: boolean;
};
export type TypesResult = {
    content: string;
    out: string | undefined;
};

export const typesCommand = async (options: TypesCliOptions): Promise<TypesResult> => {

    const schemaPath = resolveSchemaPath(options?.schema);
    const envDef = (await loadDef(schemaPath)) as dnl.EnvDefinitionHelper<any>;

    const content = exportDts(envDef, options);

    return {
        content,
        out: options.out,
    };
}


export const getSchemaPath = (options: TypesCliOptions): string => {

    const schemaTsPath = resolveSchemaPath(options?.schema);
    const schemaJsPath = schemaTsPath.replace(/\.ts$/, ".js");

    const outFile = options.out ?? "src/types/env.dnl.d.ts";
    const dtsDir = path.dirname(path.resolve(outFile));

    let importPath = path.relative(dtsDir, schemaJsPath);
    if (!importPath.startsWith(".")) importPath = "./" + importPath;
    importPath = importPath.replace(/\\/g, "/");

    return importPath;
}

export const exportDts = (envDef: dnl.EnvDefinitionHelper<any>, options: TypesCliOptions): string => {

    const schemaPath = getSchemaPath(options);
    let top = `import envDefinition from "${schemaPath}";\n`;
    top += `type RuntimeEnv = ReturnType<typeof envDefinition.assert>;\n`;
    top += `export interface Env {\n`;

    const middle: string[] = [];
    for (const key of Object.keys(envDef.def)) {
        const type = `RuntimeEnv["${key}"]`;
        const optional = isRequired(envDef.def[key].schema.def) ? "" : "?";
        const secret = envDef.def[key].secret;
        const required = isRequired(envDef.def[key].schema.def);
        const description = envDef.def[key].description;

        let comment = `    /**\n`;
        if (description) comment += `     * ${description}\n`;
        comment += `     * @env ${key}\n`;
        if (secret) comment += `     * @secret\n`;
        if (required) comment += `     * @required\n`;
        comment += `     */`;
        middle.push(comment);
        middle.push(`    ${key}${optional}: ${type};`);


    }

    return `${top}${middle.join("\n")}\n}\n`;
};