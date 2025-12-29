# css-to-xpath-converter

The converter uses an extended set of CSS selectors that allows generate more elaborate XPathes.  
Also, it implements non-standard class attribute behavior which has more practical uses than standard one.

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.

Tests can be run in your current browser. See [Tests](https://angezid.github.io/css-to-xpath-converter/css2xpath-tests.html).  
The C# version was tested using an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`.

**Important:** the converter itself doesn't check validity neither of CSS selector nor of resulted XPath.  
Although the converter is capturing a lot of mistakes, but not all.

See online [converter / playground](https://angezid.github.io/css-to-xpath-converter/index.html). It contains a lot of examples and you can also test the validity of XPath/CSS selector and what elements they are actually selecting.

<details>
<summary><b>It allows using these CSS selectors:</b></summary>
<h3>Combinators</h3>


|   Selectors  |   Description                 |   Remark  |
|--------------|-------------------------------|-----------|
|   "+"        |   adjacent following sibling  |           |
|   ">"        |   child                       |           |
|   "~"        |   following siblings          |           |
|   "^"        |   first child                 |           |
|   "!"        |   ancestors or self           |           |
|   "!^"       |   last child                  |           |
|   "!+"       |   adjacent preceding sibling  |           |
|   "!>"       |   parent                      |           |
|   "!~"       |   preceding siblings          |           |

<h3>Attribute selectors</h3>

|   Selectors                |   Description                                   |   Remark     |
|----------------------------|-------------------------------------------------|--------------|
|   "="                      |   equals                                        |              |
|   "!="                     |   not equals                                    |              |
|   "^="                     |   starts with                                   |              |
|   "$="                     |   ends with                                     |              |
|   "*="                     |   contains within                               |              |
|   "~="                     |   contains exactly                              |              |
|   "\|="                    |   exactly or followed by a hyphen               |              |
|   [attr operator value i]  |   to perform case-insensitive value comparison  |   i or I     |

<h3>Pseudo-classes</h3>

|   Selectors              |   Description                                            |   Remark               |
|--------------------------|----------------------------------------------------------|------------------------|
|   ":any-link"            |  select `a` or `area` elements with attribute 'href'     |                        |
|   ":after(s)"            |  select elements that appear after specified element     |                        |
|   ":after-sibling(s)"    |  select siblings that appear after specified element     |                        |
|   ":before(s)"           |  select elements that appear before specified element    |                        |
|   ":before-sibling(s)"   |  select siblings that appear before specified element    |                        |
|   ":contains(t)"         |   select elements that have text contains string         |                        |
|   ":icontains(t)"        |   the same as `:contains()` but case-insensitive         |                        |
|   ":dir()"               |                                                          | not handle `auto` value|
|   ":disabled"            |                                                          |                        |
|   ":empty"               |   select empty elements                                  |                        |
|   ":enabled"             |                                                          |                        |
|   ":ends-with(t)"        |   select elements that have text ends with string        |                        |
|   ":iends-with(t)"       |   the same as `:ends-with()` but case-insensitive        |                        |
|   ":first"               |   select the first element                               |                        |
|   ":first(n)"            |    select the first `n` element                          |                        |
|   ":first-child"         |                                                          |                        |
|   ":first-of-type"       |                                                          |                        |
|   ":eq(n)"               |   select element equal to `n`                            | same as ":nth()"       |
|   ":nth(n)"              |   select element equal to `n`                            | same as ":eq()"        |
|   ":gt(n)"               |   select elements greater than `n`                       |                        |
|   ":lt(n)"               |   select elements lesser than `n`                        |                        |
|   ":has(s)"              |                                                          |                        |
|   ":has-ancestor(s)"     |                                                          |                        |
|   ":has-parent(s)"       |                                                          |                        |
|   ":has-sibling(s)"      |                                                          |                        |
|   ":is(s)"               |                                                          |                        |
|   ":matches(s)"          |                                                          |                        |
|   ":lang(t)"             |                                                          | support wildcard (limited) |
|   ":last"                |   select the last element                                |                        |
|   ":last(n)"             |   select the last `n` element                            |                        |
|   ":last-child"          |                                                          |                        |
|   ":last-of-type"        |                                                          |                        |
|   ":limit(n)"            |   select specified number of elements                    |                        |
|   ":not(s)"              |                                                          |                        |
|   ":nth-child()"         |                                                          | support `of` selector  |
|   ":nth-last-child()"    |                                                          | support `of` selector  |
|   ":nth-of-type()"       |                                                          |                        |
|   ":nth-last-of-type()"  |                                                          |                        |
|   ":only-child"          |                                                          |                        |
|   ":only-of-type"        |                                                          |                        |
|   ":range(n, m)"         |   select elements from `n` to `m`                        |                        |
|   ":skip(n)"             |   skip elements lesser than `n`                          |                        |
|   ":skip-first"          |   skip the first element                                 |                        |
|   ":skip-first(n)"       |   skip the first `n` elements                            |                        |
|   ":skip-last"           |   skip the last element                                  |                        |
|   ":skip-last(n)"        |   skip the last `n` elements                             |                        |
|   ":starts-with(t)"      |   select elements that have text starts with string      |                        |
|   ":istarts-with(t)"     |   the same as `:starts-with()` but case-insensitive      |                        |
|   ":root"                |   `html` element                                         |                        |
|   ":external"            |                                                          |                        |
|   ":checked"             |                                                          |                        |
|   ":target"              |   select elements with attribute 'href' starts with '#'  |                        |
|   ":selected"            |   select `option` elements with attribute 'selected'     |                        |
|   ":text"                |                                                          |                        |

* `s` - selectors
* `n, m` - numbers 
* `t` - text

</details>

## Usage:
``` js
const { xpath, css, warning, error } = toXPath(selector, options);
if (xpath) console.log(xpath);
```

### Output object properties:
* `xpath` - the generated XPath string or undefined if an error occur on parsing CSS selector
* `css` - the normalized CSS selector string (stripped from unnecessary white spaces, comments)
* `warning` - warning message or empty string
* `error` - error message or empty string

### Parameters:
* `selector` - the input css selector string
* `options` - the optional object :
  * `axis` - the XPath start axis. See online [converter][converter] axes dropbox tooltips.
  * `standard` - this option change the XPath generation of a class attribute selector '[class operation value]'. See [Class attribute non-standard](https://angezid.github.io/css-to-xpath-converter/index.html#class_attribute_non_standard) and [Class attribute standard](https://angezid.github.io/css-to-xpath-converter/index.html#class_attribute_standard). Non-standard implementation is more practical because it deals with individual classes instead of a whole `className` string.
  * `removeXPathSpaces` - strips unnecessary space characters from the XPath (they are added for readability).
  * `printError` - the callback to send error message that the converter is detected, e.g. in online [converter][converter] it is printed in the XPath editor.
  * `translate` - whether to translate to lowercase attribute values and string arguments when using selectors which perform case insensitive operations.  
    When it set to `false`, the generated XPath will be smaller, but it forces using lowercase letters for attribute values and string arguments.
  * `debug` - log the converter errors to the console (the converter catches its errors internally).
  
  * `uppercaseLetters` - custom uppercase letters string, using by converter to perform case-insensitive attribute value and text operations.  
  It extends the default uppercase Latin alphabet. It must be compliant with `lowercaseLetters`.
  
  * `lowercaseLetters` - custom lowercase letters string, using by converter to perform case-insensitive attribute value and text operations.  
  It extends the default lowercase Latin alphabet. It must be compliant with `uppercaseLetters`.
  
  The default options:
  ``` js
  const options = {
    axis: '//',
    standard: false,
    removeXPathSpaces: false,
    uppercaseLetters: '',
    lowercaseLetters: '',
    printError : (message) => {},
    translate: true,
    debug: false
  };
  ```

[converter]: https://angezid.github.io/css-to-xpath-converter/index.html
