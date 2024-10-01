# sort-jsonc monorepo

Mini-monorepo for `sort-jsonc` and `sort-jsonc-cli`.

## Packages

| Package                                       | Version                                                                                                 | Description                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [`sort-jsonc`](./packages/sort-jsonc)         | [![npm](https://img.shields.io/npm/v/sort-jsonc.svg)](https://www.npmjs.com/package/sort-jsonc)         | Sort JSONC without mangling comments! |
| [`sort-jsonc-cli`](./packages/sort-jsonc-cli) | [![npm](https://img.shields.io/npm/v/sort-jsonc-cli.svg)](https://www.npmjs.com/package/sort-jsonc-cli) | Use `sort-jsonc` directly via the CLI.      |

## Motivation

Lots of JSON files today are actually JSONC, or "JSON with comments", under the hood. Files like `tsconfig.json` or `.vscode/settings.json`.

Tools for deep-sorting JSON files are common and frequently used, but they tend to either strip, mangle or simply not support comments. I
needed an easy util (and CLI tool) for this specific use case and couldn't find a nice one, so I made these.
