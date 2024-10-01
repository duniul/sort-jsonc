# sort-jsonc-cli

[![npm](https://img.shields.io/npm/v/sort-jsonc-cli.svg)](https://www.npmjs.com/package/sort-jsonc-cli)

✅ CLI for sort JSONC files without mangling comments!

<sup><i>Works with regular JSON files too, of course!</i></sup>

See [sort-jsonc](../sort-jsonc) for the underlying library.

## Usage

```sh
sort-jsonc [options] <files>
```

## Options

| Option              | Alias | Description                                                                                                                                                    |
| ------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--order`           | `-o`  | The preferred order to sort keys as a comma-separated string. Prioritized over `--order-file`. Keys not in this list will be sorted alphabetically at the end. |
| `--order-file`      | `-O`  | Path to a JSON file containing a list of strings in preferred order. Keys not in this list will be sorted alphabetically at the end.                           |
| `--remove-comments` | `-c`  | Whether to remove comments from the JSON.                                                                                                                      |
| `--spaces`          | `-S`  | Number of spaces to indent the JSON.                                                                                                                           |
| `--silent`          | `-s`  | Whether to suppress output.                                                                                                                                    |
| `--help`            | `-v`  | Show help info.                                                                                                                                                |

## Examples

#### Sort a file

```sh
$ sort-jsonc sort-jsonc path/to/file.jsonc
```

#### Sort multiple files

```sh
$ sort-jsonc path/to/file1.jsonc path/to/file2.jsonc
```

#### Sort a file by preferred order

```sh
$ sort-jsonc sort-jsonc path/to/file.jsonc -o name,version,description
```

#### Sort a file by preferred order from a file

```sh
$ sort-jsonc sort-jsonc path/to/file.jsonc -O path/to/order.json
```

#### Sort a file and remove comments

```sh
$ sort-jsonc sort-jsonc path/to/file.jsonc -c
```
