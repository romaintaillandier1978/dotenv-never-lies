import { booleanRule } from "./rules/boolean.js";
import { durationRule } from "./rules/duration.js";
import { jsonRule } from "./rules/json.js";
import { listRule } from "./rules/list.js";
import { portRule } from "./rules/port.js";
import { emailRule, numberRule, stringRule } from "./rules/basic.js";
import { urlRule } from "./rules/url.js";
import { ipRule } from "./rules/ip.js";
import { versionRule } from "./rules/version.js";
import { CrossRule, InferRule } from "./rules.types.js";
import { keyValueRule } from "./rules/key-value.js";
import { secretVsNonStringRule } from "./cross-rules/secret-non-string.js";
import { ReadonlyDeep } from "type-fest";

// ⚠️ Règle d’or :
// JSON avant list,
// port avant number
// duration avant number,

export const RULES: ReadonlyDeep<InferRule[]> = [
    jsonRule, // 10
    listRule, // 7
    portRule, //7
    durationRule, // 6
    booleanRule, // 6
    ipRule, // 5.5
    versionRule, // 5
    urlRule, // 5
    emailRule, // 4
    keyValueRule, // 3.5
    numberRule, // 3

    stringRule, // 0 = fallback
].sort((a, b) => b.meta.priority - a.meta.priority);

// WARNING see additionnal rules list in rules/list.ts and rules/key-value.ts

export const CROSS_RULES: CrossRule[] = [secretVsNonStringRule];
