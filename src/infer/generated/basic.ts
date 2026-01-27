import { GeneratedSchema } from "../infer.types.js";

export const zUnknownGenSchema: GeneratedSchema<"unknown"> = {
    kind: "unknown",
    code: "z.unknown()",
    imports: [{ name: "z", from: "zod" }],
};
export const zArrayOfUnknownGenSchema: GeneratedSchema<"array"> = {
    kind: "array",
    code: "z.array(z.unknown())",
    imports: [{ name: "z", from: "zod" }],
};

export const zUrlGenSchema: GeneratedSchema<"url"> = {
    kind: "url",
    code: "z.url()",
    imports: [{ name: "z", from: "zod" }],
};

export const zStringGenSchema: GeneratedSchema<"string"> = {
    kind: "string",
    code: "z.string()",
    imports: [{ name: "z", from: "zod" }],
};

export const zNumberGenSchema: GeneratedSchema<"number"> = {
    kind: "number",
    code: "z.coerce.number()",
    imports: [{ name: "z", from: "zod" }],
};

export const zEmailGenSchema: GeneratedSchema<"email"> = {
    kind: "email",
    code: "z.email()",
    imports: [{ name: "z", from: "zod" }],
};
