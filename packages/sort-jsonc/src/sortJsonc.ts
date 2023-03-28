import { parse, stringify, type Reviver } from 'comment-json';

/**
 * Compare-function like {@link Array.prototype.sort()}.
 */
export type CompareFn = (a: string, b: string) => number;

export type SortJsoncOptions = {
  sort?: CompareFn | string[] | undefined | null;

  /**
   * Whether to remove comments from the JSON.
   */
  removeComments?: boolean | undefined | null;

  /**
   * Number of spaces to indent the JSON.
   * Same as the second parameter of {@link JSON.stringify()}.
   */
  spaces?: number | undefined | null;

  /**
   * Reviver function like the second parameter of {@link JSON.parse()}.
   */
  parseReviver?: Reviver | undefined | null;

  /**
   * Reviver function like the second parameter of {@link JSON.stringify()}.
   */
  stringifyReviver?: Reviver | undefined | null;
};

/**
 * Sorts a JSON/JSONC/JSON5 string without mangling comments.
 * @param jsoncString JSON/JSONC/JSON5 string
 * @param options sorting, parsing and formatting options
 * @returns sorted version of the original string
 */
export function sortJsonc(jsoncString: string, options?: SortJsoncOptions) {
  const { parseReviver, removeComments, spaces, sort } = options || {};
  const parsed = parse(jsoncString, parseReviver || undefined, removeComments || undefined) as any;
  const sorted = sortDeepWithSymbols(parsed, getCompareFn(sort));

  return stringify(sorted, parseReviver || undefined, spaces || 2);
}

function getCompareFn(sortOption: SortJsoncOptions['sort']) {
  if (Array.isArray(sortOption)) {
    return createOrderCompareFn(sortOption);
  } else if (typeof sortOption === 'function') {
    return sortOption;
  }

  return createIntlCompareFn();
}

export function sortDeepWithSymbols<T extends Record<string | symbol, any>>(initial: T, compareFn: CompareFn): T {
  const result = { sorted: initial };
  const stack: [any, string][] = [[result, 'sorted']];

  while (stack.length) {
    const [parent, keyOnParent] = stack.shift()!;
    const current = parent[keyOnParent];
    const sorted: any = Array.isArray(current) ? [] : {};
    const keys: string[] = [];

    for (const key of Reflect.ownKeys(current)) {
      const value = current[key];

      if (typeof key === 'symbol') {
        sorted[key] = value;
        continue;
      }

      keys.push(key);
    }

    if (!Array.isArray(current)) {
      keys.sort(compareFn);
    }
    for (const key of keys) {
      const value = current[key];
      sorted[key] = value;

      if (typeof value === 'object') {
        stack.push([sorted, key]);
      }
    }

    parent[keyOnParent] = sorted;
  }

  return result.sorted as any;
}

export function createIntlCompareFn(): CompareFn {
  return new Intl.Collator('en').compare;
}

export function createOrderCompareFn(order: string[]): CompareFn {
  const intlCompare = createIntlCompareFn();
  const orderMap = new Map(order.map((key, index) => [key, index + 1]));
  const max = order.length + 1;

  return (a, b) => {
    const aWeight = orderMap.get(a) || max;
    const bWeight = orderMap.get(b) || max;

    if (aWeight === bWeight) {
      return intlCompare(a, b);
    }

    return aWeight - bWeight;
  };
}
