import { Command, Option } from 'clipanion';
import { parse, type CommentJSONValue } from 'comment-json';
import fs from 'node:fs';
import path from 'node:path';
import { sortJsonc } from 'sort-jsonc';

export class GenerateCommand extends Command {
  files = Option.Rest({ required: 1 });

  order = Option.String('-o,--order', '', {
    description:
      'The preferred order to sort keys as a comma-separated string. Prioritized over --order-file. Keys not in this list will be sorted alphabetically at the end.',
  });

  orderFile = Option.String('-O,--order-file', '', {
    description:
      'Path to a JSON file containing a list of strings in preferred order. Keys not in this list will be sorted alphabetically at the end.',
  });

  removeComments = Option.Boolean('-c,--remove-comments', false, {
    description: 'Whether to remove comments from the JSON.',
  });

  spaces = Option.String('-S,--spaces', '2', {
    description: 'Number of spaces to indent the JSON.',
  });

  silent = Option.Boolean('-s,--silent', false, {
    description: 'Whether to suppress output.',
  });

  static override usage = Command.Usage({
    description: 'Sorts JSONC files.',
    examples: [
      ['Sort a file', '$0 sort-jsonc path/to/file.jsonc'],
      ['Sort a file with by order', '$0 sort-jsonc path/to/file.jsonc -o name,version,description'],
    ],
  });

  async execute() {
    const sort = this.order || this.orderFile ? await parseOrder(this.order, this.orderFile) : undefined;

    const filesToWrite = await Promise.all(
      this.files.map(async relativePath => {
        const absoluteFilePath = path.resolve(process.cwd(), relativePath);
        const jsoncString = await readTextFile(absoluteFilePath);
        const sortedJsoncString = sortJsonc(jsoncString, {
          sort,
          removeComments: this.removeComments,
          spaces: Number(this.spaces),
        });

        return [absoluteFilePath, sortedJsoncString] as const;
      })
    );

    await Promise.all(filesToWrite.map(([absoluteFilePath, content]) => writeTextFile(absoluteFilePath, content)));

    if (!this.silent) {
      console.log(`Sorted: \n${filesToWrite.map(([absoluteFilePath]) => `- ${absoluteFilePath}`).join('\n')}`);
    }
  }
}

async function readTextFile(partialFilePath: string, cwd = process.cwd()): Promise<string> {
  const absoluteFilePath = path.resolve(cwd, partialFilePath);
  return await fs.promises.readFile(absoluteFilePath, { encoding: 'utf8' });
}

async function writeTextFile(partialFilePath: string, content: string, cwd = process.cwd()): Promise<void> {
  const absoluteFilePath = path.resolve(cwd, partialFilePath);
  return await fs.promises.writeFile(absoluteFilePath, content, { encoding: 'utf8' });
}

async function parseOrder(orderString: string, orderFile: string): Promise<string[]> {
  const order = orderString.split(',').map(key => key.trim());
  const orderSet = new Set([...(order || [])]);

  if (orderFile) {
    let keys: CommentJSONValue[];

    try {
      const orderFileContents = await readTextFile(orderFile);
      if (!orderFileContents) {
        throw new Error('Order file is empty.');
      }

      const parsed = parse(orderFileContents, undefined, true);

      if (!Array.isArray(parsed)) {
        throw new Error(`Order file is not an array of strings.`);
      }

      keys = parsed;
    } catch (error) {
      throw new Error(`Failed to parse order file. It must contain an array of strings.\n${error}`);
    }

    keys.forEach((key, index) => {
      if (typeof key !== 'string') {
        throw new Error(`The order file must contain an array of strings, but found ${typeof key} at ${index}!`);
      }

      orderSet.add(key);
    });
  }

  return [...orderSet];
}
