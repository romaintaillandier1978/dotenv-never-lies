import { InferPreset } from "./presets.types.js"
import { cookieParserPreset } from "./presets/cookie-parser.js"
import { cronPreset } from "./presets/cron.js"
import { expressSessionPreset } from "./presets/express-session.js"
import { googleMapsPreset } from "./presets/google-maps.js"
import { jsonwebtokenPreset } from "./presets/jsonwebtoken.js"
import { nodePreset } from "./presets/node.js"
import { nodemailerPreset } from "./presets/nodemailer.js"
import { prismaPreset } from "./presets/prisma.js"
import { stripePreset } from "./presets/stripe.js"
import { typeormPreset } from "./presets/typeorm.js"
import { vitestPreset } from "./presets/vitest.js"

export const presetRegistry: Map<string, InferPreset> = new Map();

presetRegistry.set(cookieParserPreset.origin, cookieParserPreset);
presetRegistry.set(cronPreset.origin, cronPreset);
presetRegistry.set(expressSessionPreset.origin, expressSessionPreset);
presetRegistry.set(googleMapsPreset.origin, googleMapsPreset);
presetRegistry.set(jsonwebtokenPreset.origin, jsonwebtokenPreset);
presetRegistry.set(nodePreset.origin, nodePreset);
presetRegistry.set(nodemailerPreset.origin, nodemailerPreset);
presetRegistry.set(prismaPreset.origin, prismaPreset);
presetRegistry.set(stripePreset.origin, stripePreset);
presetRegistry.set(typeormPreset.origin, typeormPreset);
presetRegistry.set(vitestPreset.origin, vitestPreset);

