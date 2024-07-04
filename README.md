# css-to-xpath-converter

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.
 
**Important** currently it is entirely ASCII version.

Although the converter is capture a lot of mistakes, but not all.

This JavaScript version is ported from C# converter, which is intended to work with an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`.  

**Note** that generated XPathes may seem not optimised e.g. CSS selector `p:nth-of-type(3)` is resulted in `//p[(count(preceding-sibling::p) + 1) = 3]` instead of `//p[3]`, but it works with XPath of selector `p:not(:nth-of-type(3))` -> `//p[not(self::node()[(count(preceding-sibling::p) + 1) = 3])]` (CSS selector example is taken from AngleSharp tests).

See online [css-to-xpath-converter](https://angezid.github.io/css-to-xpath-converter). It contains a lot of examples.

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

## Usage:
``` js
const { xpath, css, warning } = convertToXPath(selector, options);
```
### Output object properties:
* `xpath` - the generated XPath string
* `css` - the normalized css selector string (stripped from unnecessary white spaces, comments)
* `warning` - warning message or empty string

### Parameters:
* `selector` - the input css selector string
* `options` - the optional object :
  * `axis` - XPath start axis. See online [converter][converter] axes dropbox tooltips.
  * `printError` - the collback to send error message that the converter is detected, e.g. in online [converter][converter] it is printed in the XPath editor. The error message also is printed in the console.
  
  * `uppercaseLetters` - custom uppercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default uppercase Latin alphabet. It must be compliant with `lowercaseLetters`.
  
  * `lowercaseLetters` - custom lowercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default lowercase Latin alphabet. It must be compliant with `uppercaseLetters`.
  
  The default options:
  ``` js
  const options = {
    axis : '//',
    uppercaseLetters : '',
    lowercaseLetters : '',
    printError : (message) => {}
  };
  ```

[converter]: https://angezid.github.io/css-to-xpath-converter