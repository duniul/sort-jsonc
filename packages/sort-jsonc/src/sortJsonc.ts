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
  spaces?: string | number | undefined | null;

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
  const { sorted } = sortDeepWithSymbols(parsed, getCompareFn(sort), false);

  return stringify(sorted, parseReviver || undefined, spaces || 2);
}

function getCompareFn(sortOption: SortJsoncOptions['sort']) {
  if (Array.isArray(sortOption)) {
    return createOrderCompareFn(sortOption);
  }

  if (typeof sortOption === 'function') {
    return sortOption;
  }

  return createIntlCompareFn();
}

/**
 * Sorts the properties of the given object deeply (including symbol properties) or checks if they are already sorted,
 * based on the `checkOnly` parameter. This function can handle nested objects.
 *
 * @param initial - The object to be sorted or checked. This object must be a Record with string or symbol keys.
 * @param compareFn - Compare-function like {@link Array.prototype.sort()}.
 * @param checkOnly - Determines whether the function will only check if the object is sorted.
 * @returns If `checkOnly` is `true`, returns a boolean indicating whether the object is already sorted.
 *          If `checkOnly` is `false`, returns an object with two properties:
 *          - `sorted`: The sorted object.
 *          - `alreadySorted`: A boolean indicating whether the object was already sorted.
 *
 * @template T - The type of the object to be sorted or checked. Must extend `Record<string | symbol, any>`.
 * @template C - The conditional type that extends boolean, representing the `checkOnly` parameter.
 */
export function sortDeepWithSymbols<T extends Record<string | symbol, any>, C extends boolean>(
  initial: T,
  compareFn: CompareFn,
  checkOnly: C
): C extends true ? boolean : { sorted: T; alreadySorted: boolean };

export function sortDeepWithSymbols<T extends Record<string | symbol, any>>(
  initial: T,
  compareFn: CompareFn,
  checkOnly = false
): boolean | { sorted: T; alreadySorted: boolean } {
  let alreadySorted = false;
  const result = { sorted: initial, alreadySorted };
  const stack: [any, string][] = [[result, 'sorted']];

  while (stack.length) {
    // biome-ignore lint/style/noNonNullAssertion: we know the stack isn't empty
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
      alreadySorted = isSorted(keys, compareFn);
      if (checkOnly) {
        return alreadySorted;
      }
      if (!alreadySorted) {
        keys.sort(compareFn);
      }
    }

    for (const key of keys) {
      const value = current[key];
      sorted[key] = value;

      if (typeof value === 'object' && value !== null) {
        stack.push([sorted, key]);
      }
    }

    parent[keyOnParent] = sorted;
  }

  return { ...result, alreadySorted };
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

/**
 * Checks if a JSON/JSONC/JSON5 string is sorted.
 * @param jsoncString JSON/JSONC/JSON5 string
 * @param options sorting, parsing and formatting options
 * @returns true if the string is sorted, false otherwise.
 */
export function isSortedJsonc(jsoncString: string, options?: Pick<SortJsoncOptions, 'sort' | 'parseReviver'>): boolean {
  const { parseReviver, sort } = options || {};
  const parsed = parse(jsoncString, parseReviver || undefined) as any;
  return sortDeepWithSymbols(parsed, getCompareFn(sort), true);
}

/**
 * Checks if an array is sorted given a compare function. The implementation short-circuits immediately after an
 * unsorted element is found.
 *
 * @param arr - an array to check.
 * @param compareFn - a compare function to use for the comparison.
 * @returns true if the array is sorted, false otherwise.
 */
function isSorted<T extends string>(arr: T[], compareFn: CompareFn): boolean {
  return (
    arr
      // This creates a copy of the array that we will iterate over.
      // By starting at the second item in the array, we can easily create pairs to compare.
      .slice(1)
      // We're iterating over every element in the slice, so the item at i=0 is arr[1].
      // More generally, item === arr[i+1], and arr[i] is the previous item in the array.
      // We check each pair, and if any pair is out of ordered, return immediately
      .every((item, i) => {
        // arr[i] is the previous item in the array.
        // We expect it to be less than or equal the current item, or the array isn't sorted.
        // biome-ignore lint/style/noNonNullAssertion: we're iterating over a slice of arr, so i will always be indexable
        return compareFn(arr[i]!, item) <= 0;
      })
  );
}
