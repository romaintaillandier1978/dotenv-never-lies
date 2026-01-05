#!/usr/bin/env node

import { program, CommanderError } from "commander";
import { assertCommand } from "./commands/assert.js";
import { GenerateCliOptions, generateCommand } from "./commands/generate.js";
import { ReverseEnvCliOptions, reverseEnvCommand } from "./commands/reverseEnv.js";
import { explainCommand, printHuman } from "./commands/explain.js";
import { ExportCliOptions, exportCommand, ExportFormat } from "./commands/export.js";
import { toFile } from "./utils/toFile.js";
import { DnlError, ExitCodes, ValidationError } from "../errors.js";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../../package.json") as { version: string };

const exitCodeHelp: { [key in ExitCodes]: string } = {
    [ExitCodes.success]: "Succès (tout est valide, sortie OK)",
    [ExitCodes.usageError]: "Erreur d’usage ou erreur système",
    [ExitCodes.schemaNotFound]: "Schéma DNL introuvable ou non résolu",
    [ExitCodes.validationError]: "Validation échouée (env invalide)",
    [ExitCodes.exportError]: "Erreur d’export (format, écriture fichier, secret, etc.)",
} as const;

// #region Program
program
    .name("dnl")
    //.version("0.3.0")
    .version(packageJson.version)
    // permet de passer des arguments positionnels, avant / après les options
    .enablePositionalOptions()
    .exitOverride()
    .addHelpText(
        "before",
        `Résumé :
  CLI pour dotenv-never-lies.
  Valide les variables d’environnement typées à partir d’un schéma TypeScript/Zod.
      `
    )
    .option("--schema <file>", "Fichier de schéma dnl (ex: path/to/my-dnl.ts). Voir la section Schéma d’environnement pour plus de détails.")
    .addHelpText(
        "after",
        `\nExit codes :\n${Object.entries(exitCodeHelp)
            .map(([key, value]) => `  - ${key}: ${value}`)
            .join("\n")}
        `
    )
    .addHelpText(
        "after",
        `\nSchéma d’environnement :
  Le schéma dotenv-never-lies est résolu dans l’ordre suivant :
  1. Option --schema si fournie
  2. Clé "dotenv-never-lies.schema" dans package.json
  3. Fichiers par convention :
    - env.dnl.ts
    - env.dnl.js
    - dnl.config.ts
    - dnl.config.js
  Si aucun schéma n’est trouvé, la commande échoue.
        `
    )
    .addHelpText(
        "after",
        `\nExemples :
        
  # Vérifier l’environnement à l’exécution et arrêter le process si le schéma n’est pas respecté
  dnl assert 
  dnl assert --schema my-dnl.ts
  
  # Générer un fichier .env documenté à partir du schéma
  dnl generate 
  dnl generate --schema my-dnl.ts --out .env
  
  # Créer un schéma env.dnl.ts depuis un .env existant
  dnl reverse-env --source .env
  
  # Afficher les variables connues et leur description
  dnl explain

  # Exporter les variables au format docker-args
  dnl export docker-args --source .env
  
    `
    );
// #endregion Program

// #region assert
program
    .command("assert")
    .description("Vérifie l’environnement runtime et termine le process si le schéma n’est pas respecté.")
    .option("-s, --source <source>", "Source des variables (défaut : process.env)")
    .action(assertCommand)
    .addHelpText(
        "after",
        `\nExemples :
        
  # Valider les variables d’environnement de process.env
  # Recommandé en CI pour empêcher un démarrage avec une configuration invalide
  dnl assert
  dnl assert --schema my-dnl.ts
  
  # Valider les variables d’environnement depuis un fichier .env
  # Recommandé en local (préparation du schéma, onboarding)
  dnl assert --source .env
  dnl assert --schema my-dnl.ts --source .env
  
  # valider les variables d'environnement du fichier fourni par la CI
  dnl assert --source $ENV_FILE
  dnl assert --schema my-dnl.ts --source $ENV_FILE
      `
    );
// #endregion assert

// #region export
const exportHelp: { [key in ExportFormat]: string } = {
    "docker-args": "Arguments `--env KEY=VALUE` pour `docker run`",
    "docker-env": "Fichier compatible `--env-file` Docker",
    "github-env": "Injection dans l’environnement d’un job GitHub Actions",
    "github-secret": "Secrets GitHub via gh CLI (repo ou organisation)",
    "gitlab-env": "Variables d’environnement GitLab CI",
    "k8s-configmap": "ConfigMap Kubernetes (variables NON sensibles)",
    "k8s-secret": "Secret Kubernetes (variables sensibles uniquement)",
    env: "Fichier .env nettoyé (sans commentaires inutiles)",
    json: "Objet JSON clé/valeur",
    ts: "Objet TypeScript typé",
    js: "Objet JavaScript",
} as const;

program
    .command("export")
    .description("Exporte les variables d'environnement dans un format spécifié")
    .argument("<format>", "Format d'exportation. Voir liste et exemples à la fin")
    .option("-s, --source <source>", "Source des variables (sans source process.env sera utilisé)")
    .option("--hide-secret", 'Masquer les variables sensibles (rempalcer par "********")')
    .option("--exclude-secret", "Exclure les variables sensibles (ne pas les montrer du tout)")
    .option("--include-comments", "Inclure les commentaires dans l'exportation (ne fonctionne pas avec le format json)")
    .option("-o, --out <file>", "Fichier de sortie")
    .option("-f,--force", "Écraser le fichier existant, en conjonction avec l'option -o ou --out")
    .option("--k8s-name <name>", "Nom du secret k8s default: env-secret pour le format k8s-secret, env-config pour le format k8s-configmap")
    .option("--github-org <org>", "Nom de l'organisation github")
    .action(async (opts: ExportCliOptions) => {
        const { content, warnings, out } = await exportCommand(opts);

        if (out) {
            await toFile(content, out, opts.force ?? false);
        } else {
            console.log(content);
        }
        for (const warning of warnings) {
            console.error(`${warning}`);
        }
    })
    .addHelpText(
        "after",
        `\nFormats d'exportation :\n${Object.entries(exportHelp)
            .map(([key, value]) => `  - ${key}: ${value}`)
            .join("\n")}
        `
    )
    .addHelpText(
        "after",
        `\nExemples :
      
  # --- Cas simples ----------------------------------------------------
  
  # Exporter les variables d'environnement au format JSON depuis un fichier .env
  dnl export json --source .env
  
  # Nettoyer un fichier .env (retirer commentaires et lignes inutiles)
  dnl export env --source .env --out .env.clean
  dnl export env --source .env -fo .env
  
  
  # --- Docker / CI ----------------------------------------------------
  
  # Exporter les variables au format docker-args
  dnl export docker-args --source .env
  
  # Exemple concret en CI pour lancer un conteneur Docker
  # (les variables sont injectées dynamiquement)
  docker run \\
    $(dnl export docker-args --source $DOTENV_FILE) \\
    --restart always \\
    -d my-image:latest
  
  
  # --- GitHub Actions -------------------------------------------------
  
  # Exporter les variables comme secrets GitHub (repo courant)
  # Nécessite gh CLI configuré (gh auth login)
  dnl export github-secret
  
  # Exporter les variables comme secrets d'une organisation GitHub
  dnl export github-secret --github-org my-org
  
  # Exemple d'usage dans un job GitHub Actions :
  # (les variables sont injectées dans l'environnement du job)
  dnl export github-env >> $GITHUB_ENV
  
  
  # --- Kubernetes -----------------------------------------------------
  
  # Générer un ConfigMap Kubernetes (variables NON sensibles)
  dnl export k8s-configmap --out k8s-configmap.yaml
  
  # Générer un Secret Kubernetes à partir d'un fichier .env
  dnl export k8s-secret --source .env --k8s-name my-secret --out k8s-secret.yaml
  
  # Appliquer les fichiers générés
  kubectl apply -f k8s-configmap.yaml
  kubectl apply -f k8s-secret.yaml
  
  # attention : si aucun secret n'est présent dans la config dnl, pour k8s-secret, la sortie sera vide
  
  # --- TypeScript / JavaScript ---------------------------------------
  
  # Exporter les variables sous forme d'objet TypeScript typé, ou js
  dnl export ts --out env.generated.ts
  dnl export js --out env.generated.js
  `
    );
// #endregion export

// #region generate
program
    .command("generate")
    .description(
        "Génère un fichier .env à partir d’un schéma dnl.\n" +
            "Utile pour initialiser un projet ou faciliter l’onboarding d’un nouveau développeur.\n" +
            "Seules les valeurs définies par défaut dans le schéma sont écrites."
    )
    .option("-o, --out <file>", "Fichier de sortie (défaut : .env)")
    .option("-f, --force", "Écraser le fichier existant")
    .action(async (opts: GenerateCliOptions) => {
        const { content, out } = await generateCommand(opts);
        await toFile(content, out, opts.force ?? false);
    })
    .addHelpText(
        "after",
        `\nExemples :
        
  # Générer un fichier .env à partir du schéma par défaut (env.dnl.ts)
  dnl generate
  
  # Générer un fichier .env à partir d'un schéma spécifié
  dnl generate --schema my-dnl.ts
  
  # Générer un fichier .env.local à partir du schéma
  dnl generate --out .env.local
  
  # Générer un fichier .env à partir d'un schéma et écraser le fichier existant
  dnl generate --out .env --force
      `
    );
// #endregion generate

// #region reverse-env
program
    .command("reverse-env")
    .description(
        "Génère un schéma dotenv-never-lies à partir d’un fichier .env.\n" +
            "Utile pour migrer un projet existant vers dotenv-never-lies.\n" +
            "Le schéma généré est un point de départ et doit être affiné manuellement."
    )
    .option("-s, --source <source>", "Fichier .env source", ".env")
    .option("-o, --out <file>", "Fichier dnl de sortie", "env.dnl.ts")
    .option("-f, --force", "Écraser le fichier existant")
    .option("--guess-secret", "Tenter de deviner les variables sensibles (heuristique)")
    .action(async (opts: ReverseEnvCliOptions) => {
        const { content, out, warnings } = await reverseEnvCommand(opts);

        await toFile(content, out, opts.force ?? false);
        for (const warning of warnings) {
            console.error(`${warning}`);
        }
    })
    .addHelpText(
        "after",
        `\nExemples :
        
  # Générer un schéma env.dnl.ts à partir d'un fichier .env
  dnl reverse-env
  
  # Générer un schéma env.dnl.ts à partir d'un fichier .env.local
  dnl reverse-env --source .env.local
  
  # Générer un schéma my-dnl.ts à partir d'un fichier .env
  dnl reverse-env --out my-dnl.ts
  
  # Générer un schéma env.dnl.ts à partir d'un fichier .env et écraser le fichier existant
  dnl reverse-env --force
  `
    );
// #endregion reverse-env

// #region explain
program
    .command("explain")
    .description("Affiche la liste des variables d’environnement connues et leur description.")
    .argument("[keys...]", "Clés à expliquer (0..N). Sans argument, toutes les clés.")
    .option("-f, --format <format>", 'Format d\'affichage ("human" | "json")', "human")
    .action(async (keys: string[] | undefined, opts: { schema?: string | undefined; format?: "human" | "json" | undefined }) => {
        const { format, result } = await explainCommand({ keys: keys ?? [], schema: opts.schema, format: opts.format });
        if (format === "human") {
            printHuman(result);
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
    })
    .addHelpText(
        "after",
        `\nExemples :
        
  # expliquer toutes les variables connues et leur description
  dnl explain
  
  # expliquer une variable en détail
  dnl explain NODE_ENV
  
  # sortie machine
  dnl explain --format json
  
  # expliquer toutes les variables connues et leur description à partir d'un schéma
  dnl explain --schema my-dnl.ts
  
  # expliquer une partie des variables connues et leur description
  dnl explain NODE_ENV NODE_PORT 
        
      `
    );
// #endregion explain

try {
    await program.parseAsync(process.argv);
    process.exit(ExitCodes.success);
} catch (err: unknown) {
    // Commander lève une erreur contrôlée lorsque l'aide ou la version sont affichées
    if (err instanceof CommanderError) {
        if (err.code === "commander.helpDisplayed" || err.code === "commander.version") {
            process.exit(ExitCodes.success);
        }
        process.exit(typeof err.exitCode === "number" ? err.exitCode : ExitCodes.usageError);
    }
    if (err instanceof ValidationError) {
        console.error("❌ Invalid environment variables:\n");

        for (const issue of err.issues ?? []) {
            console.error(`- ${issue.key}`);
            console.error(`  → ${issue.message}`);
        }

        process.exit(err.exitCode);
    }
    if (err instanceof DnlError) {
        console.error(err.message);
        process.exit(err.exitCode);
    }

    console.error("Erreur inattendue");
    console.error(err);
    process.exit(ExitCodes.usageError);
}
