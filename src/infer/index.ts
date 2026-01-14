import { booleanRule } from "./rules/boolean.js";
import { durationRule } from "./rules/duration.js";
import { jsonRule } from "./rules/json.js";
import { keyValueListRule, keyValueRule, listRule } from "./rules/list.js";
import { portRule } from "./rules/port.js";
import { emailRule, numberRule, stringRule } from "./rules/basic.js";
import { urlRule } from "./rules/url.js";
import { ipRule } from "./rules/ip.js";
import { versionRule } from "./rules/version.js";
import { InferRule } from "./types.js";

// ⚠️ Règle d’or :
// JSON avant list,
// duration avant number,
// boolean avant enum,

export const RULES: InferRule[] = [
    jsonRule, // 10
    keyValueListRule, // 9
    keyValueRule, // 8
    listRule, // 7
    portRule, //7
    durationRule, // 6
    booleanRule, // 6
    ipRule, // 5.5
    versionRule, // 5
    urlRule, // 5
    emailRule, // 4
    numberRule, // 3

    stringRule, // 0 = fallback
].sort((a, b) => b.priority - a.priority);

export const LIST_RULES: InferRule[] = [
    portRule, //7
    urlRule, //5
    emailRule, //4
    numberRule, //3
    stringRule, //0
].sort((a, b) => b.priority - a.priority);
