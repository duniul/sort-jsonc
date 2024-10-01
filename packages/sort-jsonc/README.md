# sort-jsonc

[![npm](https://img.shields.io/npm/v/sort-jsonc.svg)](https://www.npmjs.com/package/sort-jsonc)

✅ Sort JSONC (JSON with comments) without mangling comments!

<sup><i>Works with regular JSON too, of course!</i></sup>

See [sort-jsonc-cli](../sort-jsonc-cli) for the CLI version.

## Usage

See the [API reference](#api-reference) for info on all options.

```ts
import { sortJsonc } from 'sort-jsonc';

// JSON with comments
const jsonc = `{
  "charlie": 0,
  /*
   * Big block comment explaining "nested"
   */
  "nested": {
    "caesar": 0, // Comment left of "nested.c"
    "adam": 0,
    "bertil": 0
  },
  "array": [
    { "amsterdam": 0, "baltimore": 0 },
    { "yankee": 0, "zulu": 0 }
  ],
  "bravo": 0,
  // Comment above "a"
  "alfa": 1
}`;

// Sort it alphabetically...
const sortedAlphabetically = sortJsonc(jsonc);

// ... or sort it by preferred key order...
const sortedPreferred = sortJsonc(jsonc, { sort: ['nested', 'array'] });

// ... or sort it however you want!
const sortedByKeyLength = sortJsonc(jsonc, { sort: (a, b) => a.length - b.length });
```

<details>
  <summary>See example results</summary>
  
##### `sortedAlphabetically`

```jsonc
{
  // Comment above "a"
  "alfa": 1,
  "array": [
    {
      "amsterdam": 0,
      "baltimore": 0
    },
    {
      "yankee": 0,
      "zulu": 0
    }
  ],
  "bravo": 0,
  "charlie": 0,
  /*
   * Big block comment explaining "nested"
   */
  "nested": {
    "adam": 0,
    "bertil": 0,
    "caesar": 0 // Comment left of "nested.c"
  }
}
```

##### `sortedPreferred`

```jsonc
{
  /*
   * Big block comment explaining "nested"
   */
  "nested": {
    "adam": 0,
    "bertil": 0,
    "caesar": 0 // Comment left of "nested.c"
  },
  "array": [
    {
      "amsterdam": 0,
      "baltimore": 0
    },
    {
      "yankee": 0,
      "zulu": 0
    }
  ],
  // Comment above "a"
  "alfa": 1,
  "bravo": 0,
  "charlie": 0
}
```

##### `sortedAlphabetically`

```jsonc
{
  // Comment above "a"
  "alfa": 1,
  "array": [
    {
      "amsterdam": 0,
      "baltimore": 0
    },
    {
      "zulu": 0,
      "yankee": 0
    }
  ],
  "bravo": 0,
  /*
   * Big block comment explaining "nested"
   */
  "nested": {
    "adam": 0,
    "caesar": 0, // Comment left of "nested.c"
    "bertil": 0
  },
  "charlie": 0
}
```

</details>

## Installation

| npm                      | yarn                  | pnpm                  |
| ------------------------ | --------------------- | --------------------- |
| `npm install sort-jsonc` | `yarn add sort-jsonc` | `pnpm add sort-jsonc` |

## API reference

### `sortJsonc(jsonc, options)`

```ts
  sortJsonc(jsonc: string, options?: SortJsoncOptions): string
```

Sorts a JSON/JSONC string without mangling comments (can also remove them if wanted).

Sorts alphabetically by default, but can also sort by preferred key order or by a custom sort function.

#### Parameters

| Name      | Type               | Description                                                        |
| --------- | ------------------ | ------------------------------------------------------------------ |
| `jsonc`   | `string`           | The JSONC string to sort.                                          |
| `options` | `SortJsoncOptions` | Options for sorting. See [below](#sortjsoncoptions) for more info. |

##### Options

| Name               | Type                      | Default     | Description                                                                                                  |
| ------------------ | ------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `sort`             | `CompareFn` or `string[]` | `undefined` | Can be a compare function (like `Array.sort`) or a list of ordered keys. Sorts alphabetically if left blank. |
| `spaces`           | `number`                  | `2`         | Number of spaces to indent the JSON. Same as the third parameter of `JSON.stringify()`.                      |
| `removeComments`   | `boolean`                 | `false`     | Whether to remove comments or not.                                                                           |
| `parseReviver`     | `Reviver`                 | `undefined` | Reviver function, like the second parameter of `JSON.parse()`.                                               |
| `stringifyReviver` | `Reviver`                 | `undefined` | Reviver function, like the second parameter of `JSON.stringify()`.                                           |
