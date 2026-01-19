import { GeneratedSchema } from "../rules.types.js";

export const zUnknownGenSchema: GeneratedSchema<"unknown"> = {
    kind: "unknown",
    code: "z.unknown()",
    imports: [],
};
export const zArrayOfUnknownGenSchema: GeneratedSchema<"array"> = {
    kind: "array",
    code: "z.array(z.unknown())",
    imports: [],
};

export const zUrlGenSchema: GeneratedSchema<"url"> = {
    kind: "url",
    code: "z.url()",
    imports: [],
};

export const zStringGenSchema: GeneratedSchema<"string"> = {
    kind: "string",
    code: "z.string()",
    imports: [],
};

export const zNumberGenSchema: GeneratedSchema<"number"> = {
    kind: "number",
    code: "z.coerce.number()",
    imports: [],
};

export const zEmailGenSchema: GeneratedSchema<"email"> = {
    kind: "email",
    code: "z.email()",
    imports: [],
};
