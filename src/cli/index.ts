#!/usr/bin/env node

import { program } from "commander";
import { assertCommand } from "./commands/assert.js";
import { generateCommand } from "./commands/generate.js";
import dnl from "../index.js";
import { reverseEnvCommand } from "./commands/reverseEnv.js";
import { explainCommand } from "./commands/explain.js";

program
    .name("dnl")
    .version("0.1.0")
    .addHelpText(
        "before",
        `
CLI pour dotenv-never-lies.
Valide, charge et génère des variables d’environnement typées à partir d’un schéma TypeScript/Zod.
      `
    )
    .addHelpText(
        "after",
        `\nExemples :
        
        # Vérifier l’environnement à l’exécution et arrêter le process si le schéma n’est pas respecté
        dnl assert 
        dnl assert --schema env.dnl.ts
      
        # Générer un fichier .env documenté à partir du schéma
        dnl generate 
        dnl generate --schema env.dnl.ts --out .env
      
        # Créer un schéma env.dnl.ts depuis un .env existant
        dnl reverse-env --source .env
      
        # Afficher les variables connues et leur description
        dnl explain
      `
    );

program
    .command("assert")
    .description("Vérifie l’environnement runtime et termine le process si le schéma n’est pas respecté.")
    .option("--schema <file>", "Fichier de schéma dnl (ex: my-dnl.ts)", "env.dnl.ts")
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

program
    .command("generate")
    .description(
        "Génère un fichier .env à partir d’un schéma dnl.\n" +
            "Utile pour initialiser un projet ou faciliter l’onboarding d’un nouveau développeur.\n" +
            "Seules les valeurs définies par défaut dans le schéma sont écrites."
    )
    .option("--schema <file>", "Fichier de schéma env (ex: env.dnl.ts)")
    .option("-o, --out <file>", "Fichier de sortie (défaut : .env)")
    .option("-f, --force", "Écraser le fichier existant")
    .action(generateCommand)
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
    .action(reverseEnvCommand)
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

program
    .command("explain")
    .description("Affiche la liste des variables d’environnement connues et leur description.")
    .argument("[keys...]", "Clés à expliquer (0..N). Sans argument, toutes les clés.")
    .option("--schema <file>", "Fichier de schéma env (ex: env.dnl.ts)")
    .option("-f, --format <format>", 'Format d\'affichage ("human" | "json")', "human")
    .action(async (keys: string[] | undefined, opts: { schema?: string | undefined; format?: "human" | "json" | undefined }) => {
        const result = await explainCommand({ keys: keys ?? [], schema: opts.schema, format: opts.format });
        process.exit(result);
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
        dnl explain --schema another-env.ts
       
        # expliquer une partie des variables connues et leur description
        dnl explain NODE_ENV NODE_PORT 
        
      `
    );
program.parse(process.argv);
