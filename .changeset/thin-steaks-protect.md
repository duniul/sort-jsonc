---
"sort-jsonc": minor
---

New function: isSortedJsonc() checks if a JSON/JSONC/JSON5 string is sorted

The new function isSortedJsonc can be used to check if a JSON/JSONC/JSON5 string is sorted. The implementation
short-circuits as soon as an unsorted element is found. Custom sort functions and order arrays can be provided to
customize the sort logic.
