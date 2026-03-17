# Export plugins for `dnl export`

The `dnl export` command relies on a plugin system called _exporters_. An exporter is a JavaScript or TypeScript module that can transform variables validated by DNL into a specific format.

Built-in exporters cover the most common use cases (`.env` files, Docker, GitHub Actions, GitLab CI, Kubernetes, JSON, TypeScript). You can also add your own formats without modifying the core of the project.

The mechanism is based on automatic discovery of plugins installed in the project.

## Plugin resolution and override behavior

Exporters are identified by their `name`, which corresponds to the `<format>` used in the CLI:

When multiple exporters share the same name, DNL applies a deterministic override strategy based on loading order.

Exporters are loaded in the following order:

1. Built-in exporters (internal to DNL)
2. Exporters from project dependencies
3. Exporters declared in the project's own `package.json`

**If multiple exporters share the same name, the last one loaded wins.**

In practice, this means:

- A project exporter overrides exporters from dependencies
- A dependency exporter overrides built-in exporters

When an override occurs, DNL prints a warning in the console.

This behavior allows you to customize or replace existing exporters without modifying the DNL core.

## Declaring exporters in package.json

When running `dnl export`, DNL inspects the project's `package.json` and then those of its dependencies. If a package declares a `dnl` section, the paths listed are loaded as exporters.

A plugin can declare a single exporter:

```json
{
    "name": "my-dnl-export-plugin",
    "dnl": {
        "export": "./dist/my-exporter.js"
    }
}
```

It is also possible to declare several:

```json
{
    "name": "my-dnl-export-plugin",
    "dnl": {
        "exports": ["./dist/exporter-a.js", "./dist/exporter-b.js"]
    }
}
```

Each exported file must provide an object describing the exporter.

## Complete example

The project includes a complete, documented exporter example at:

```
src/sample/sample-exporter.ts
```

This example shows how to:

- declare an exporter
- add CLI-specific options
- use core utilities (`getSource`, `getRawValue`)
- handle common options (`includeComments`, `excludeSecret`, etc.)
- produce the final content returned by the export

If you want to create your own exporter, the simplest approach is to copy this file and adapt the main function to your target format.

An exporter is intentionally simple: variables are already loaded and validated by DNL. The plugin's role is only to transform these values into a format usable by another tool (Docker, CI, Kubernetes, shell scripts, etc.).

Thanks to this system, you can easily add export formats suited to specific environments without modifying the DNL core.
