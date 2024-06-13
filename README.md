# css-to-xpath-converter

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.
 
**Important** currently it entirely ASCII version.

Although the converter is capable to capture a lot of mistakes, but not all.

This JavaScript version is ported from C# converter, which is intended to work with an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`.
Its .NET C# version is heavily tested, but for now I don't have any idea how to translate these tests to run them in e.g. Puppeteer.

See online [css-to-xpath-converter](https://angezid.github.io/css-to-xpath-converter)

It allows using these CSS selectors:

### Combinators
|   Selectors    |   Description  |  Remark   |
|---------|-----------|----------|
|   "+"    |     |     |
|   ">"    |     |     |
|   "~"    |     |     |
|   "^"    |  first child   |     |
|   "!"    |  ancestors   |     |
|   "!^"    |  last child   |     |
|   "!+"    |  adjacent preceding sibling   |     |
|   "!>"    |  parent   |     |
|   "!~"    |  preceding sibling   |     |

### Attribute selectors
|   Selectors    |   Description  |  Remark   |
|---------|-----------|----------|
|   "="    |  equals   |     |
|   "!="    |  not equals   |     |
|   "^="    |  starts with   |     |
|   "*="    |  contains within   |     |
|   "\|="    |  exactly or followed by a hyphen   |     |
|   "~="    |  contains exactly   |     |
|   "$="    |  ends with   |     |

### Pseudo-classes
|   Selectors    |   Description  |  Remark   |
|---------|-----------|----------|
|   ":checked"    |     |     |
|   ":contains()"    |     |     |
|   ":disabled"    |     |     |
|   ":empty"    |     |     |
|   ":enabled"    |     |     |
|   ":ends-with()"    |     |     |
|   ":eq()"    |     |     |
|   ":first"    |     |     |
|   ":first-child"    |     |     |
|   ":first-of-type"    |     |     |
|   ":gt()"    |     |     |
|   ":has()"    |     |     |
|   ":has-ancestor()"    |     |     |
|   ":has-parent()"    |     |     |
|   ":has-sibling()"    |     |     |
|   ":icontains()"    |     |     |
|   ":iends-with()"    |     |     |
|   ":is()"    |     |     |
|   ":istarts-with()"    |     |     |
|   ":last"    |     |     |
|   ":last-child"    |     |     |
|   ":last-of-type"    |     |     |
|   ":limit()"    |     |     |
|   ":lt()"    |     |     |
|   ":not()"    |     |     |
|   ":nth()"    |     |     |
|   ":nth-child()"    |     |     |
|   ":nth-last-child()"    |     |     |
|   ":nth-of-type()"    |     |     |
|   ":nth-last-of-type()"    |     |     |
|   ":only-child"    |     |     |
|   ":only-of-type"    |     |     |
|   ":range()"    |     |     |
|   ":root"    |     |     |
|   ":skip()"    |     |     |
|   ":skip-first"    |     |     |
|   ":skip-last"    |     |     |
|   ":starts-with()"    |     |     |
|   ":target"    |     |     |
|   ":text"    |     |     |
