#!/usr/bin/env node

import { program } from "commander";
import { checkCommand } from "./commands/check.js";
import { printCommand } from "./commands/help.js";
import { loadCommand } from "./commands/load.js";
import { generateCommand } from "./commands/generate.js";
import dnl from "../index.js";
import { reverseEnvCommand } from "./commands/reverseEnv.js";
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
        `
      Exemples :
        # Valider un fichier .env sans le charger
        dnl check --schema env.dnl.ts
      
        # Charger les variables dans le process (usage runtime)
        dnl load --schema env.dnl.ts
      
        # Générer un fichier .env à partir du schéma
        dnl generate --schema env.dnl.ts --out .env
      
        # Créer un schéma env.dnl.ts depuis un .env existant
        dnl reverse-env --source .env
      
        # Afficher les variables connues et leur description
        dnl print
      `
    );

program
    .command("check")
    .description("Valide un fichier d’environnement sans le charger dans le process.")
    .addHelpText(
        "after",
        `
      des trucs spécifiques à check
      `
    )
    .option("--schema <file>", "Fichier de schéma env (par défaut : env.dnl.ts)")
    .option("-s, --source <source>", "Source des variables (défaut : process.env)")
    .action(checkCommand);

program
    .command("load")
    .description("Valide et charge les variables d’environnement dans le process.")
    .option("--schema <file>", "Fichier de schéma env (ex: env.dnl.ts)")
    .option("-s, --source <source>", "Source des variables (défaut : process.env)")
    .action(loadCommand);

program
    .command("generate")
    .description("Génère un fichier .env à partir d’un schéma dotenv-never-lies.")
    .option("--schema <file>", "Fichier de schéma env (ex: env.dnl.ts)")
    .option("-o, --out <file>", "Fichier de sortie (défaut : .env)")
    .option("-f, --force", "Écraser le fichier existant")
    .option("--include-secret", "Inclure les variables marquées comme secrètes")
    .action(generateCommand);

program
    .command("reverse-env")
    .description("Génère un schéma env.dnl.ts à partir d’un fichier .env existant.")
    .requiredOption("--source <source>", "Fichier .env source")
    .option("-o, --out <file>", "Fichier de sortie (défaut : env.dnl.ts)")
    .option("-f, --force", "Écraser le fichier existant")
    .option("--guess-secret", "Tenter de deviner les variables secrètes")
    .action(reverseEnvCommand);

program
    .command("print")
    .option("-s, --schema <file>", "Fichier de schéma env (ex: env.dnl.ts)")
    .description("Affiche la liste des variables d’environnement connues et leur description.")
    .action(printCommand);

program.parse(process.argv);
