import { GeneratedSchema } from "../types.js";

export const zUnknownGenSchema: GeneratedSchema = {
    kind: "unknown",
    code: "z.unknown()",
    imports: [],
};
export const zArrayOfUnknownGenSchema: GeneratedSchema = {
    kind: "array",
    code: "z.array(z.unknown())",
    imports: [],
};

export const zUrlGenSchema: GeneratedSchema = {
    kind: "url",
    code: "z.url()",
    imports: [],
};

export const zStringGenSchema: GeneratedSchema = {
    kind: "string",
    code: "z.string()",
    imports: [],
};

export const zNumberGenSchema: GeneratedSchema = {
    kind: "number",
    code: "z.coerce.number()",
    imports: [],
};

export const zEmailGenSchema: GeneratedSchema = {
    kind: "email",
    code: "z.email()",
    imports: [],
};
