import { z } from "zod";
declare const _default: import("dotenv-never-lies").EnvDefinitionHelper<{
    FRONT_BO: {
        schema: z.ZodOptional<z.ZodURL>;
        description: string;
    };
    NODE_CORS_ORIGIN: {
        schema: z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>;
        description: string;
    };
}>;
export default _default;
//# sourceMappingURL=env.dnl.d.ts.map