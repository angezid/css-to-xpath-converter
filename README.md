# CssToXPathConverter

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.
 
**Important** currently it entirely ASCII version.

Its .NET C# version is heavily tested, but for now I don't have any idea how to test it in the browser.

See online converter [CssToXPathConverter](https://angezid.github.io/CssToXPathConverter)

It allows using these CSS selectors:

### Combinators
|   Selectors    |   Description  |     |
|---------|-----------|----------|
|   "+"    |     |     |
|   ">"    |     |     |
|   "~"    |     |     |
|   "^"    |     |     |
|   "!"    |     |     |
|   "!^"    |     |     |
|   "!+"    |     |     |
|   "!>"    |     |     |
|   "!~"    |     |     |

### Attribute selectors
|   Selectors    |   Description  |     |
|---------|-----------|----------|
|   "="    |     |     |
|   "!="    |     |     |
|   "^="    |     |     |
|   "*="    |     |     |
|   "\|="    |     |     |
|   "~="    |     |     |
|   "$="    |     |     |

### Pseudo-classes
|   Selectors    |   Description  |     |
|---------|-----------|----------|
|   ":contains"    |     |     |
|   ":empty"    |     |     |
|   ":ends-with"    |     |     |
|   ":eq"    |     |     |
|   ":first"    |     |     |
|   ":first-child"    |     |     |
|   ":first-of-type"    |     |     |
|   ":gt"    |     |     |
|   ":has"    |     |     |
|   ":has-ancestor"    |     |     |
|   ":has-parent"    |     |     |
|   ":has-sibling"    |     |     |
|   ":icontains"    |     |     |
|   ":iends-with"    |     |     |
|   ":istarts-with"    |     |     |
|   ":last"    |     |     |
|   ":last-child"    |     |     |
|   ":last-of-type"    |     |     |
|   ":limit"    |     |     |
|   ":lt"    |     |     |
|   ":not"    |     |     |
|   ":nth"    |     |     |
|   ":nth-child"    |     |     |
|   ":nth-last-child"    |     |     |
|   ":nth-of-type"    |     |     |
|   ":nth-last-of-type"    |     |     |
|   ":only-child"    |     |     |
|   ":only-of-type"    |     |     |
|   ":range"    |     |     |
|   ":skip"    |     |     |
|   ":skip-first"    |     |     |
|   ":skip-last"    |     |     |
|   ":starts-with"    |     |     |
|   ":target"    |     |     |
|   ":text"    |     |     |