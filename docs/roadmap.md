# Road Map :

## LLM

- générer un document utilisable par l'ia dans le contexte de l'utilisateur
    - dnl export llm => Générer un artefact “LLM-friendly” pour l'outillage utilisateur qui ressemble à env.dnl.ts, pour le llm
    - normaliser / forcer les descriptions dans le schéma. sans desc => hallu
    - marquer les secret encore plus explictement {key:jwt,secret:true,exposed:false}

- rendre DNL facilement utilisable par un LLM : LLM integration Kit
    - créer des fichiers 'explication à destination des llm dans llm-kit
    - faut-il injecter ces fichier dans le projet de l'utilisateur ?
    -

- ne surtout pas faire : créer des prompts intégrés, dépendance a un llm

## Schéma zod spécialisés intégrés : les preset

preset exemples :

- prisma -> DATABASE_URL
- Jest -> NODE_ENV, CI
- Express -> NODE_ENV
- NestJs -> NODE_ENV, PORT
- typeORM -> DATABASE_URL, ou DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- jsonwebtoken -> JWT_SECRET
- Auth0 -> AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
- Docker -> PORT, HOST, NODE_ENV

```typescript
// presets/prisma.ts
export const prismaPreset = {
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),
};

// presets/node.ts
export const nodePreset = {
  NODE_ENV: z.enum(["development", "test", "production"]),
};

inferEnv({
  source: ".env",
  presets: ["node", "prisma"],
});

EnvVarDefinition {
    presetOrigin:{
        inferredFrom?:string|string[]; // PresetName
        resolution: "fusion",
    }
}
```

// En cas de conflit :

```typescript
if (bothSchemasAreEnums) {
    return mergeEnumsByUnion();
}
if (schemasAreCompatiblePrimitives) {
    return normalizeToMostSpecific();
}
warnings.push("Preset inference conflict on NODE_ENV: incompatible schemas, fallback to z.string()");
return z.string();
```

## Extensibilité exporters / preset

- exporters, avec un model, une interface
- preset : dnl infer --preset prisma (inference de truc connu comme DATABASE_URL)

plugin externe, avec résolution des noms de packages dynamiquement :
dans le plugin tiers package.json

```json
{
    "name": "dnl-export-my-format",
    "dnl": {
        "export": "./dist/index.js"
    }
}
```

coté DNL :

```typescript
const pkg = JSON.parse(fs.readFileSync("node_modules/xxx/package.json"));

if (pkg.dnl?.export) {
    const plugin = await import(pkg.dnl.export);
}
```

méthode de découverte :

- trouver le package.json racine
- extraire les dépendances
- parcours les packages.json des deps à la recherche d'entrée dnl.
- charger dynamiquement les plugins, les mettre dans un cache.

```typescript
for (const dep of deps) {
    const pkgPath = require.resolve(`${dep}/package.json`, {
        paths: [projectRoot],
    });

    const depPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

    if (depPkg.dnl?.export) {
        const plugin = await import(path.resolve(pkgDir, depPkg.dnl.export));
    }
}
```

cas foireux : monorepos, pnpm, yarn PnP

=> cli :

```bash
dnl plugin list
```

### preparation des plugin :

s'auto plugin, maintenant.

```typescript

interface DnlPluginMeta {
  unstable?: boolean;
  experimental?: boolean;
  since?: string;          // ex: "0.6.0"
  deprecated?: string;     // message ou version cible
  docsUrl?: string;
}
interface DnlExporter {
  name: string;
  description?: string;
   meta?: DnlPluginMeta;
 run(ctx: ExportContext): Promise<void>;
}

interface ExportContext {
  schema: DnlSchema;
  values: Record<string, unknown>;
  source: "env" | "process";
  logger: Logger;
}
const exporters = new Map<string, DnlExporter>();

export function registerExporter(exp: DnlExporter) {
  exporters.set(exp.name, exp);
}

export const dockerExporter: DnlExporter = { ... }
export const githubExporter: DnlExporter = { ... }
export const jsonExporter: DnlExporter = { ... }

registerExporter(jsonExporter);
registerExporter(dockerExporter);
registerExporter(githubExporter);

```

```diff
- registerExporter(jsonExporter)
+ loadPlugin("json")
```

## extensibilité :

- générators, avec un model, une interface
- génériser EnvVarDefinition avec une propriété générique que DNL n'utilisera jamais. => pas si simple aprce qu'on ne type pas la def metadata dans la déclaration env.dnl.ts
