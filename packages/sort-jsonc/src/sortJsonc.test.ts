import { describe, expect, it } from 'vitest';
import { sortJsonc } from './sortJsonc';

describe('sortJsonc', () => {
  it('sorts a .jsonc string and preserves comments', () => {
    const jsoncString = `
{
  /* comment above h */ 
  "h": 8,
  "c": 3, // comment after c
  "a": 1,
  "d": {
    // in d above f,
    "f": 6,
    "e": 5,
  },
  "i": {
    "k": 11,
    /**
     * block comment above j
     */
    "j": 10,
    "l": {
      "m": {
        "p": 16,
        "o": 15,
        "n": 14
      }
    }
  },
  "g": 7,
  // above b
  "b": 2,
}
    `;

    const result = sortJsonc(jsoncString);

    expect(result).toEqual(
      `
{
  "a": 1,
  // above b
  "b": 2,
  "c": 3, // comment after c
  "d": {
    "e": 5,
    // in d above f,
    "f": 6
  },
  "g": 7,
  /* comment above h */
  "h": 8,
  "i": {
    /**
     * block comment above j
     */
    "j": 10,
    "k": 11,
    "l": {
      "m": {
        "n": 14,
        "o": 15,
        "p": 16
      }
    }
  }
}
    `.trim()
    );
  });

  it('sorts objects in nested arrays by default', () => {
    const jsoncString = `
{
  "k": 11,
  "a": [
    {
      "c": 3,
      "b": 2
    },
    {
      "e": 5,
      "d": 4,
      "f": [
        {
          "h": 8,
          "g": 7
        },
        // array comment!
        {
          "j": 10,
          "i": 9
        }
      ]
    }
  ]
}
    `;

    const result = sortJsonc(jsoncString);

    expect(result).toEqual(
      `
{
  "a": [
    {
      "b": 2,
      "c": 3
    },
    {
      "d": 4,
      "e": 5,
      "f": [
        {
          "g": 7,
          "h": 8
        },
        // array comment!
        {
          "i": 9,
          "j": 10
        }
      ]
    }
  ],
  "k": 11
}
    `.trim()
    );
  });

  it('does not change array order ', () => {
    const jsoncString = `
      {
        "h": 11,
        "a": ["c", "b", "e", "d", "g", "f"],
        "i": 12,
      }`;

    const result = sortJsonc(jsoncString);

    expect(result).toEqual(
      `
{
  "a": [
    "c",
    "b",
    "e",
    "d",
    "g",
    "f"
  ],
  "h": 11,
  "i": 12
}
      `.trim()
    );
  });

  describe('order sort', () => {
    const partialCompilerOptionsString = `
    {
      // Create sourcemaps for d.ts files.
      "declarationMap": true,
      // Ensure 'use strict' is always emitted.
      "alwaysStrict": true,
      // Generate .d.ts files from TypeScript and JavaScript files in your project.
      "declaration": true,
      // Enable error reporting in type-checked JavaScript files.
      "checkJs": false,
      // Disable error reporting for unreachable code.
      "allowUnreachableCode": false,
      // Specify the base directory to resolve non-relative module names.
      "baseUrl": ".",
    }
      `;
    it('can sort by preferred order', () => {
      const result = sortJsonc(partialCompilerOptionsString, {
        sort: ['baseUrl', 'declaration', 'declarationMap', 'alwaysStrict', 'allowUnreachableCode', 'checkJs'],
      });

      expect(result).toEqual(
        `
{
  // Specify the base directory to resolve non-relative module names.
  "baseUrl": ".",
  // Generate .d.ts files from TypeScript and JavaScript files in your project.
  "declaration": true,
  // Create sourcemaps for d.ts files.
  "declarationMap": true,
  // Ensure 'use strict' is always emitted.
  "alwaysStrict": true,
  // Disable error reporting for unreachable code.
  "allowUnreachableCode": false,
  // Enable error reporting in type-checked JavaScript files.
  "checkJs": false
}
      `.trim()
      );
    });

    it('sorts remaining keys alphabetically', () => {
      const result = sortJsonc(partialCompilerOptionsString, {
        sort: ['declaration', 'declarationMap'],
      });

      expect(result).toEqual(
        `
{
  // Generate .d.ts files from TypeScript and JavaScript files in your project.
  "declaration": true,
  // Create sourcemaps for d.ts files.
  "declarationMap": true,
  // Disable error reporting for unreachable code.
  "allowUnreachableCode": false,
  // Ensure 'use strict' is always emitted.
  "alwaysStrict": true,
  // Specify the base directory to resolve non-relative module names.
  "baseUrl": ".",
  // Enable error reporting in type-checked JavaScript files.
  "checkJs": false
}
  `.trim()
      );
    });
  });
});
