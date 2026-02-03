import envDefinition from "./env.dnl.js";
import { Env } from "./types/env.dnl.js";

export const env: Env = envDefinition.assert();
