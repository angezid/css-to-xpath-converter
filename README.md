# css-to-xpath-converter

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.

This JavaScript version is ported from C# converter, which is intended to work with an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`, but tests in Puppeteer and Crome show that generated XPathes also work in browsers. See [Test results](https://angezid.github.io/css-to-xpath-converter/test-coverage.html).
 
**Important:** the converter doesn't check validity neither of CSS selector nor of resulted XPath. So there may be cases when an application throw an error on parsing the XPath or the XPath isn't work as expected.  
Although the converter is capture a lot of mistakes, but not all.

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
|   "$="    |  ends with   |     |
|   "*="    |  contains within   |     |
|   "~="    |  contains exactly   |     |
|   "\|="    |  exactly or followed by a hyphen   |     |

### Pseudo-classes
|   Selectors    |   Description  |  Remark   |
|---------|-----------|----------|
|   ":checked"    |     |     |
|   ":contains()"    |  text contains string  |     |
|   ":disabled"    |     |     |
|   ":empty"    |     |     |
|   ":enabled"    |     |     |
|   ":ends-with()"    |  text ends with string |     |
|   ":eq()"    |  equal to number  |  same as ":nth()"   |
|   ":first"    |  first of selected elements  |     |
|   ":first-child"    |     |     |
|   ":first-of-type"    |     |     |
|   ":gt()"    |  select elements greater than number |     |
|   ":has()"    |     |     |
|   ":has-ancestor()"    |     |     |
|   ":has-parent()"    |     |     |
|   ":has-sibling()"    |     |     |
|   ":icontains()"    |  text contains string ignore case  |     |
|   ":iends-with()"    |  text ends with string ignore case  |     |
|   ":is()"    |     |     |
|   ":istarts-with()"    |  text starts with string ignore case  |     |
|   ":last"    |  last of selected elements  |     |
|   ":last-child"    |     |     |
|   ":last-of-type"    |     |     |
|   ":limit()"    |  select elements up to number  |     |
|   ":lt()"    |  select elements lesser than number  |     |
|   ":not()"    |     |     |
|   ":nth()"    |  equal to number   |  same as ":eq()"   |
|   ":nth-child()"    |     |     |
|   ":nth-last-child()"    |     |     |
|   ":nth-of-type()"    |     |     |
|   ":nth-last-of-type()"    |     |     |
|   ":only-child"    |     |     |
|   ":only-of-type"    |     |     |
|   ":range()"    |  select elements from smaller number to bigger number inclusive  |     |
|   ":root"    |  html element  |     |
|   ":skip()"    |  skip elements lesser than number  |     |
|   ":skip-first"    |     |     |
|   ":skip-last"    |     |     |
|   ":starts-with()"    |  text starts with string  |     |
|   ":target"    |  select elements with attribute 'href' starts with '#'   |     |
|   ":text"    |     |     |

## Usage:
``` js
const { xpath, css, warning } = toXPath(selector, options);
```
As it can throw an Error on parsing CSS selector:
``` js
let obj;
try { obj = toXPath(selector, options); } catch(e) { }
if (obj) {
  console.log(obj.xpath);
}
```
### Output object properties:
* `xpath` - the generated XPath string
* `css` - the normalized css selector string (stripped from unnecessary white spaces, comments)
* `warning` - warning message or empty string

### Parameters:
* `selector` - the input css selector string
* `options` - the optional object :
  * `axis` - the XPath start axis. See online [converter][converter] axes dropbox tooltips.
  * `removeXPathSpaces` - strips unnecessary space characters from the XPath (they are added for readability).
  * `printError` - the callback to send error message that the converter is detected, e.g. in online [converter][converter] it is printed in the XPath editor. The error message also is printed in the console.
  
  * `uppercaseLetters` - custom uppercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default uppercase Latin alphabet. It must be compliant with `lowercaseLetters`.
  
  * `lowercaseLetters` - custom lowercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default lowercase Latin alphabet. It must be compliant with `uppercaseLetters`.
  
  The default options:
  ``` js
  const options = {
    axis : '//',
    removeXPathSpaces : false,
    uppercaseLetters : '',
    lowercaseLetters : '',
    printError : (message) => {}
  };
  ```

[converter]: https://angezid.github.io/css-to-xpath-converter