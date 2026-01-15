import { GeneratedSchema } from "../types.js";

export const zUnknownGenSchema: GeneratedSchema = {
    code: "z.unknown()",
    imports: [],
};
export const zArrayOfUnknownGenSchema: GeneratedSchema = {
    code: "z.array(z.unknown())",
    imports: [],
};

export const zUrlGenSchema: GeneratedSchema = {
    code: "z.url()",
    imports: [],
};

export const zStringGenSchema: GeneratedSchema = {
    code: "z.string()",
    imports: [],
};

export const zNumberGenSchema: GeneratedSchema = {
    code: "z.coerce.number()",
    imports: [],
};

export const zEmailGenSchema: GeneratedSchema = {
    code: "z.email()",
    imports: [],
};
