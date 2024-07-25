# css-to-xpath-converter

It's inspired by [css2xpath](https://github.com/css2xpath/css2xpath), but it is too buggy.

This JavaScript version is ported from C# converter, which is intended to work with an HTML navigator inherited from `System.Xml.XPath.XPathNavigator`, but tests in Puppeteer and Crome show that generated XPathes also work in browsers. See [Test results](https://angezid.github.io/css-to-xpath-converter/test-coverage.html).
 
**Important:** the converter doesn't check validity neither of CSS selector nor of resulted XPath. So there may be cases when an application throw an error on parsing the XPath or the XPath isn't work as expected.  
Although the converter is capture a lot of mistakes, but not all.

See online [css-to-xpath-converter](https://angezid.github.io/css-to-xpath-converter). It contains a lot of examples.

## Usage:
``` js
const { xpath, css, warning, error } = toXPath(selector, options);
if (xpath) console.log(xpath);
else console.log(error);
```

### Output object properties:
* `xpath` - the generated XPath string or null if an error occur on parsing CSS selector
* `css` - the normalized CSS selector string (stripped from unnecessary white spaces, comments)
* `warning` - warning message or empty string
* `error` - error message or empty string

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