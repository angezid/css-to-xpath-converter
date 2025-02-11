# css-to-xpath-converter

The converter uses an extended set of CSS selectors that allows generate more elaborate XPathes.  
Also, it implements non-standard class attribute behavior which has more practical uses than standard one.

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.

The converter has been tested in Puppeteer and Chrome. See [Test results](https://angezid.github.io/css-to-xpath-converter/test-coverage.html).  
The C# version was tested using an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`.

**Important:** the converter itself doesn't check validity neither of CSS selector nor of resulted XPath.  
Although the converter is capturing a lot of mistakes, but not all.

See online [converter / playground](https://angezid.github.io/css-to-xpath-converter). It contains a lot of examples and you can also test the validity of XPath/CSS selector and what elements they are actually selecting.

<details>
<summary><b>It allows using these CSS selectors:</b></summary>
<h3>Combinators</h3>


|   Selectors  |   Description                 |   Remark  |
|--------------|-------------------------------|-----------|
|   "+"        |                               |           |
|   ">"        |                               |           |
|   "~"        |                               |           |
|   "^"        |   first child                 |           |
|   "!"        |   ancestors                   |           |
|   "!^"       |   last child                  |           |
|   "!+"       |   adjacent preceding sibling  |           |
|   "!>"       |   parent                      |           |
|   "!~"       |   preceding sibling           |           |

<h3>Attribute selectors</h3>

|   Selectors                |   Description                                   |   Remark                           |
|----------------------------|-------------------------------------------------|------------------------------------|
|   "="                      |   equals                                        |                                    |
|   "!="                     |   not equals                                    |                                    |
|   "^="                     |   starts with                                   |                                    |
|   "$="                     |   ends with                                     |                                    |
|   "*="                     |   contains within                               |                                    |
|   "~="                     |   contains exactly                              |                                    |
|   "\|="                    |   exactly or followed by a hyphen               |                                    |
|   [attr operator value i]  |   to perform case-insensitive value comparison  |   i or I                           |

<h3>Pseudoclasses</h3>

|   Selectors              |   Description                                            |   Remark            |
|--------------------------|----------------------------------------------------------|---------------------|
|   ":after()"             |                                                          |                     |
|   ":after-sibling()"     |                                                          |                     |
|   ":before()"            |                                                          |                     |
|   ":before-sibling()"    |                                                          |                     |
|   ":checked"             |                                                          |                     |
|   ":contains()"          |   text contains string                                   |                     |
|   ":disabled"            |                                                          |                     |
|   ":empty"               |   select empty elements                                  |                     |
|   ":enabled"             |                                                          |                     |
|   ":ends-with()"         |   text ends with string                                  |                     |
|   ":eq()"                |  select element equal to number                          | same as ":nth()"    |
|   ":first"               |   select the first element                               |                     |
|   ":first-child"         |                                                          |                     |
|   ":first-of-type"       |                                                          |                     |
|   ":gt()"                |   select elements greater than number                    |                     |
|   ":has()"               |                                                          |                     |
|   ":has-ancestor()"      |                                                          |                     |
|   ":has-parent()"        |                                                          |                     |
|   ":has-sibling()"       |                                                          |                     |
|   ":icontains()"         |   text contains string ignore case                       |                     |
|   ":iends-with()"        |   text ends with string ignore case                      |                     |
|   ":is()"                |                                                          |                     |
|   ":istarts-with()"      |   text starts with string ignore case                    |                     |
|   ":last"                |   select the last element                                |                     |
|   ":last-child"          |                                                          |                     |
|   ":last-of-type"        |                                                          |                     |
|   ":limit()"             |   select specified number of elements                    |                     |
|   ":lt()"                |   select elements lesser than number                     |                     |
|   ":not()"               |                                                          | it's more versatile |
|   ":nth()"               |   select element equal to number                         | same as ":eq()"     |
|   ":nth-child()"         |                                                          |                     |
|   ":nth-last-child()"    |                                                          |                     |
|   ":nth-of-type()"       |                                                          |                     |
|   ":nth-last-of-type()"  |                                                          |                     |
|   ":only-child"          |                                                          |                     |
|   ":only-of-type"        |                                                          |                     |
|   ":range()"             |   select elements from smaller number to bigger one      |                     |
|   ":root"                |   html element                                           |                     |
|   ":skip()"              |   skip elements lesser than number                       |                     |
|   ":skip-first"          |   skip the first element                                 |                     |
|   ":skip-last"           |   skip the last element                                  |                     |
|   ":starts-with()"       |   text starts with string                                |                     |
|   ":target"              |   select elements with attribute 'href' starts with '#'  |                     |
|   ":text"                |                                                          |                     |

</details>

## Usage:
``` js
const { xpath, css, warning, error } = toXPath(selector, options);
if (xpath) console.log(xpath);
else console.log(error);
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
  * `useClassName` - this option change the XPath generation of attribute selector '[class operation value]'. See [Class attribute non-standard](https://angezid.github.io/css-to-xpath-converter/index.html#class_attribute_non_standard) and [Class attribute standard](https://angezid.github.io/css-to-xpath-converter/index.html#class_attribute_standard). Non-standard approach is more flexible because it is dealing with individual classes instead of a whole className.
  * `removeXPathSpaces` - strips unnecessary space characters from the XPath (they are added for readability).
  * `printError` - the callback to send error message that the converter is detected, e.g. in online [converter][converter] it is printed in the XPath editor.
  * `debug` - log the converter errors to the console (the converter catches its errors internally).
  
  * `uppercaseLetters` - custom uppercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default uppercase Latin alphabet. It must be compliant with `lowercaseLetters`.
  
  * `lowercaseLetters` - custom lowercase letters string, using by converter to perform case-insensitive attribute value operations.  
  It extends the default lowercase Latin alphabet. It must be compliant with `uppercaseLetters`.
  
  The default options:
  ``` js
  const options = {
    axis : '//',
    useClassName : false,
    removeXPathSpaces : false,
    uppercaseLetters : '',
    lowercaseLetters : '',
    printError : (message) => {}
    debug : false
  };
  ```

[converter]: https://angezid.github.io/css-to-xpath-converter