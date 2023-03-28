import { Builtins, Cli } from 'clipanion';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GenerateCommand } from './commands/sort-jsonc';

const [_node, _app, ...args] = process.argv;
const esmRequire = createRequire(import.meta.url);
const cliDir = path.dirname(fileURLToPath(import.meta.url));
const packageJson = esmRequire(path.resolve(path.dirname(cliDir), './package.json'));

const cli = new Cli({
  binaryLabel: packageJson.name,
  binaryVersion: packageJson.version,
  binaryName: 'sort-jsonc',
});

cli.register(GenerateCommand);
cli.register(Builtins.HelpCommand);

cli.runExit(args);
