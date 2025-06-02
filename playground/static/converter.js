/*!*******************************************
* css-to-xpath-converter 1.0.0
* https://github.com/angezid/css-to-xpath-converter
* MIT licensed
* Copyright (c) 2024–2025, angezid
*********************************************/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.toXPath = factory());
})(this, (function () { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function xNode(node) {
    this.axis = '';
    this.separator = '';
    this.owner = '';
    this.isClone = false;
    this.parentNode = node;
    this.previousNode;
    this.childNodes;
    this.content;
    this.addChild = function (nd) {
      if (!this.childNodes) this.childNodes = [];
      this.childNodes.push(nd);
    };
    this.add = function () {
      var str = '';
      for (var i = 0; i < arguments.length; i++) {
        str += arguments[i];
      }
      if (!this.content) this.content = [];
      this.content.push(str);
    };
    this.hasAxis = function (axis) {
      if (this.axis === axis) return true;
      if (this.childNodes) {
        for (var i = 0; i < this.childNodes.length; i++) {
          if (this.childNodes[i].hasAxis(axis)) return true;
        }
      }
      return false;
    };
    this.hasOr = function () {
      if (this.content && this.content.some(function (str) {
        return str === ' or ' || str === ' | ';
      })) return true;
      if (this.childNodes) {
        for (var i = 0; i < this.childNodes.length; i++) {
          if (this.childNodes[i].hasOr()) return true;
        }
      }
      return false;
    };
    this.clone = function () {
      var node = new xNode();
      node.owner = this.owner;
      node.isClone = true;
      return node;
    };
    this.toString = function () {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      if (!this.isClone) {
        text = this.separator + this.axis + this.owner;
        if (this.content) {
          text += this.content.join('');
        }
      }
      if (this.childNodes) {
        this.childNodes.forEach(function (node) {
          text += node.toString(text);
        });
      }
      return text;
    };
  }

  function ParserError(code, column, message, fileName, lineNumber) {
    var instance = new Error(message, fileName, lineNumber);
    instance.parser = true;
    instance.column = column;
    instance.code = code;
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    if (Error.captureStackTrace) {
      Error.captureStackTrace(instance, ParserError);
    }
    return instance;
  }
  ParserError.prototype = Object.create(Error.prototype, {
    constructor: {
      value: Error,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ParserError, Error);
  } else {
    ParserError.__proto__ = Error;
  }

  var tagNameReg = new RegExp("(?:[a-zA-Z]+\\|)?(?:[a-zA-Z][^ -,.\\/:-@[-^`{-~]*)|(?:[a-zA-Z]+\\|*)", "y");
  var classIdReg = new RegExp("(?:^\\\\00003\\d+)?(?:\\\\[^ ]|[^\\t-,.\\/:-@[-^`{-~])+", "y");
  var pseudoClassReg = new RegExp("((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))", "y");
  var nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;
  var attributeReg = new RegExp("(?:(?:\\*|[a-zA-Z]+)\\|)?(?:\\*|[^ -,.\\/:-@[-^`{-~]+)", "y");
  var attrNameReg = new RegExp("(?:[a-zA-Z]+\\|)?[^ -,.\\/:-@[-^`{-~]+(?=(?:[~^|$!*]?=)|\\])", "y");
  var attrValueReg = new RegExp("(?:\"([^\"]*)\"|'([^']*)'|((?:\\\\[^ ]|[^ \"'\\]])+))(?: +([siSI]))?(?=\\])", "y");
  var State = Object.freeze({
    "Text": 0,
    "PseudoClass": 1,
    "AttributeName": 2,
    "AttributeValue": 3
  });
  var pseudo = "Pseudo-class ':";
  var navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";
  var opt, warning, error, uppercase, lowercase, stack, code, position, length;
  function toXPath(selector, options) {
    opt = _extends({}, {
      axis: './/',
      consoleUse: false,
      standard: false,
      removeXPathSpaces: false,
      uppercaseLetters: '',
      lowercaseLetters: '',
      postprocess: true,
      debug: false
    }, options);
    warning = '';
    error = '';
    stack = [];
    var node = new xNode();
    var xpath;
    var normalized;
    try {
      if (isNullOrWhiteSpace(selector)) {
        argumentException("selector is null or white space");
      }
      uppercase = opt.uppercaseLetters ? opt.uppercaseLetters.trim() : '';
      lowercase = opt.lowercaseLetters ? opt.lowercaseLetters.trim() : '';
      if (uppercase.length !== lowercase.length) {
        argumentException("Custom upper and lower case letters have different length");
      }
      normalized = normalizeWhiteSpaces(selector);
      xpath = convert(node, normalized, opt.axis, null);
      xpath = postprocess(xpath);
    } catch (e) {
      if (e.parser) {
        if (opt.debug) {
          console.log(e.message, e.code, e.column);
        }
      } else {
        console.error(e);
      }
      return {
        xpath: xpath,
        css: normalized,
        warning: warning,
        error: e.message
      };
    }
    return {
      xpath: xpath,
      css: normalized,
      warning: warning,
      error: error
    };
  }
  function convertArgument(node, selector, axis, owner, argInfo) {
    if (!selector) {
      argumentException("The pseudo-selector \':" + argInfo.name + '()\' have missing argument.');
    }
    stack.push(code);
    var result = convert(node, selector, axis, owner, argInfo);
    code = stack.pop();
    length = code.length;
    return result;
  }
  function postprocess(xpath) {
    if (opt.postprocess) {
      if (opt.removeXPathSpaces) {
        xpath = xpath.replace(/("[^"]+"|'[^']+')|([,<=>|+-]) +| +(?=[<=>|+-])/g, function (m, gr, gr2) {
          return gr || gr2 || '';
        });
      }
      xpath = xpath.replace(/([([]| or )self::node\(\)\[((?:[^'"[\]]|"[^"]*"|'[^']*')+)\](?!\[| *\|)/g, '$1$2');
      xpath = xpath.replace(/((?:[^'"[\]]|"[^"]*"|'[^']*')+)|\]\[(?![[(])/g, function (m, gr) {
        return gr || ' and ';
      });
      xpath = xpath.replace(/\[\(((?:[^'"()]|"[^"]*"|'[^']*')+)\)]/g, function (m, gr) {
        return '[' + gr + ']';
      });
      xpath = xpath.replace(/\/child::/g, '/');
    }
    xpath = xpath.replace(/((?:[^'"{}]|"[^"]*"|'[^']*')+)|[{}]/g, function (m, gr) {
      return gr || '';
    });
    return xpath;
  }
  function convert(rootNode, selector, axis, owner, argumentInfo) {
    if (!selector) {
      argumentException("selector is empty or white space");
    }
    var classNode = newNode(rootNode, null);
    var node = newNode(classNode, null);
    var name = argumentInfo ? argumentInfo.name : '';
    var predicate = argumentInfo && argumentInfo.predicate;
    var attrName = null,
      attrValue = null,
      modifier = null,
      operation = null,
      state = State.Text,
      check = false,
      first = true,
      value,
      i = -1,
      ch;
    code = selector;
    length = code.length;
    if (/^[,(]/.test(code)) {
      characterException(0, code[0], "State.Text", code);
    }
    while (++i < length) {
      position = i;
      ch = code[i];
      if (state === State.Text) {
        if (check && !/[>+~^!.#*:|[@a-zA-Z]/.test(ch) || !check && !/[ >+~^!,.#*:|[@a-zA-Z]/.test(ch)) {
          characterException(i, ch, getState(state) + ", check=" + check, code);
        }
        if (argumentInfo && /!?[+~]/.test(ch) && name.endsWith('-sibling')) {
          argumentException('\'' + name + '()\' with these arguments has no implementation');
        }
        if (/[.#:[]/.test(ch) || name !== "has" && node.previousNode && /[>+~^!]/.test(ch)) {
          addAxes(axis, node);
          addOwner(owner, node);
        }
        switch (ch) {
          case '.':
            var str = '[';
            do {
              var _getClassValue = getClassValue(i + 1);
              var _getClassValue2 = _slicedToArray(_getClassValue, 2);
              i = _getClassValue2[0];
              value = _getClassValue2[1];
              str += getClass('@class', normalizeQuotes(' ' + value + ' '));
              classIdReg.lastIndex = i + 2;
              if (nextChar(i, '.') && classIdReg.test(code)) {
                str += " and ";
              } else break;
            } while (++i < length);
            node.add(str + "]");
            check = false;
            break;
          case '#':
            var _getClassValue3 = getClassValue(i + 1);
            var _getClassValue4 = _slicedToArray(_getClassValue3, 2);
            i = _getClassValue4[0];
            value = _getClassValue4[1];
            node.add("[@id=", normalizeQuotes(value), "]");
            check = false;
            break;
          case '>':
            node = newNode(classNode, node, "child::", "/");
            check = true;
            break;
          case '+':
            node = addTwoNodes(classNode, node, "following-sibling::", "*", "[1]", "self::");
            check = true;
            break;
          case '~':
            node = newNode(classNode, node, "following-sibling::", "/");
            check = true;
            break;
          case '^':
            node = addTwoNodes(classNode, node, "child::", "*", "[1]", "self::");
            check = true;
            break;
          case '!':
            if (nextChar(i, '^')) {
              node = addTwoNodes(classNode, node, "child::", "*", "[last()]", "self::");
              i++;
            } else if (nextChar(i, '+')) {
              node = addTwoNodes(classNode, node, "preceding-sibling::", "*", "[1]", "self::");
              i++;
            } else if (nextChar(i, '>')) {
              node = newNode(classNode, node, "parent::", "/");
              i++;
            } else if (nextChar(i, '~')) {
              node = newNode(classNode, node, "preceding-sibling::", "/");
              i++;
            } else {
              node = newNode(classNode, node, "ancestor-or-self::", "/");
            }
            check = true;
            break;
          case '[':
            attrName = '';
            attrValue = null;
            modifier = null;
            operation = null;
            state = State.AttributeName;
            break;
          case ':':
            if (nextChar(i, ':')) i++;
            state = State.PseudoClass;
            break;
          case ',':
            if (i + 1 >= length) characterException(i, ch, getState(state), code);
            classNode = newNode(rootNode, classNode);
            classNode.add(predicate ? " or " : " | ");
            classNode = newNode(rootNode, classNode);
            node = newNode(classNode, null, argumentInfo ? "" : axis);
            check = true;
            break;
          case '@':
            var _parseAttribute = parseAttribute(i, axis, argumentInfo, classNode, node);
            var _parseAttribute2 = _slicedToArray(_parseAttribute, 2);
            i = _parseAttribute2[0];
            node = _parseAttribute2[1];
            check = false;
            break;
          case '*':
            addAxes(axis, node, argumentInfo);
            node.owner = "*";
            check = false;
            break;
          case ' ':
            if (argumentInfo) {
              if (name === 'has-ancestor') {
                node = newNode(classNode, node, 'ancestor::', " and ");
              } else if (name === 'has-parent' || name === 'before' || name === 'after' || name.endsWith('-sibling')) {
                if (!node.previousNode) {
                  node.axis = 'ancestor::';
                  node.separator = '';
                }
                node = newNode(classNode, node, 'ancestor::', " and ");
              } else if (name === 'not' && node.axis === 'self::') {
                if (node.previousNode && node.previousNode.axis === 'ancestor::') {
                  node.separator = ' and ';
                }
                node.axis = 'ancestor::';
                node = newNode(classNode, node, 'self::', "//");
              } else {
                node = newNode(classNode, node, null, "//");
              }
            } else {
              node = newNode(classNode, node, null, "//");
            }
            check = true;
            break;
          case '|':
            if (nextChar(i, '|')) {
              characterException(i + 1, ch, getState(state), code);
            } else {
              var _handleNamespace = handleNamespace(i, axis, first, classNode, node);
              var _handleNamespace2 = _slicedToArray(_handleNamespace, 2);
              i = _handleNamespace2[0];
              node = _handleNamespace2[1];
            }
            check = false;
            break;
          case '\\':
            i++;
            break;
          default:
            if (/[a-zA-Z]/.test(ch)) {
              if (node.owner) {
                characterException(i, ch, getState(state), code);
              }
              addAxes(axis, node, argumentInfo);
              i = getTagName(i, node);
            } else {
              characterException(i, ch, getState(state), code);
            }
            check = false;
            break;
        }
        first = false;
      } else if (state === State.AttributeName) {
        switch (ch) {
          case '=':
            operation = "=";
            attrValue = null;
            state = State.AttributeValue;
            break;
          case '!':
          case '~':
          case '^':
          case '$':
          case '*':
          case '|':
            if (nextChar(i, '=')) {
              operation = ch + "=";
              i++;
              attrValue = null;
              state = State.AttributeValue;
            } else if (ch === '*' && nextChar(i, '|')) {
              attrName = '*:';
              i++;
              addWarning(navWarning);
            } else {
              characterException(i, ch, getState(state), code);
            }
            break;
          case ']':
            if (!attrName) parseException("attrName is null or empty.'");
            node.add("[@" + attrName + "]");
            state = State.Text;
            check = false;
            break;
          case ' ':
            break;
          default:
            var _getAttributeName = getAttributeName(i);
            var _getAttributeName2 = _slicedToArray(_getAttributeName, 2);
            i = _getAttributeName2[0];
            value = _getAttributeName2[1];
            attrName += value;
            break;
        }
      } else if (state === State.AttributeValue) {
        switch (ch) {
          case ']':
            if (attrValue === null) parseException("attrValue is null.");
            processAttribute(attrName, attrValue, operation, modifier, node);
            state = State.Text;
            check = false;
            break;
          case '=':
            characterException(i, ch, getState(state), code);
            break;
          case ' ':
            break;
          default:
            if (attrValue) {
              parseException("attrValue '" + attrValue + "' is already parse: " + code.substring(i));
            }
            var _getAttributeValue = getAttributeValue(i);
            var _getAttributeValue2 = _slicedToArray(_getAttributeValue, 3);
            i = _getAttributeValue2[0];
            attrValue = _getAttributeValue2[1];
            modifier = _getAttributeValue2[2];
            break;
        }
      } else if (state === State.PseudoClass) {
        var _name = '',
          arg = '';
        var _getPseudoClass = getPseudoClass(i);
        var _getPseudoClass2 = _slicedToArray(_getPseudoClass, 3);
        i = _getPseudoClass2[0];
        _name = _getPseudoClass2[1];
        arg = _getPseudoClass2[2];
        if (_name === "root") {
          node.owner = node.separator = '';
          node.axis = '//';
          node = newNode(classNode, node, "ancestor-or-self::");
          node.owner = "*";
          node.add("[last()]");
        } else {
          addOwner(owner, node);
          if (_name.startsWith("nth-")) {
            var not = argumentInfo && argumentInfo.name === 'not';
            node = processNth(_name, arg, not, classNode, node);
          } else {
            processPseudoClass(_name, arg, node);
          }
        }
        state = State.Text;
        check = false;
      }
    }
    var result = rootNode.toString();
    if (check && /(?:\/|::)$/.test(result)) {
      return result + '*';
    }
    if (check || state !== State.Text) {
      parseException("Something is wrong: '" + getState(state) + "' xpath='" + result + "' in: " + code);
    }
    return result;
  }
  function getState(state) {
    return "State." + Object.keys(State)[state];
  }
  function newNode(parNode, node, axis, separator) {
    var nd = new xNode(parNode);
    parNode.addChild(nd);
    nd.previousNode = node;
    nd.axis = axis || '';
    if (separator && node.owner) nd.separator = separator;
    return nd;
  }
  function addTwoNodes(parNode, node, axis, owner, content, axis2) {
    var nd = newNode(parNode, node, axis, "/");
    nd.owner = owner;
    nd.add(content);
    return newNode(parNode, nd, axis2, "/");
  }
  function addAxes(axis, node, argumentInfo) {
    if (!axis || node.axis || axis === "self::" && !argumentInfo) return;
    var text = node.parentNode.toString().trim(),
      len = text.length;
    if (len == 0 || / (?:or|\|)$/.test(text)) {
      node.axis = axis;
    } else {
      var ch = text[len - 1];
      if (ch == ':' || ch == '|') {
        node.axis = axis;
      }
    }
  }
  function addOwner(owner, node) {
    if (node.owner) return;
    var result = '';
    if (!node.previousNode) {
      result = owner || "*";
    } else {
      var text = node.parentNode.toString().trim();
      if (text.length) {
        if (/(?: or|\|)$/.test(text)) {
          result = owner || "*";
        } else {
          var ch = text[text.length - 1];
          if (owner) {
            if (ch === ':') result = "*";else if (ch === '/') result = owner;
          } else if (ch === ':' || ch === '/') result = "*";
        }
      }
    }
    node.owner = result;
  }
  function handleNamespace(i, axis, first, parNode, node) {
    if (node.owner == "*") {
      if (nextChar(i, '*')) {
        node.owner = "*:*";
        i++;
      } else {
        node.owner = "*:";
      }
      addWarning(navWarning);
    } else {
      if (first) addAxes(axis, node);
      if (nextChar(i, '*')) {
        if (!node.owner) {
          node.owner = "*";
          node.add("[not(contains(name(), ':'))]");
        } else {
          node.owner += ":*";
        }
        i++;
      } else if (i + 1 < length && /[a-zA-Z]/.test(code[i + 1])) {
        var nd = newNode(parNode, node, "self::", "/");
        nd.owner = "*";
        return [i, nd];
      } else {
        node.owner = "*:";
        addWarning(navWarning);
      }
    }
    return [i, node];
  }
  function parseAttribute(i, axis, argumentInfo, parNode, node) {
    var text = node.parentNode.toString().trim();
    if (text.length === 0) {
      if (argumentInfo) axis = "";
    } else if (/ (?:or|\|)$/.test(text)) {
      axis = "";
    } else {
      var ch = text[text.length - 1];
      if (ch !== ':' && ch !== '/') axis = "/";else axis = "";
    }
    attributeReg.lastIndex = i + 1;
    var rm = attributeReg.exec(code);
    if (rm !== null) {
      var nd = newNode(parNode, node, axis);
      nd.add("@", rm[0].replace('|', ':').toLowerCase());
      return [i + rm[0].length, nd];
    }
    regexException(i, 'parseAttribute', attributeReg);
  }
  function processAttribute(attrName, attrValue, operation, modifier, node) {
    if (!attrValue.trim()) {
      if (operation === "=") {
        node.add("[@", attrName, " = '']");
      } else if (operation === "!=") {
        node.add("{[not(@", attrName, ") or @", attrName, " != '']}");
      } else if (operation === "|=") {
        node.add("{[@", attrName, " = '' or starts-with(@", attrName, ", '-')]}");
      } else {
        node.add("[false()]");
      }
      return;
    }
    var ignoreCase = modifier === "i" || attrName === 'lang' || attrName === 'type' && getOwner(node) == "input";
    if (!opt.standard && attrName === "class") {
      processClass(attrValue, operation, ignoreCase, node);
      return;
    }
    var lowerCaseValue = ignoreCase ? translateToLower("@" + attrName) : null;
    var value = normalizeQuotes(attrValue);
    switch (operation) {
      case "=":
        if (ignoreCase) {
          node.add("[", lowerCaseValue, " = ", toLower(attrValue), "]");
        } else {
          node.add("[@", attrName, "=", value, "]");
        }
        break;
      case "!=":
        if (ignoreCase) {
          node.add("{[not(@", attrName, ") or ", lowerCaseValue, "!=", toLower(attrValue), "]}");
        } else {
          node.add("{[not(@", attrName, ") or @", attrName, "!=", value, "]}");
        }
        break;
      case "~=":
        if (ignoreCase) {
          node.add("[contains(concat(' ', normalize-space(", lowerCaseValue, "), ' '), concat(' ', normalize-space(", toLower(attrValue), "), ' '))]");
        } else {
          node.add("[contains(concat(' ', normalize-space(@", attrName, "), ' '), concat(' ', normalize-space(", value, "), ' '))]");
        }
        break;
      case "|=":
        if (ignoreCase) {
          node.add("{[", lowerCaseValue, " = ", toLower(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLower(attrValue), ", '-'))]}");
        } else {
          node.add("{[@", attrName, " = ", value, " or starts-with(@", attrName, ", ", normalizeQuotes(attrValue + '-'), ")]}");
        }
        break;
      case "^=":
        if (ignoreCase) {
          node.add("[starts-with(", lowerCaseValue, ", ", toLower(attrValue), ")]");
        } else {
          node.add("[starts-with(@", attrName, ", ", value, ")]");
        }
        break;
      case "$=":
        if (ignoreCase) {
          node.add("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", toLower(attrValue), "]");
        } else {
          node.add("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", value, "]");
        }
        break;
      case "*=":
        if (ignoreCase) {
          node.add("[contains(", lowerCaseValue, ", ", toLower(attrValue), ")]");
        } else {
          node.add("[contains(@", attrName, ", ", value, ")]");
        }
        break;
    }
  }
  function processClass(attrValue, operation, ignoreCase, node) {
    var attrName = ignoreCase ? translateToLower("@class") : "@class";
    var attributeValue = attrValue.trim();
    switch (operation) {
      case "=":
      case "~=":
      case "!=":
        attributeValue = " " + attributeValue + " ";
        break;
      case "^=":
        attributeValue = " " + attributeValue;
        break;
      case "$=":
        attributeValue += " ";
        break;
    }
    if (ignoreCase) {
      attributeValue = toLower(attributeValue);
    } else {
      attributeValue = normalizeQuotes(attributeValue);
    }
    if (operation === "!=") {
      node.add("{[not(", attrName, ") or not(", getClass(attrName, attributeValue), ")]}");
    } else if (operation === "*=") {
      node.add("[contains(", attrName, ", ", attributeValue, ")]");
    } else if (operation === "|=") {
      var attrValue1 = ignoreCase ? toLower(' ' + attrValue + ' ') : normalizeQuotes(' ' + attrValue + ' ');
      var attrValue2 = ignoreCase ? toLower(' ' + attrValue + '-') : normalizeQuotes(' ' + attrValue + '-');
      node.add("{[", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "]}");
    } else {
      node.add("[", getClass(attrName, attributeValue), "]");
    }
  }
  function getClass(attrName, attributeValue) {
    return "contains(concat(' ', normalize-space(".concat(attrName, "), ' '), ").concat(attributeValue, ")");
  }
  function processPseudoClass(name, arg, node) {
    var nd,
      result,
      owner,
      str2,
      str = '',
      localName = 'local-name()';
    switch (name) {
      case "any-link":
        node.add("[(", localName, " = 'a' or ", localName, " = 'area') and @href]");
        break;
      case "external":
        node.add("{[(", localName, " = 'a' or ", localName, " = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://'))]}");
        break;
      case "contains":
        node.add("[contains(normalize-space(), ", normalizeArg(arg, name), ")]");
        break;
      case "icontains":
        node.add("[contains(", toLower(), ", ", translateToLower(normalizeArg(arg, name)), ")]");
        break;
      case "empty":
        str = "[not(*) and not(text())]";
        break;
      case "first-child":
        str = "[not(preceding-sibling::*)]";
        break;
      case "first":
        str = arg ? "[position() <= " + parseNumber(arg, name) + "]" : "[1]";
        break;
      case "first-of-type":
        owner = getOwner(node, name);
        node.add("[not(preceding-sibling::", owner, ")]");
        break;
      case "gt":
        node.add("[position() > ", parseNumber(arg, name), "]");
        break;
      case "lt":
        node.add("[position() < ", parseNumber(arg, name), "]");
        break;
      case "eq":
      case "nth":
        node.add("[", parseNumber(arg, name), "]");
        break;
      case "last-child":
        str = "[not(following-sibling::*)]";
        break;
      case "only-child":
        str = "[not(preceding-sibling::*) and not(following-sibling::*)]";
        break;
      case "only-of-type":
        owner = getOwner(node, name);
        node.add("[not(preceding-sibling::", owner, ") and not(following-sibling::", owner, ")]");
        break;
      case "text":
        str = "[@type='text']";
        break;
      case "starts-with":
        node.add("[starts-with(normalize-space(), ", normalizeArg(arg, name), ")]");
        break;
      case "istarts-with":
        node.add("[starts-with(", toLower(), ", ", translateToLower(normalizeArg(arg, name)), ")]");
        break;
      case "ends-with":
        str2 = normalizeArg(arg, name);
        node.add("[substring(normalize-space(), string-length(normalize-space()) - string-length(", str2, ") + 1) = ", str2, "]");
        break;
      case "iends-with":
        str2 = normalizeArg(arg, name);
        node.add("[substring(", toLower(), ", string-length(normalize-space()) - string-length(", str2, ") + 1) = ", translateToLower(str2), "]");
        break;
      case "is":
      case "matches":
        nd = node.clone();
        result = convertArgument(nd, arg, "self::", "self::node()", {
          predicate: true,
          name: name
        });
        addToNode(nd, "[" + result + "]");
        break;
      case "not":
        nd = node.clone();
        result = convertArgument(nd, arg, "self::", "self::node()", {
          name: name
        });
        if (result !== "self::node()") {
          if (nd.hasAxis('ancestor::')) {
            result = transform(nd);
          }
          addToNode(nd, "[not(" + result + ")]");
        }
        break;
      case "has":
        nd = node.clone();
        result = convertArgument(nd, arg, ".//", "", {
          name: name
        });
        addToNode(nd, "[" + result + "]");
        break;
      case "has-sibling":
        nd = node.clone();
        var precedings = convertArgument(nd, arg, "preceding-sibling::", "", {
          name: name
        });
        if (nd.hasAxis('ancestor::')) {
          precedings = transform(nd, "preceding-sibling::");
        }
        nd = node.clone();
        var followings = convertArgument(nd, arg, "following-sibling::", "", {
          name: name
        });
        if (nd.hasAxis('ancestor::')) {
          followings = transform(nd, "following-sibling::");
        }
        node.add("{[(", precedings, ") or (", followings, ")]}");
        break;
      case "has-parent":
        process("parent::");
        break;
      case "has-ancestor":
        nd = node.clone();
        result = convertArgument(nd, arg, "ancestor::", "", {
          name: name
        });
        addToNode(nd, "[" + result + "]");
        break;
      case "after":
        process("preceding::");
        break;
      case "after-sibling":
        process("preceding-sibling::");
        break;
      case "before":
        process("following::");
        break;
      case "before-sibling":
        process("following-sibling::");
        break;
      case "last":
        str = arg ? "[position() > last() - " + parseNumber(arg, name) + "]" : "[last()]";
        break;
      case "last-of-type":
        owner = getOwner(node, name);
        node.add("[not(following-sibling::", owner, ")]");
        break;
      case "skip":
        node.add("[position() > ", parseNumber(arg, name), "]");
        break;
      case "skip-first":
        node.add("[position() > ", arg ? parseNumber(arg, name) : "1", "]");
        break;
      case "skip-last":
        node.add("[position() < last()", arg ? " - (" + parseNumber(arg, name) + " - 1)" : "", "]");
        break;
      case "limit":
        node.add("[position() <= ", parseNumber(arg, name), "]");
        break;
      case "range":
        var splits = arg.split(',');
        if (splits.length !== 2) argumentException(pseudo + name + "(,)' is required two numbers");
        var start = parseNumber(splits[0]);
        var end = parseNumber(splits[1]);
        if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");
        node.add("[position() >= ", start, " and position() <= ", end, "]");
        break;
      case "target":
        str = "[starts-with(@href, '#')]";
        break;
      case "disabled":
        str = "[@disabled]";
        break;
      case "enabled":
        str = "[not(@disabled)]";
        break;
      case "selected":
        node.add("[", localName, " = 'option' and @selected]");
        break;
      case "checked":
        node.add("[(", localName, " = 'input' and (@type='checkbox' or @type='radio') or ", localName, " = 'option') and @checked]");
        break;
      default:
        parseException(pseudo + name + "' is not implemented");
        break;
    }
    if (str) node.add(str);
    function process(axis) {
      var nd = node.clone();
      var result = convertArgument(nd, arg, axis, "", {
        name: name
      });
      if (nd.hasAxis('ancestor::')) {
        result = transform(nd, axis);
      }
      addToNode(nd, "[" + result + "]");
    }
    function addToNode(nd, result) {
      node.add(nd.hasOr() ? "{" + result + "}" : result);
    }
  }
  function transform(node, axis) {
    var result = '';
    node.childNodes.forEach(function (classNode) {
      if (classNode.hasAxis('ancestor::')) {
        var str = '';
        var last = classNode.childNodes.length - 1;
        classNode.childNodes.forEach(function (nd, i) {
          if (i < last) {
            str += nd.toString();
          } else {
            nd.separator = '';
            if (axis) nd.axis = axis;
            str = nd.toString() + '[' + str + ']';
          }
        });
        result += str;
      } else {
        result += classNode.toString();
      }
    });
    return result;
  }
  function processNth(name, arg, not, parNode, node) {
    if (isNullOrWhiteSpace(arg)) argumentException("argument is empty or white space");
    var ofResult,
      owner = '*';
    if (name === "nth-child" || name === "nth-last-child") {
      var obj = checkOfSelector(name, arg, node);
      if (obj) {
        arg = obj.arg;
        owner = obj.owner;
        ofResult = obj.ofResult;
      }
    }
    arg = arg.replace(/\s+/g, '');
    if (!checkValidity(arg, not, name)) {
      return node;
    }
    var str = '',
      child = false,
      usePosition = false;
    switch (name) {
      case "nth-child":
        child = true;
        usePosition = !not;
        str = addNthToXpath(name, arg, 'preceding', owner, false, usePosition);
        break;
      case "nth-last-child":
        str = addNthToXpath(name, arg, 'following', owner, true, usePosition);
        break;
      case "nth-of-type":
        owner = getOwner(node, name);
        str = addNthToXpath(name, arg, 'preceding', owner, false, usePosition);
        break;
      case "nth-last-of-type":
        owner = getOwner(node, name);
        str = addNthToXpath(name, arg, 'following', owner, true, usePosition);
        break;
      default:
        parseException(pseudo + name + "' is not implemented");
        break;
    }
    if (!str) {
      if (ofResult) {
        node.add(ofResult);
      }
      return node;
    }
    if (usePosition && child) {
      var newNodeOwner = node.owner && node.owner !== "self::node()" ? node.owner : "*";
      node.owner = owner;
      node.add(str);
      node = newNode(parNode, node, "self::", "/");
      node.owner = newNodeOwner;
    } else {
      if (ofResult) {
        node.add(ofResult);
      }
      node.add(str);
    }
    return node;
  }
  function addNthToXpath(name, arg, sibling, owner, last, usePosition) {
    var str = '';
    if (/^\d+$/.test(arg)) {
      var num = parseInt(arg);
      str = addPosition(sibling, owner, {
        valueB: num,
        count: num - 1,
        comparison: " = "
      }, usePosition);
    } else if (arg === "odd") {
      str = addModulo(sibling, owner, ' + 1', 2, 1);
    } else if (arg === "even") {
      str = addModulo(sibling, owner, ' + 1', 2, 0);
    } else {
      var obj = parseFnNotation(arg, last);
      if (obj.valueA) {
        var _num = getNumber(obj.valueB);
        if (obj.type === 'mod') str = addModulo(sibling, owner, _num, obj.valueA, 0);else if (obj.type === 'pos') str = addPosition(sibling, owner, obj, usePosition);else if (obj.type === 'both') {
          str = addPosition(sibling, owner, obj, usePosition) + addModulo(sibling, owner, _num, obj.valueA, 0);
          str = str.replace('][', ' and ');
        }
      } else {
        str = addPosition(sibling, owner, obj, usePosition);
      }
    }
    return str;
  }
  function parseFnNotation(arg, last) {
    var rm = nthEquationReg.exec(arg);
    if (rm !== null) {
      var minus = rm[1] === '-',
        valueA = getValue(rm[1], rm[2], 1),
        valueB = getValue(rm[3], rm[4], 0),
        absA = Math.abs(valueA);
      var count = valueB - 1,
        comparison = last ? ' = ' : absA === 0 ? " = " : minus ? " <= " : " >= ",
        type = 'none';
      if (last) {
        if (minus) {
          if (rm[2] == null || absA >= valueB) comparison = " <= ";else if (absA !== 0 || valueB < 2) {
            comparison = " < ";
            count++;
          }
        } else if (absA !== 0) comparison = " >= ";
      }
      if (valueA === 0) type = 'pos';else if (!minus && valueB === 1) {
        if (absA > 1) type = 'mod';
      } else if (valueB > 0) {
        if (absA > 1) type = 'both';else type = 'pos';
      } else if (absA > 1) {
        type = 'mod';
      }
      return {
        valueA: absA,
        valueB: valueB,
        count: count,
        comparison: comparison,
        type: type
      };
    }
    regexException(0, "parseFnNotation", nthEquationReg, arg);
  }
  function addModulo(sibling, owner, num, mod, eq) {
    return "[(count(".concat(sibling, "-sibling::").concat(owner, ")").concat(num, ") mod ").concat(mod, " = ").concat(eq, "]");
  }
  function addPosition(sibling, owner, obj, usePosition) {
    if (usePosition) {
      return "[position()".concat(obj.comparison).concat(obj.valueB, "]");
    } else if (obj.count === 0 && /^<?=$/.test(obj.comparison.trim())) {
      return "[not(".concat(sibling, "-sibling::").concat(owner, ")]");
    } else {
      return "[count(".concat(sibling, "-sibling::").concat(owner, ")").concat(obj.comparison).concat(obj.count, "]");
    }
  }
  function getNumber(val) {
    var num = 1 - val;
    return num === 0 ? '' : (num < 0 ? ' - ' : ' + ') + Math.abs(num);
  }
  function getValue(sign, num, defaultVal) {
    var minus = sign && sign === '-' ? '-' : '';
    return num != null ? +(minus + num) : defaultVal;
  }
  function checkValidity(arg, not, name) {
    if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg)) {
      if (not) return false;
      argumentException(pseudo + name + '\' with these arguments yield no matches');
    }
    if (not && /^1?n(?:\+[01]|-\d+)?$/.test(arg)) {
      argumentException(pseudo + name + '\' with these arguments in \':not()\' yield no matches');
    }
    return true;
  }
  function checkOfSelector(name, arg, node) {
    var ofResult,
      owner = '*';
    var ofReg = / +of +(.+)$/,
      rm = ofReg.exec(arg);
    if (rm !== null) {
      var nd = node.clone();
      ofResult = convertArgument(nd, rm[1], '', "self::node()", {
        predicate: true,
        name: name
      });
      if (nd.childNodes.length === 1) {
        var classNode = nd.childNodes[0],
          firstChild = classNode.childNodes[0];
        if (firstChild.owner === "self::node()") {
          firstChild.owner = '';
          var result = "{" + classNode.toString() + "}";
          owner += result;
          ofResult = result;
        } else {
          owner = "{" + ofResult + "}";
          ofResult = "{[" + ofResult + "]}";
        }
      } else {
        ofResult = "{[" + ofResult + "]}";
        owner += ofResult;
      }
      return {
        arg: arg.replace(ofReg, ''),
        owner: owner,
        ofResult: ofResult
      };
    }
    return null;
  }
  function toLower(str) {
    str = str ? normalizeQuotes(str) : "normalize-space()";
    return translateToLower(str);
  }
  function translateToLower(str) {
    return "translate(" + str + ", 'ABCDEFGHJIKLMNOPQRSTUVWXYZ" + uppercase + "', 'abcdefghjiklmnopqrstuvwxyz" + lowercase + "')";
  }
  function normalizeArg(str, name) {
    if (!str) {
      argumentException(pseudo + name + "' has missing argument.");
    }
    str = normalizeQuotes(str, name);
    return "normalize-space(" + str + ")";
  }
  function normalizeQuotes(text, name) {
    text = text.replace(/\\(?=.)/g, '');
    if (text.includes("'")) {
      if (!text.includes("\"")) return '"' + text + '"';
      argumentException((name ? pseudo + name + "' string argument" : 'string') + " contains both '\"' and '\'' quotes");
    }
    return '\'' + text + '\'';
  }
  function parseNumber(str, name) {
    var num = parseInt(str);
    if (Number.isInteger(num)) return num;
    var msg = !str ? "' has missing argument" : "' argument '" + str + "' is not an integer";
    argumentException(pseudo + name + msg);
  }
  function getTagName(i, node) {
    tagNameReg.lastIndex = i;
    var rm = tagNameReg.exec(code);
    if (rm !== null) {
      var owner = rm[0].replace("|", ":").toLowerCase();
      if (node.owner === "*:") node.owner += owner;else node.owner = owner;
      return i + rm[0].length - 1;
    }
    regexException(i, 'getTagName', tagNameReg);
  }
  function getClassValue(i) {
    classIdReg.lastIndex = i;
    var rm = classIdReg.exec(code);
    if (rm !== null) {
      return [i + rm[0].length - 1, rm[0].replace(/^\\00003(?=\d+)/, '')];
    }
    regexException(i, 'getClassValue', classIdReg);
  }
  function getPseudoClass(i) {
    pseudoClassReg.lastIndex = i;
    var rm = pseudoClassReg.exec(code);
    if (rm !== null) {
      var name = rm[1];
      if (rm[2] != null) {
        var obj = getArgument(i + rm[0].length - 1, code, '(', ')');
        if (obj) {
          return [obj.index, name, obj.content];
        }
      }
      return [i + rm[0].length - 1, name, ''];
    }
    regexException(i, 'getPseudoClass', pseudoClassReg);
  }
  function getOwner(node, name) {
    var owner = node.owner !== "self::node()" ? node.owner : node.parentNode.parentNode.owner;
    if (name && owner == "*") parseException(pseudo + name + "' is required an element name; '*' is not implemented.");
    return owner;
  }
  function getAttributeName(i) {
    attrNameReg.lastIndex = i;
    var rm = attrNameReg.exec(code);
    if (rm !== null) {
      var name = rm[0].toLowerCase();
      return [i + rm[0].length - 1, name];
    }
    regexException(i, 'getAttributeName', attrNameReg);
  }
  function getAttributeValue(i) {
    attrValueReg.lastIndex = i;
    var rm = attrValueReg.exec(code);
    if (rm !== null) {
      var value, modifier;
      if (rm[1] != null) value = rm[1];else if (rm[2] != null) value = rm[2];else value = rm[3];
      if (rm[4] != null) modifier = rm[4].toLowerCase();
      return [i + rm[0].length - 1, value, modifier];
    }
    regexException(i, "getAttributeValue", attrValueReg);
  }
  function normalizeWhiteSpaces(text) {
    var leftChars = ",>+=~^!:([";
    var rightChars = ",>+=~^!$]()";
    code = text;
    length = code.length;
    var addSpace = false,
      unresolved = false;
    var prev_ch = '\0';
    var sb = [];
    for (var i = 0; i < length; i++) {
      var ch = code[i];
      if (ch === ' ' || /\s/.test(ch)) {
        if (unresolved) continue;
        if (addSpace) {
          if (leftChars.includes(prev_ch)) {
            addSpace = false;
            unresolved = false;
          } else {
            unresolved = true;
          }
        }
      } else if (ch === '\\') {
        if (i + 1 >= length || /\s/.test(code[i + 1])) {
          characterException(i, ch, "Non-escape character", code);
        }
        sb.push(ch);
        sb.push(code[++i]);
      } else if (ch === '/' && nextChar(i, '*')) {
        i += 2;
        var k = findEnd(i, ch, true);
        if (k === -1) sb.push("/*");else i = k;
      } else if (ch === '"' || ch === '\'') {
        var _k = findEnd(i, ch, false);
        if (_k !== -1) {
          sb.push(code.substring(i, _k + 1));
          i = _k;
        } else {
          characterException(i, ch, "function normalizeWhiteSpaces()", code);
        }
        addSpace = true;
        prev_ch = ch;
      } else {
        if (unresolved && !rightChars.includes(ch) && !(ch === '*' && nextChar(i, '='))) {
          sb.push(' ');
        }
        sb.push(ch);
        addSpace = true;
        unresolved = false;
        prev_ch = ch;
      }
    }
    function findEnd(i, ch, comment) {
      while (++i < length) {
        if (code[i] === ch) {
          if (comment && code[i - 1] !== '*') continue;
          return i;
        }
      }
      return -1;
    }
    return sb.join('');
  }
  function getArgument(i, text, open, close) {
    var first = true,
      start = i,
      n = 0;
    for (; i < text.length; i++) {
      var ch = text[i];
      if (first) {
        if (ch === open) {
          n++;
          start = i + 1;
        }
        first = false;
      } else if (ch === '"' || ch === '\'') {
        while (++i < text.length && text[i] !== ch);
        if (i >= text.length) characterException(i, ch, "function getArgument()", text);
      } else {
        if (ch === open) n++;else if (ch === close && --n === 0) {
          return {
            index: i,
            content: getStringContent(text.substring(start, i))
          };
        }
      }
    }
    return null;
  }
  function getStringContent(text) {
    var len = text.length;
    if (len > 1) {
      var start = text[0],
        end = text[len - 1];
      if (start === '\'' && end === '\'' || start === '"' && end === '"') {
        if (len > 2) text = text.substr(1, len - 2);
      }
    }
    return text;
  }
  function nextChar(i, ch) {
    return i + 1 < length && code[i + 1] === ch;
  }
  function isNullOrWhiteSpace(arg) {
    return arg == null || !arg.trim();
  }
  function addWarning(text) {
    if (!opt.consoleUse && !warning.includes(text)) {
      warning += text;
    }
  }
  function printError(message) {
    if (typeof opt.printError === 'function') {
      opt.printError(message);
    }
  }
  function parseException(message) {
    printError(message);
    throw new ParserError(code, position + 1, message);
  }
  function argumentException(message) {
    printError(message);
    throw new ParserError(code, "?", message);
  }
  function characterException(i, ch, message, code) {
    var text = message + ". Unexpected character '<b>" + ch + "</b>'\nposition <b>" + (i + 1) + "</b>\nstring - '<b>" + code + "</b>'";
    printError(text);
    message = message + ". Unexpected character '" + ch + "'";
    throw new ParserError(code, i + 1, message);
  }
  function regexException(i, fn, reg, arg) {
    var str = arg || code.substring(i);
    var text = "function - <b>" + fn + "()</b>\nError - RegExp failed to match the string:\nstring - '<b>" + str + "</b>'\nRegExp - '<b>" + reg + "</b>'";
    printError(text);
    var message = "function " + fn + "() - RegExp '" + reg + "' failed to match the string '" + str + "'";
    throw new ParserError(code, i + 1, message);
  }

  return toXPath;

}));
