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
    this.parentNode = node;
    this.previousNode;
    this.childNodes;
    this.content;
    this.addChild = function (nd) {
      if (!this.childNodes) this.childNodes = [];
      this.childNodes.push(nd);
    };
    this.add = function () {
      var str = '',
        forbid = false;
      for (var i = 0; i < arguments.length; i++) {
        if (i === arguments.length - 1 && typeof arguments[i] === 'boolean') forbid = true;else str += arguments[i];
      }
      if (!this.content) this.content = [];
      this.content.push({
        str: str,
        forbid: forbid
      });
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
          var len = this.content.length;
          if (len === 1) {
            text += this.or ? this.content[0].str : '[' + removeBrackets(this.content[0].str) + ']';
          } else {
            var join = false;
            for (var i = 0; i < len; i++) {
              var obj = this.content[i],
                str = removeBrackets(obj.str),
                last = i + 1 === len;
              if (!obj.forbid) {
                text += (join ? ' and ' : '[') + str;
                if (i + 1 < len && !this.content[i + 1].forbid) {
                  text += last ? ']' : '';
                  join = true;
                } else {
                  text += ']';
                  join = false;
                }
              } else {
                text += '[' + str + ']';
                join = false;
              }
            }
          }
        }
      }
      if (this.childNodes) {
        this.childNodes.forEach(function (node) {
          text += node.toString(text);
        });
      }
      function removeBrackets(str) {
        return str.replace(/\x01\[((?:[^"'\x01\x02]|"[^"]*"|'[^']*')+)\]\x02/g, '$1');
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
  var precedingSibling = "preceding-sibling::";
  var followingSibling = "following-sibling::";
  var ancestor = "ancestor::";
  var navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";
  var opt, warning, error, uppercase, lowercase, stack, code, position, length;
  function toXPath(selector, options) {
    checkSelector(selector);
    opt = _extends({}, {
      axis: './/',
      consoleUse: false,
      standard: false,
      removeXPathSpaces: false,
      uppercaseLetters: '',
      lowercaseLetters: '',
      postprocess: true,
      translate: true,
      debug: false
    }, options);
    warning = '';
    error = '';
    stack = [];
    var node = new xNode();
    var xpath;
    var normalized;
    try {
      uppercase = opt.uppercaseLetters ? opt.uppercaseLetters.trim() : '';
      lowercase = opt.lowercaseLetters ? opt.lowercaseLetters.trim() : '';
      if (uppercase.length !== lowercase.length) {
        argumentException("Custom letters have different length");
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
      argumentException("\':" + argInfo.name + '()\' has missing argument');
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
      var array = xpath.split(/(?<!\| *)(\bself::node\(\)\[)/g);
      xpath = '';
      for (var i = 0; i < array.length; i++) {
        if (array[i] === "self::node()[") {
          var str = array[i + 1],
            obj = parseArgument(0, "[" + str, true, "[", "]");
          if (obj) {
            var content = obj.content,
              end = str.substr(obj.index);
            if (!hasOr(content) && !(/^(?:\[| *\|)/.test(end) && !content.endsWith("]"))) {
              xpath += content + end;
              i++;
            } else {
              xpath += array[i];
            }
          }
        } else {
          xpath += array[i];
        }
      }
      xpath = xpath.replace(/([[(])\{((?:[^'"{}]|"[^"]*"|'[^']*')+)\}([\])])/g, '$1$2$3');
      xpath = xpath.replace(/([/:])\*\[self::(\w+)(\[(?:[^"'[\]]|"[^"]*"|'[^']*')+\])?\]/g, "$1$2$3");
      xpath = xpath.replace(/\/child::/g, '/');
    }
    xpath = xpath.replace(/(?:[^'"{}]|"[^"]*"|'[^']*')+|([{}])/g, function (m, gr) {
      return gr ? gr === "{" ? "(" : ")" : m;
    });
    return xpath;
  }
  function hasOr(xpath) {
    var reg = /(?:[^'" ]|"[^"]*"|'[^']*')+|( or )/g;
    var rm;
    while (rm = reg.exec(xpath)) {
      if (rm[1]) return true;
    }
    return false;
  }
  function convert(rootNode, selector, axis, owner, argumentInfo) {
    checkSelector(selector);
    var unitNode = newNode(rootNode, null);
    var node = newNode(unitNode, null);
    var name = argumentInfo ? argumentInfo.name : '';
    var predicate = argumentInfo && argumentInfo.predicate;
    var not = name === 'not';
    var attrName = null,
      attrValue = null,
      modifier = null,
      operation = null,
      state = State.Text,
      check = false,
      first = true,
      value,
      i = -1,
      ch = code[0];
    code = selector;
    length = code.length;
    if (/^[,(]/.test(code) || !name && /^[>+~^!]/.test(ch)) exception();
    if (/[.#[:>+~^!]$/.test(code)) {
      ch = code[length - 1];
      exception(length);
    }
    while (++i < length) {
      position = i;
      ch = code[i];
      if (state === State.Text) {
        if (check && !/[>+~^!.#*:|[@a-zA-Z]/.test(ch) || !check && !/[ ,>+~^!.#*:|[@a-zA-Z]/.test(ch)) {
          characterException(i, ch, getState(state) + ", check=" + check, code);
        }
        if (argumentInfo && /!?[+~]/.test(ch) && name.endsWith('-sibling')) {
          argumentException('\'' + name + '()\' with these arguments has no implementation');
        }
        if (/[.#:[]/.test(ch) || name !== "has" && node.previousNode && /[>+~^!]/.test(ch)) {
          addAxes(axis, node, argumentInfo);
          addOwner(owner, node);
        }
        switch (ch) {
          case '.':
            var str = '';
            do {
              var _parseClassValue = parseClassValue(i + 1);
              var _parseClassValue2 = _slicedToArray(_parseClassValue, 2);
              i = _parseClassValue2[0];
              value = _parseClassValue2[1];
              str += getClass('@class', normalizeQuotes(' ' + value + ' '));
              classIdReg.lastIndex = i + 2;
              if (nextChar(i, '.') && classIdReg.test(code)) {
                str += " and ";
              } else break;
            } while (++i < length);
            node.add(str);
            check = false;
            break;
          case '#':
            var _parseClassValue3 = parseClassValue(i + 1);
            var _parseClassValue4 = _slicedToArray(_parseClassValue3, 2);
            i = _parseClassValue4[0];
            value = _parseClassValue4[1];
            node.add("@id=", normalizeQuotes(value));
            check = false;
            break;
          case '>':
            if (not) node = addNode(unitNode, node, "parent::");else node = newNode(unitNode, node, "child::", "/");
            check = true;
            break;
          case '+':
            if (not) node = addTwoNodes(unitNode, node, precedingSibling, "*", "1");else node = addTwoNodes(unitNode, node, followingSibling, "*", "1");
            check = true;
            break;
          case '~':
            if (not) node = addNode(unitNode, node, precedingSibling);else node = newNode(unitNode, node, followingSibling, "/");
            check = true;
            break;
          case '^':
            if (not) node = addNode(unitNode, node, "parent::", notSibling(precedingSibling));else node = addTwoNodes(unitNode, node, "child::", "*", "1");
            check = true;
            break;
          case '!':
            if (nextChar(i, '^')) {
              if (not) node = addNode(unitNode, node, "parent::", notSibling(followingSibling));else node = addTwoNodes(unitNode, node, "child::", "*", "last()");
              i++;
            } else if (nextChar(i, '+')) {
              if (not) node = addTwoNodes(unitNode, node, followingSibling, "*", "1");else node = addTwoNodes(unitNode, node, precedingSibling, "*", "1");
              i++;
            } else if (nextChar(i, '>')) {
              if (not) node = addNode(unitNode, node, "child::");else node = newNode(unitNode, node, "parent::", "/");
              i++;
            } else if (nextChar(i, '~')) {
              if (not) node = addNode(unitNode, node, followingSibling);else node = newNode(unitNode, node, precedingSibling, "/");
              i++;
            } else {
              if (not) node = addNode(unitNode, node, "descendant-or-self::");else node = newNode(unitNode, node, "ancestor-or-self::", "/");
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
            if (nextChar(i, ':')) exception(1);
            state = State.PseudoClass;
            break;
          case ',':
            if (i + 1 >= length) exception();
            unitNode = newNode(rootNode, unitNode);
            unitNode.or = true;
            unitNode.add(predicate ? " or " : " | ");
            unitNode = newNode(rootNode, unitNode);
            node = newNode(unitNode, null, argumentInfo ? "" : axis);
            check = true;
            break;
          case '@':
            var _parseAttribute = parseAttribute(i, axis, argumentInfo, unitNode, node);
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
                node = newNode(unitNode, node, ancestor, " and ");
              } else if (['has-parent', 'before', 'after'].includes(name) || name.endsWith('-sibling')) {
                if (!node.previousNode) {
                  node.axis = ancestor;
                  node.separator = '';
                }
                node = newNode(unitNode, node, ancestor, " and ");
              } else if (name === 'not' && node.axis === 'self::') {
                if (node.previousNode && node.previousNode.axis === ancestor) {
                  node.separator = ' and ';
                }
                node.and = true;
                node = addNode(unitNode, node, ancestor);
              } else {
                node = newNode(unitNode, node, null, "//");
              }
            } else {
              node = newNode(unitNode, node, null, "//");
            }
            check = true;
            break;
          case '|':
            if (nextChar(i, '|')) {
              exception(1);
            } else {
              var _parseNamespace = parseNamespace(i, axis, first, unitNode, node);
              var _parseNamespace2 = _slicedToArray(_parseNamespace, 2);
              i = _parseNamespace2[0];
              node = _parseNamespace2[1];
            }
            check = false;
            break;
          case '\\':
            i++;
            break;
          default:
            if (/[a-zA-Z]/.test(ch)) {
              if (node.owner) {
                exception();
              }
              addAxes(axis, node, argumentInfo);
              i = parseTagName(i, node);
            } else {
              exception();
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
              exception();
            }
            break;
          case ']':
            if (!attrName) parseException("attrName is null or empty.'");
            node.add("@" + attrName);
            state = State.Text;
            check = false;
            break;
          case ' ':
            break;
          default:
            var _parseAttributeName = parseAttributeName(i);
            var _parseAttributeName2 = _slicedToArray(_parseAttributeName, 2);
            i = _parseAttributeName2[0];
            value = _parseAttributeName2[1];
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
            exception();
            break;
          case ' ':
            break;
          default:
            if (attrValue) {
              parseException("attrValue '" + attrValue + "' is already parse: " + code.substr(i));
            }
            var _parseAttributeValue = parseAttributeValue(i);
            var _parseAttributeValue2 = _slicedToArray(_parseAttributeValue, 3);
            i = _parseAttributeValue2[0];
            attrValue = _parseAttributeValue2[1];
            modifier = _parseAttributeValue2[2];
            break;
        }
      } else if (state === State.PseudoClass) {
        var _name = '',
          arg = '';
        var _parsePseudoClass = parsePseudoClass(i);
        var _parsePseudoClass2 = _slicedToArray(_parsePseudoClass, 3);
        i = _parsePseudoClass2[0];
        _name = _parsePseudoClass2[1];
        arg = _parsePseudoClass2[2];
        if (_name === "root") {
          node.owner = node.separator = '';
          node.axis = '//';
          node = newNode(unitNode, node, "ancestor-or-self::");
          node.owner = "*";
          node.add("last()");
        } else {
          addOwner(owner, node);
          if (_name.startsWith("nth-")) {
            processNth(_name, arg, argumentInfo, node);
          } else {
            processPseudoClass(_name, arg, not, node);
          }
        }
        state = State.Text;
        check = false;
      }
    }
    var result = rootNode.toString();
    if (check || state !== State.Text) {
      parseException("Something is wrong: '" + getState(state) + "', selector='" + code + "', xpath='" + result + "'");
    }
    function exception(offset) {
      characterException(i + (offset || 0), ch, getState(state), code);
    }
    return result;
  }
  function getState(state) {
    return "State." + Object.keys(State)[state];
  }
  function newNode(unitNode, node, axis, separator) {
    var nd = new xNode(unitNode);
    unitNode.addChild(nd);
    nd.previousNode = node;
    nd.axis = axis || '';
    if (separator && node.owner) nd.separator = separator;
    return nd;
  }
  function addNode(unitNode, node, axis, content) {
    if (node.owner === "node()") node.owner = "*";
    node.axis = axis;
    var nd = newNode(unitNode, node, "self::", "/");
    if (content) nd.add(content);
    return nd;
  }
  function addTwoNodes(unitNode, node, axis, owner, content) {
    var nd = newNode(unitNode, node, axis, "/");
    nd.owner = owner;
    nd.add(content, true);
    return newNode(unitNode, nd, "self::", "/");
  }
  function addAxes(axis, node, argumentInfo) {
    if (!axis || node.axis || axis === "self::" && !argumentInfo) return;
    var text = node.parentNode.toString().trim(),
      len = text.length;
    if (len == 0 || endByOr(text)) {
      node.axis = axis;
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
        if (endByOr(text)) {
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
  function endByOr(text) {
    return /(?: or|\|)$/.test(text);
  }
  function parseNamespace(i, axis, first, unitNode, node) {
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
          node.add("not(contains(name(), ':'))");
        } else {
          node.owner += ":*";
        }
        i++;
      } else if (i + 1 < length && /[a-zA-Z]/.test(code[i + 1])) {
        var nd = newNode(unitNode, node, "self::", "/");
        nd.owner = "*";
        return [i, nd];
      } else {
        node.owner = "*:";
        addWarning(navWarning);
      }
    }
    return [i, node];
  }
  function parseAttribute(i, axis, argumentInfo, unitNode, node) {
    var text = node.parentNode.toString().trim();
    if (text.length === 0) {
      if (argumentInfo) axis = "";
    } else if (endByOr(text)) {
      axis = "";
    } else {
      var ch = text[text.length - 1];
      if (ch !== ':' && ch !== '/') axis = "/";else axis = "";
    }
    attributeReg.lastIndex = i + 1;
    var rm = attributeReg.exec(code);
    if (rm !== null) {
      var nd = newNode(unitNode, node, axis);
      nd.add("@", rm[0].replace('|', ':').toLowerCase());
      return [i + rm[0].length, nd];
    }
    regexException(i, 'parseAttribute', attributeReg);
  }
  function processAttribute(attrName, attrValue, operation, modifier, node) {
    if (!attrValue.trim()) {
      if (operation === "=") {
        node.add("@", attrName, " = ''");
      } else if (operation === "!=") {
        node.add("{not(@", attrName, ") or @", attrName, " != ''}");
      } else if (operation === "|=") {
        node.add("@", attrName, " = ''");
      } else {
        node.add("false()", true);
      }
      return;
    }
    var ignoreCase = modifier === "i" || attrName === 'lang' || attrName === 'type' && getOwner(node) == "input";
    if (!opt.standard && attrName === "class") {
      processClass(attrValue, operation, ignoreCase, node);
      return;
    }
    var attr = ignoreCase ? translateToLower("@" + attrName) : "@" + attrName;
    var value = ignoreCase ? toLower(attrValue) : normalizeQuotes(attrValue);
    switch (operation) {
      case "=":
        node.add(attr, " = ", value);
        break;
      case "!=":
        node.add("{not(@", attrName, ") or ", attr, "!=", value, "}");
        break;
      case "~=":
        node.add("contains(concat(' ', normalize-space(", attr, "), ' '), concat(' ', normalize-space(", value, "), ' '))");
        break;
      case "|=":
        var value2 = ignoreCase ? "concat(" + value + ", '-')" : normalizeQuotes(attrValue + '-');
        node.add("{", attr, " = ", value, " or starts-with(", attr, ", ", value2, ")}");
        break;
      case "^=":
        node.add("starts-with(", attr, ", ", value, ")");
        break;
      case "$=":
        node.add(endsWith(attr, "@" + attrName, normalizeQuotes(attrValue), value));
        break;
      case "*=":
        node.add("contains(", attr, ", ", value, ")");
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
      node.add("{not(", attrName, ") or not(", getClass(attrName, attributeValue), ")}");
    } else if (operation === "*=") {
      node.add("contains(", attrName, ", ", attributeValue, ")");
    } else if (operation === "|=") {
      var attrValue1 = ignoreCase ? toLower(' ' + attrValue + ' ') : normalizeQuotes(' ' + attrValue + ' ');
      var attrValue2 = ignoreCase ? toLower(' ' + attrValue + '-') : normalizeQuotes(' ' + attrValue + '-');
      node.add("{", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "}");
    } else {
      node.add(getClass(attrName, attributeValue));
    }
  }
  function getClass(attrName, attributeValue) {
    return "contains(concat(' ', normalize-space(".concat(attrName, "), ' '), ").concat(attributeValue, ")");
  }
  function processPseudoClass(name, arg, not, node) {
    var nd,
      result,
      owner,
      str = '',
      val,
      localName = 'local-name()';
    switch (name) {
      case "any-link":
        node.add("(", localName, " = 'a' or ", localName, " = 'area') and @href");
        break;
      case "external":
        node.add("(", localName, " = 'a' or ", localName, " = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://'))");
        break;
      case "contains":
        node.add("contains(normalize-space(), ", normalizeString(arg, name), ")");
        break;
      case "icontains":
        node.add("contains(", toLower(), ", ", normalizeArg(arg), ")");
        break;
      case "empty":
        node.add("not(*) and not(text())");
        break;
      case "dir":
        val = normalizeQuotes(arg);
        var dft = /ltr/.test(val);
        node.add(dft ? "{not(ancestor-or-self::*[@dir]) or " : "", "ancestor-or-self::*[@dir][1][@dir = ", val, "]", dft ? "}" : "");
        break;
      case "first-child":
        node.add(notSibling(precedingSibling));
        break;
      case "first":
        if (not) node.add(arg ? getNot(precedingSibling, " <= ") : notSibling(precedingSibling));else node.add(arg ? "position() <= " + parseNumber(arg, name) : "1", !arg);
        break;
      case "first-of-type":
        owner = getOwner(node, name);
        node.add(notSibling(precedingSibling, owner));
        break;
      case "gt":
        if (not) node.add(getNot(precedingSibling, " > "));else node.add("position() > ", parseNumber(arg, name));
        break;
      case "lt":
        if (not) node.add(getNot(precedingSibling, " <= "));else node.add("position() < ", parseNumber(arg, name));
        break;
      case "eq":
      case "nth":
        if (not) node.add(getNot(precedingSibling, " = "));else node.add(parseNumber(arg, name));
        break;
      case "last-child":
        node.add(notSibling(followingSibling));
        break;
      case "only-child":
        node.add("not(", precedingSibling, "*) and not(", followingSibling, "*)");
        break;
      case "only-of-type":
        owner = getOwner(node, name);
        node.add("not(", precedingSibling, owner, ") and not(", followingSibling, owner, ")");
        break;
      case "text":
        node.add("@type='text'");
        break;
      case "starts-with":
        node.add("starts-with(normalize-space(), ", normalizeString(arg, name), ")");
        break;
      case "istarts-with":
        node.add("starts-with(", toLower(), ", ", normalizeArg(arg), ")");
        break;
      case "ends-with":
        str = normalizeString(arg, name);
        node.add(endsWith("normalize-space()", "normalize-space()", str, str));
        break;
      case "iends-with":
        str = normalizeArg(arg);
        node.add(endsWith(toLower(), "normalize-space()", normalizeString(arg, name), str));
        break;
      case "is":
      case "matches":
        nd = node.clone();
        result = convertArgument(nd, arg, "self::", "node()", {
          predicate: true,
          name: name
        });
        node.add(result);
        break;
      case "not":
        nd = node.clone();
        result = convertArgument(nd, arg, "self::", "node()", {
          name: name
        });
        if (result !== "self::node()") {
          result = transformNot(nd);
          node.add("not(" + result + ")");
        }
        break;
      case "has":
        nd = node.clone();
        result = convertArgument(nd, arg, ".//", null, {
          name: name
        });
        node.add(result);
        break;
      case "has-sibling":
        nd = node.clone();
        var precedings = convertArgument(nd, arg, precedingSibling, null, {
          name: name
        });
        if (nd.hasAxis(ancestor)) {
          precedings = transform(nd, precedingSibling);
        }
        nd = node.clone();
        var followings = convertArgument(nd, arg, followingSibling, null, {
          name: name
        });
        if (nd.hasAxis(ancestor)) {
          followings = transform(nd, followingSibling);
        }
        node.add("{(", precedings, ") or (", followings, ")}");
        break;
      case "has-parent":
        process("parent::");
        break;
      case "has-ancestor":
        nd = node.clone();
        result = convertArgument(nd, arg, ancestor, null, {
          name: name
        });
        node.add(result);
        break;
      case "after":
        process("preceding::");
        break;
      case "after-sibling":
        process(precedingSibling);
        break;
      case "before":
        process("following::");
        break;
      case "before-sibling":
        process(followingSibling);
        break;
      case "last":
        if (not) node.add(arg ? getNot(followingSibling, " <= ") : notSibling(followingSibling));else node.add(arg ? "position() > last() - " + parseNumber(arg, name) + "" : "last()", !arg);
        break;
      case "last-of-type":
        owner = getOwner(node, name);
        node.add(notSibling(followingSibling, owner));
        break;
      case "skip":
        if (not) node.add(getNot(precedingSibling, " > "));else node.add("position() > ", parseNumber(arg, name));
        break;
      case "skip-first":
        if (not) node.add(arg ? getNot(precedingSibling, " > ") : notSibling(precedingSibling));else node.add("position() > ", arg ? parseNumber(arg, name) : "1", !arg);
        break;
      case "skip-last":
        if (not) node.add(arg ? getNot(followingSibling, " > ") : notSibling(followingSibling));else node.add("position() < last()", arg ? " - " + (parseNumber(arg, name) - 1) : "");
        break;
      case "limit":
        if (not) node.add(getNot(precedingSibling, " <= "));else node.add("position() <= ", parseNumber(arg, name));
        break;
      case "lang":
        str = processLang(name, arg);
        if (str) node.add("{", str, "}");
        break;
      case "range":
        var splits = arg.split(',');
        if (splits.length !== 2) argumentException(pseudo + name + "(,)' is required two numbers");
        var start = parseNumber(splits[0], name);
        var end = parseNumber(splits[1], name);
        if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");
        if (not) {
          str = addCount(precedingSibling, "*", {
            count: start - 1,
            comparison: " >= "
          }) + " and ";
          str += addCount(precedingSibling, "*", {
            count: end - 1,
            comparison: " <= "
          });
          node.add(str);
        } else {
          node.add("position() >= ", start, " and position() <= ", end);
        }
        break;
      case "target":
        node.add("starts-with(@href, '#')");
        break;
      case "disabled":
        node.add("@disabled");
        break;
      case "enabled":
        node.add("not(@disabled)");
        break;
      case "selected":
        node.add(localName, " = 'option' and @selected");
        break;
      case "checked":
        node.add("(", localName, " = 'input' and (@type='checkbox' or @type='radio') or ", localName, " = 'option') and @checked");
        break;
      default:
        parseException(pseudo + name + "' is not implemented");
        break;
    }
    function process(axis) {
      var nd = node.clone();
      var result = convertArgument(nd, arg, axis, null, {
        name: name
      });
      if (nd.hasAxis(ancestor)) {
        result = transform(nd, axis);
      }
      node.add(result);
    }
    function getNot(sibling, comparison) {
      return addCount(sibling, "*", {
        count: parseNumber(arg, name) - 1,
        comparison: comparison
      });
    }
    function normalizeArg(arg) {
      var text = normalizeString(arg, name);
      return opt.translate ? translateToLower(text) : text;
    }
  }
  function processLang(name, arg) {
    var lang = translateToLower("@lang", true),
      array = arg.split(',');
    var result = "";
    for (var i = 0; i < array.length; i++) {
      if (i > 0) result += " or ";
      result += "ancestor-or-self::*[@lang][1][";
      var rm = /^([a-z]+\b|\*)(?:-([a-z]+\b|\*))?(?:-([^-]+))?/i.exec(getStringContent(array[i].trim()));
      if (rm) {
        if (rm[1] === "*") {
          if (isText(rm[2])) {
            result += containOrEnd(rm[2] + (isText(rm[3]) ? "-" + rm[3] : ""));
          } else if (isText(rm[3])) {
            result += containOrEnd(rm[3]);
          } else {
            return "";
          }
        } else if (rm[2] === "*") {
          var val = normalize(rm[1] + "-");
          if (isText(rm[3])) {
            result += "starts-with(" + lang + ", " + val + ") and (" + containOrEnd(rm[3]) + ")";
          } else {
            result += equalOrStart(rm[1]);
          }
        } else {
          var text = rm[1] + (rm[2] ? "-" + rm[2] : "") + (isText(rm[3]) ? "-" + rm[3] : "");
          result += equalOrStart(text);
        }
        result += "]";
      } else {
        argumentException(pseudo + name + "()' has wrong argument(s)");
      }
    }
    function isText(gr) {
      return gr && gr !== "*";
    }
    function equalOrStart(text) {
      var val = normalize(text);
      return lang + " = " + val + " or starts-with(" + lang + ", concat(" + val + ", '-'))";
    }
    function containOrEnd(text) {
      var val = normalize("-" + text + "-");
      var val2 = normalize("-" + text);
      return "contains(substring(" + lang + ", string-length(substring-before(" + lang + ", " + val + "))), " + val + ") or " + endsWith(lang, "@lang", val2, val2);
    }
    function normalize(text) {
      text = normalizeQuotes(text, name);
      return opt.translate ? translateToLower(text, true) : text;
    }
    return result;
  }
  function endsWith(str, str2, str3, str4) {
    return "substring(" + str + ", string-length(" + str2 + ") - (string-length(" + str3 + ") - 1)) = " + str4;
  }
  function transformNot(node) {
    var result = '';
    node.childNodes.forEach(function (unitNode) {
      if (unitNode.childNodes) {
        var str = '',
          end = '',
          hit = false;
        for (var r = unitNode.childNodes.length - 1; r >= 0; r--) {
          var nd = unitNode.childNodes[r];
          if (!hit) {
            if (nd.separator) {
              hit = true;
              nd.separator = '';
            }
            str += nd.toString();
          } else {
            nd.separator = '';
            str += '[' + nd.toString();
            end += ']';
          }
        }
        result += str + end;
      } else {
        result += unitNode.toString();
      }
    });
    return result;
  }
  function transform(node, axis) {
    var result = '';
    node.childNodes.forEach(function (unitNode) {
      if (unitNode.hasAxis(ancestor)) {
        var str = '';
        var last = unitNode.childNodes.length - 1;
        unitNode.childNodes.forEach(function (nd, i) {
          if (i < last) {
            str += nd.toString();
          } else {
            nd.axis = axis;
            nd.separator = '';
            str = nd.toString() + '[' + str + ']';
          }
        });
        result += str;
      } else {
        result += unitNode.toString();
      }
    });
    return result;
  }
  function processNth(name, arg, info, node) {
    checkSelector(arg);
    var ofResult,
      owner = '*',
      str = '';
    if (name === "nth-child" || name === "nth-last-child") {
      var obj = checkOfSelector(name, arg, node);
      if (obj) {
        arg = obj.arg;
        owner = obj.owner;
        ofResult = obj.ofResult;
        if (!ofResult) node.owner = owner;
      }
    }
    arg = arg.replace(/\s+/g, '');
    if (!checkValidity(arg, info, name)) {
      return;
    }
    switch (name) {
      case "nth-child":
        str = addNthToXpath(name, arg, precedingSibling, owner, false);
        break;
      case "nth-last-child":
        str = addNthToXpath(name, arg, followingSibling, owner, true);
        break;
      case "nth-of-type":
        owner = getOwner(node, name);
        str = addNthToXpath(name, arg, precedingSibling, owner, false);
        break;
      case "nth-last-of-type":
        owner = getOwner(node, name);
        str = addNthToXpath(name, arg, followingSibling, owner, true);
        break;
      default:
        parseException(pseudo + name + "' is not implemented");
        break;
    }
    if (ofResult) node.add(ofResult, true);
    if (str) node.add(str);
  }
  function addNthToXpath(name, arg, sibling, owner, last) {
    var str = '';
    if (/^\d+$/.test(arg)) {
      var num = parseInt(arg);
      str = addCount(sibling, owner, {
        count: num - 1,
        comparison: " = "
      });
    } else if (arg === "odd") {
      str = addModulo(sibling, owner, ' + 1', 2, 1);
    } else if (arg === "even") {
      str = addModulo(sibling, owner, ' + 1', 2, 0);
    } else {
      var obj = parseFnNotation(arg, last);
      if (obj.valueA) {
        var _num = getNumber(obj.valueB);
        if (obj.type === 'mod') str = addModulo(sibling, owner, _num, obj.valueA, 0);else if (obj.type === 'cnt') str = addCount(sibling, owner, obj);else if (obj.type === 'both') {
          str = addCount(sibling, owner, obj) + " and " + addModulo(sibling, owner, _num, obj.valueA, 0);
        }
      } else {
        str = addCount(sibling, owner, obj);
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
      if (valueA === 0) type = 'cnt';else if (!minus && valueB === 1) {
        if (absA > 1) type = 'mod';
      } else if (valueB > 0) {
        if (absA > 1) type = 'both';else type = 'cnt';
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
    return "(count(".concat(sibling).concat(owner, ")").concat(num, ") mod ").concat(mod, " = ").concat(eq);
  }
  function addCount(sibling, owner, obj) {
    if (obj.count === 0 && /^<?=$/.test(obj.comparison.trim())) {
      return notSibling(sibling, owner);
    } else {
      return "count(".concat(sibling).concat(owner, ")").concat(obj.comparison).concat(obj.count);
    }
  }
  function notSibling(sibling, owner) {
    return "not(".concat(sibling).concat(owner || "*", ")");
  }
  function getNumber(val) {
    var num = 1 - val;
    return num === 0 ? '' : (num < 0 ? ' - ' : ' + ') + Math.abs(num);
  }
  function getValue(sign, num, defaultVal) {
    var minus = sign && sign === '-' ? '-' : '';
    return num != null ? +(minus + num) : defaultVal;
  }
  function checkValidity(arg, info, name) {
    var not = info && info.name === 'not',
      msg = '\' with these arguments yield no matches';
    if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg)) {
      if (not) return false;
      argumentException(pseudo + name + msg);
    }
    if (not && /^1?n(?:\+[01]|-\d+)?$/.test(arg)) {
      argumentException(pseudo + name + msg + ' in \':not()\'');
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
      ofResult = convertArgument(nd, rm[1], "self::", "node()", {
        predicate: true,
        name: name
      });
      var result = '';
      nd.childNodes.forEach(function (unitNode) {
        var str = unitNode.toString();
        if (unitNode.childNodes) {
          var firstChild = unitNode.childNodes[0];
          if (firstChild.owner === "node()") {
            firstChild.axis = '';
            firstChild.owner = '';
            result += "\x01" + unitNode.toString() + "\x02";
          } else {
            result += str;
          }
        } else {
          result += str;
        }
      });
      if (result !== ofResult) ofResult = result;
      owner += "[" + ofResult + "]";
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
    return opt.translate ? translateToLower(str) : str;
  }
  function translateToLower(str, asii) {
    var letters = 'abcdefghjiklmnopqrstuvwxyz';
    return "translate(" + str + ", '" + letters.toUpperCase() + (asii ? "" : uppercase) + "', '" + letters + (asii ? "" : lowercase) + "')";
  }
  function normalizeString(str, name) {
    if (!str) {
      argumentException(pseudo + name + "' has missing argument");
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
  function parseTagName(i, node) {
    tagNameReg.lastIndex = i;
    var rm = tagNameReg.exec(code);
    if (rm !== null) {
      var owner = rm[0].replace("|", ":").toLowerCase();
      if (node.owner === "*:") node.owner += owner;else node.owner = owner;
      return i + rm[0].length - 1;
    }
    regexException(i, 'parseTagName', tagNameReg);
  }
  function parseClassValue(i) {
    classIdReg.lastIndex = i;
    var rm = classIdReg.exec(code);
    if (rm !== null) {
      return [i + rm[0].length - 1, rm[0].replace(/^\\00003(?=\d+)/, '')];
    }
    regexException(i, 'parseClassValue', classIdReg);
  }
  function parsePseudoClass(i) {
    pseudoClassReg.lastIndex = i;
    var rm = pseudoClassReg.exec(code);
    if (rm !== null) {
      var name = rm[1];
      if (rm[2] != null) {
        var obj = parseArgument(i + rm[0].length - 1, code, name === "lang", "(", ")");
        if (obj) {
          return [obj.index, name, obj.content];
        }
      }
      return [i + rm[0].length - 1, name, ''];
    }
    regexException(i, 'parsePseudoClass', pseudoClassReg);
  }
  function getOwner(node, name) {
    var owner = node.owner !== "node()" ? node.owner : node.parentNode.parentNode.owner;
    if (name && owner == "*") parseException(pseudo + name + "' is required an element name; '*' is not implemented.");
    return owner;
  }
  function parseAttributeName(i) {
    attrNameReg.lastIndex = i;
    var rm = attrNameReg.exec(code);
    if (rm !== null) {
      var name = rm[0].toLowerCase();
      return [i + rm[0].length - 1, name];
    }
    regexException(i, 'parseAttributeName', attrNameReg);
  }
  function parseAttributeValue(i) {
    attrValueReg.lastIndex = i;
    var rm = attrValueReg.exec(code);
    if (rm !== null) {
      var value, modifier;
      if (rm[1] != null) value = rm[1];else if (rm[2] != null) value = rm[2];else value = rm[3];
      if (rm[4] != null) modifier = rm[4].toLowerCase();
      return [i + rm[0].length - 1, value, modifier];
    }
    regexException(i, "parseAttributeValue", attrValueReg);
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
        sb.push(ch, code[++i]);
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
  function parseArgument(i, text, original, open, close) {
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
        if (i >= text.length) characterException(i, ch, "function parseArgument()", text);
      } else {
        if (ch === open) n++;else if (ch === close && --n === 0) {
          var str = text.substring(start, i);
          return {
            index: i,
            content: original ? str : getStringContent(str)
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
  function checkSelector(arg) {
    if (arg == null || !arg.trim()) argumentException("argument is null or white space");
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
    var str = "Unexpected character '",
      text = (opt.debug ? message + ". " : "") + str + "<b>" + ch + "</b>'\nposition <b>" + (i + 1) + "</b>\nstring - '<b>" + code + "</b>'";
    printError(text);
    throw new ParserError(code, i + 1, message + str + ch + "'");
  }
  function regexException(i, fn, reg, arg) {
    var str = arg || code.substr(i),
      msg = " failed to match the string: ";
    var text = '';
    if (opt.debug) {
      text = "function - <b>".concat(fn, "()</b>\nRegExp").concat(msg, "'<b>").concat(str, "</b>'\nRegExp - '<b>").concat(reg, "</b>'");
    } else {
      text = "Error of ".concat(fn.replace(/\B([A-Z])/g, function (m, gr) {
        return ' ' + gr.toLowerCase();
      }).replace('parse', 'parsing'), "\nString: '<b>").concat(str, "</b>'");
    }
    printError(text);
    var message = "function ".concat(fn, "() - RegExp '").concat(reg, "'").concat(msg, "'").concat(str, "'");
    throw new ParserError(code, i + 1, message);
  }

  return toXPath;

}));


const cssSelectors={CssToXPath:{paths:["CssToXPath.html"],selectors:["*:has-parent(div[id])","*:has-sibling(div[id])","*:nth-child(-n+3 of li.noted)","*:has-sibling(div[id], ul[id])","*:has-ancestor(div[id]):not(div)","  li:nth-child(  -3n  +  4  )   ","*:nth-last-child(-n+3 of li.noted)","a:is([name], [href])","a:not(li.c1 a, p a)","article p:only-of-type","article p:first-of-type","article em:last-of-type","article div:only-of-type","article>div>em:last-of-type","article div[class]:last-of-type","b:not(ul > :nth-child(2n) b)","b:not(ul > li:nth-of-type(2n) b)","b:not(ul > :nth-last-child(2n) b)","b:not(ul > li:nth-last-of-type(2n) b)","body[lang|=EN]",":dir(rtl)","div.content","div>*:only-child","div > span:dir(ltr)","div + p:nth-child(2)","div ~ p:nth-child(2)","div > p:nth-child(2)","div + div > :dir(ltr)","div + p:nth-last-child(1)","div ~ p:nth-last-child(1)","div > p:nth-last-child(1)","div[id]:has-sibling(div:empty)","div ul[id=list] > li:range(2, 5)","div:contains('Test')","div:empty","div:first-child","div:has(h1, h2)","div:has(>ul, >p)","div:has(+div[id])","div:has(h1, :not(h2, p, :empty))","div:has(+ div:has(> p, ~ :empty))","div:has(h1, h2, p, li):not([id^=list])","div:has(+ div:has(> h1, > p, + :empty))","div:has(p):last-child:contains('XPath')","div:has(h1, h2, .nested):not(:has(li))/*excluded .nested*/","div:has-ancestor(main)","div:has-parent(main)","div:last-child","div:not(h1, h2)","div:not(:has(#lists)):not(:has(ul))","div:not(:has-ancestor(#lists), :has(h2), :contains('Content'))","div:starts-with('Test')",":is(ol,ul) :is(ol,ul) ol",":is(p, li):has-ancestor(div, ul[id])",":is(p, h1, li):has-parent(div, ul[id])","li !> ul","li:not(:first)","li:not(:last(4))","li:not(:first(4))","li:not(ul[id] :gt(4))","li:not(ul[id] > :lt(4))","li:not(:nth-child(odd of .noted))","li:not(div:first div > ul :last(3))","li:not(div:first div > ul :first(3))","li:not(:nth-last-child(odd of .noted))","li:not(body div:first div > ul :range(2, 4))","li:nth-child(even of .noted)","li:nth-child(-n+3 of li.noted)","li:nth-child(even of :not(.noted))","li:nth-last-child(even of .noted)","li:nth-last-child(-n+3 of li.noted)","li:nth-last-child(even of :not(.noted))","li:nth-last-child(even of :not(.noted ~ li))","main > div[id=lists]",":not(div + p)",":not(div > p)",":not(div ~ p)",":not(div ^ p)",":not(p ! div)",":not(p !+ div)",":not(p !> div)",":not(p !~ div)",":not(div !^ p)",":not(.p3 span)",":not(p ! div b)",":not(:dir(rtl))",":not(div p span)",":not(div + p span)",":not(div > p span)",":not(div ~ p span)",":not(div ^ p span)",":not(p !> div span)",":not(div !^ p span)",":not(li:range(2, 5))",":not([class] span + b)",":not(div !~ p span > b)",":not(div  p > span, p b)",":not(div > div + p > span)",":not(div ~ div > :dir(ltr))",":not(div > [class] span + b)",":not(:has(div + p:nth-last-child(1)))",":nth-child(even of p)",":nth-child(even of li, p)",":nth-last-child(even of p)",":nth-last-child(even of li, p)",":nth-child(even of :not(.noted ~ li))",":nth-child(even of :not(.noted > span))",":nth-child(even of :not(.noted + li span))",":nth-last-child(even of :not(.noted > span))",":nth-last-child(even of :not(.noted + li span))","p + *","p.p4 ~ *","p.p2 !> *","p.p4 !~ *","p[class=p2]","p[class^=p2]","p[class$=p2]","p[class~=p2]","p[class*=p2]","p[class|=p2]","p.es\\'cap\\'ed","p.es\\{cap\\}ed","p#es\\'cap\\'ed","p#es\\{cap\\}ed","p[id$=cap\\}ed]","p[id~=1escaped]","p[id*=\\'cap\\']","p.\\000031escaped","p#\\000031escaped","p[id|=\\#escaped]","p[class$=cap\\}ed]","p[class~=1escaped]","p[class*=\\'cap\\']","p[id=es\\'cap\\'ed]","p[class|=\\#escaped]","p[class=es\\'cap\\'ed]","p:after(h2)","p:after(ul ul.c1 ul.c2)","p:before(h2)","p:before(ul ul.c1 ul.c2)","p:ends-with('XPath convertor')","p:nth-child(3)","p:nth-child(odd)","p:nth-child(even)","p:nth-last-child(3)","p:nth-last-child(odd)","p:nth-last-child(even)","p:nth-last-of-type(3)","p:nth-last-of-type(odd)","p:nth-last-of-type(even)","p:nth-of-type(3)","p:nth-of-type(odd)","p:nth-of-type(even)",":root","ul","ul[id] ^ li ~ li","ul > li:first + *","ul > li:last !+ *","ul[id] > li:lt(4)","ul[id]>li:skip(4)","ul[id] !^ li !~ li","ul li:nth-child(3)","ul>li[title$='One']","ul[id]>li:skip-last","ul>li[title^='Item']","ul>li[title*='Item']","ul[id]>li:skip-first","ul[id] > li:limit(5)","ul li:nth-child(odd)","ul li:nth-child(n+3)","ul li:nth-child(n+4)","ul li:nth-of-type(3)","ul li:nth-child(even)","ul li:nth-child(3n+2)","ul li:nth-child(-n+4)","ul li:nth-child(5n-2)","ul[id]>li:skip-last(3)","ul li:nth-child(-3n+4)","ul li:nth-of-type(odd)","ul li:nth-of-type(n+3)","ul li:nth-of-type(n+4)","ul[id] > li:not(:gt(4))","ul[id]>li:skip-first(2)","ul li:nth-last-child(3)","ul li:nth-of-type(even)","ul li:nth-of-type(3n+2)","ul li:nth-of-type(3n-2)","ul li:nth-of-type(-n+4)","ul[id='list'] > li:gt(4)","ul[id] > li:not(:nth(3))","ul[id] li:not(:limit(4))","ul li:nth-of-type(-3n+4)","ul[id] > li:not(:skip(4))","ul[id] li:not(:skip-last)","ul li:nth-last-child(odd)","ul li:nth-last-child(n+3)","ul li:nth-last-child(n+4)","ul li:nth-last-of-type(3)","ul[id] li:not(:skip-first)","ul li:nth-last-child(even)","ul li:nth-last-child(3n+2)","ul li:nth-last-child(-n+4)","ul li:nth-last-child(5n-2)","ul li:nth-last-child(-3n+4)","ul li:nth-last-of-type(n+3)","ul li:nth-last-of-type(n+4)","ul>li[title*='em Twenty On']","ul li:nth-last-of-type(3n+2)","ul li:nth-last-of-type(3n-2)","ul li:nth-last-of-type(-n+4)","ul li:nth-last-of-type(-3n+4)","ul[id] > li:not(:skip-last(3))","ul[id] > li:not(:skip-first(2))","ul[id] > li:not(div ul > :last(3))","ul[id] > li:eq(4), ul[id]>li:nth(5)","ul  >  li[  title  =  'item one'  i  ]","ul:first > li:first","ul:first li:first(3)","ul:first>li:not(.c1, .c2, .c6, .c7)","ul:first  >   li:not(  .c1  , .c2,   .c6, .c7   )","ul:last > li:last","ul:last li:last(3)","body[lang|=En i]","div[class='diV' i]","div[class*='iv' i]","div > p:lang(en-us)","div[class!='div' i]","div[class|='last' i]","div + div > :lang(fr)","div [class^='emph' i]","div [class$='size' i]","div[class~='parent' i]","div:icontains('content')","div:istarts-with('TEST')",":lang(en)",":lang('*-*-*')",":lang('*', fr)",":not(:lang(de-latn, 'fr'))",":not(div + div > :lang(fr))","p:iends-with('xpath Convertor')","p:lang('*-fr')","p:lang(fr-latn)","p:lang('*-latn')","p:lang('*-*-fr')","p:lang('fr-*-*')","p:lang('fr-*-fr')","ul>li[title$='one' i]","ul>li[title~='two' i]","ul>li[title^='item' i]","ul>li[title='item one' i]","ul>li[title*='em twenty on' i]"]},CssSelector:{paths:["CssSelector.html"],selectors:["*","*:empty","#-a-b-c-","*:last-child","*:only-child","*[class$=it]","*:first-child","*:nth-child(2)","*[class*=heck]","*[class^=check]","*:nth-child(-n+3)","*:nth-child(-n+3 of span.this)","a","a+span","a+ span","a +span","a + span","a + span, div > p","body",".checkit","dd:nth-child(1)>div:nth-child(3)>div:nth-child(1)>a","div p","div a","div>p","div> p","div >p","div p a","div div","div > p","div[id]","div#myDiv","div ~ form","div .ohyeah","div > * > *","div > p.ohyeah","div:has(p)","div:has(> p)","div:has(p + p)","form input","head p",":is(div, section) > h1","#myDiv","#myDiv *","#myDiv>*","#myDiv :nth-last-child(2)",":nth-child(2)",":nth-last-child(2)",".omg.ohyeah","p","p > *","p.ohyeah","p.hiclass,a","p.hiclass, a","p.hiclass ,a","p.hiclass , a","p[class!='hiclass']","p:first-child","p:has(+ p)","p:last-child","p:nth-child(2)","p:only-child","section:has(:not(h1, h2, h3, h4, h5, h6))","section:not(:has(h1, h2, h3, h4, h5, h6))","#someOtherDiv>*","span.this:nth-child(-n+3)","span:is(.this, .that)","span:nth-child(even)","span:nth-child(10n-1) ","span:nth-child(10n+1) ","span:nth-last-child(3)","span:nth-last-child(2)","#theBody #myDiv","#theBody>#myDiv","#theBody #whatwhatwhat","#theBody>#someOtherDiv","#whatwhatwhat #someOtherDiv","*[style*='display: none' i],*[style*='display:none' i]","input[type='text']","input[type='TEXT']"]},CssSelector2:{paths:["CssSelector2.html"],selectors:["a[href][lang][class]","div","div p","div > p","div + p","div ~ p","div p a","div, p, a","div #title","div[class]","div.example","div[class*=e]","div[class^=exa]","div[class$=mple]","div[class=example]","div[class|=dialog]","div[class!=made_up]","div[class~=example]","div.example, div.note","div[class^=exa][class$=mple]","div:not(.example)","h1#title","h1#title + div > p","h1[id]:contains(Selectors)",".note","p:contains(selectors)","p:first-child","p:last-child","p:nth-child(n)","p:nth-child(2n)","p:nth-child(odd)","p:nth-child(even)","p:nth-child(2n+1)","p:only-child","#title","ul .tocline2","ul.toc li.tocline2","ul.toc > li.tocline2"]},CssW3CSelector:{paths:["CssW3CSelector.html"],selectors:["*.t1","*:root","[hidden]","[type~=odd]",".\\000035cm","[type~=match]",".5cm","address","address.t5.t5","address[title=foo]","address[title~=foo]","address:empty","address:first-of-type","address:last-of-type","address:not(:last-of-type)","address:not(:first-of-type)","#Aone#Atwo,#Aone#Athree,#Atwo#Athree",".bar","blockquote+div~p","blockquote~div+p","blockquote > div p","blockquote + div p","blockquote div > p",".control","div","div.t1 p","div p.test","div.stub p+p","div.stub p~p","div.stub > *","div.stub *:not(.foo)","div.stub *:not(#foo)","div.stub *:not([title*=' on'])","div.stub *:not([title$='tait'])","div.stub *:not([title^='si on'])","div:not(.t1)","dl","dl > *:not(:nth-of-type(3n+1))","dl > *:not(:nth-last-of-type(3n+1))","#foo",".green","li","li,p","li.t2","li#t2","li#t3","line","line:nth-child(3n-1)","line:nth-last-of-type(3n-1)","line:nth-of-type(odd)","main p:only-of-type, main i[name]:only-of-type","ol li:nth-child(2n+0)","ol > li:not(:nth-child(even))","p","p.t1","p.t2","p.t1.t2","p[title]","p[class~=b]","p[lang|=en]","p[title^=foo]","p[title$=bar]","p[title*=bar]","p *:last-child","p *:first-child","p > *:not(:last-child)","p:not(:target)","p:not(:not(p))","p:not(:only-child)","p:not(:nth-of-type(3))","p:not(:nth-last-of-type(3))","p:not(#other).class:not(.fail).test#id#id","p:only-child","#pass#pass",".red",".t1","#t1",".t1 td:last-child",".t1 td:first-child",".t1 td:not(:last-child)",".t1 td:not(:first-child)",".t1 *:not(address:only-of-type)","table.t1 td","table.t1 td,table.t2 td","table.t2 td:nth-child(3n+1)","table.t1 tr:nth-child(-1n+4)","table.t2 td:not(:nth-child(3n+1))","table.t1 tr:not(:nth-child(-1n+4))","#test","#test1","#test1:empty","#test2","#test2:empty",".text","#two:first-child","ul,p","ul li:nth-child(2n+1)","ul > li:not(:nth-child(odd))",".warning",".white","address[lang=fi]"]},"nth-child":{paths:["nth.html"],selectors:["p[class]:nth-child(3n)","p[class]:nth-child(5n)","p[class]:nth-child(n+1)","p[class]:nth-child(n+2)","p[class]:nth-child(n-3)","p[class]:nth-child(n-4)","p[class]:nth-child(odd)","p[class]:nth-child(1n+5)","p[class]:nth-child(1n-0)","p[class]:nth-child(1n-2)","p[class]:nth-child(2n-0)","p[class]:nth-child(2n-1)","p[class]:nth-child(2n-2)","p[class]:nth-child(3n+5)","p[class]:nth-child(3n-2)","p[class]:nth-child(3n-3)","p[class]:nth-child(4n+4)","p[class]:nth-child(5n+2)","p[class]:nth-child(-n+4)","p[class]:nth-child(-0n+2)","p[class]:nth-child(-0n+4)","p[class]:nth-child(-1n+2)","p[class]:nth-child(-1n+3)","p[class]:nth-child(-2n+2)","p[class]:nth-child(-2n+5)","p[class]:nth-child(-3n+2)","p[class]:nth-child(-3n+3)","p[class]:nth-child(-3n+4)","p[class]:nth-child(-4n+1)","p[class]:nth-child(-4n+2)","p[class]:nth-child(-5n+5)","p:nth-child(4)","p:nth-child(2n)","p:nth-child(n+0)","p:nth-child(n+5)","p:nth-child(n-2)","p:nth-child(n-3)","p:nth-child(0n+1)","p:nth-child(1n+2)","p:nth-child(1n-3)","p:nth-child(2n-3)","p:nth-child(2n-4)","p:nth-child(2n-5)","p:nth-child(3n-2)","p:nth-child(4n+0)","p:nth-child(4n-4)","p:nth-child(5n+0)","p:nth-child(5n+2)","p:nth-child(even)","p:nth-child(-n+2)","p:nth-child(-n+3)","p:nth-child(-0n+1)","p:nth-child(-0n+2)","p:nth-child(-2n+1)","p:nth-child(-2n+4)","p:nth-child(-3n+1)","p:nth-child(-3n+2)","p:nth-child(-3n+5)","p:nth-child(-4n+5)","p:nth-child(-5n+4)"]},"nth-child-of-selector":{paths:["nth-child-of-selector.html"],selectors:["li.c1:nth-child(3)","li.c1:nth-child(3n+2)","li:not(:nth-child(2n+3 of li))","li:not(:nth-child(-1n+4 of .c1))","li:not(:nth-child(-2n+3 of .c1))","li:not(:nth-child(0n+1 of li, p))","li:not(:nth-child(1n+3 of li, p))","li:not(:nth-child(2n-2 of li.c2))","li:not(:nth-child(3n-3 of li, p))","li:not(:nth-child(3n-3 of li.c2))","li:not(:nth-child(4n+4 of li, p))","li:not(:nth-child(5n-4 of li, p))","li:not(:nth-child(-0n+3 of p.c2))","li:not(:nth-child(1n+3 of .c2, .c1))","li:not(:nth-child(-1n+2 of li.c1, p.c1))","li:nth-child(2 of .c1)","li:nth-child(n-5 of li)","li:nth-child(1n-4 of li)","li:nth-child(4n+1 of li)","li:nth-child(4n-4 of li)","li:nth-child(5n-1 of li)","li:nth-child(n-5 of .c1)","li:nth-child(2n-0 of .c1)","li:nth-child(3n+4 of .c1)","li:nth-child(4n+0 of .c1)","li:nth-child(5n-5 of .c1)","li:nth-child(-2n+2 of .c1)","li:nth-child(-5n+2 of .c1)","li:nth-child(1n+0 of li.c2)","li:nth-child(2n+3 of li.c2)","li:nth-child(4n-0 of li.c2)","li:nth-child(4n-1 of li.c2)",":not(:nth-child(4 of li, p))",":not(:nth-child(4n+3 of .c1))",":not(:nth-child(-0n+4 of .c1))",":not(:nth-child(3 of .c2, .c1))",":not(:nth-child(4n+0 of li.c2))",":not(:nth-child(4n-2 of li.c2))",":not(:nth-child(even of li, p))",":nth-child(n-4 of .c1)",":nth-child(2n-0 of .c1)",":nth-child(5n+0 of .c1)",":nth-child(5n-0 of .c1)",":nth-child(n+5 of li, p)",":nth-child(1 of .c2, .c1)",":nth-child(4n+4 of li, p)",":nth-child(4n+5 of li, p)",":nth-child(-3n+1 of p.c2)",":nth-child(-3n+2 of p.c2)",":nth-child(-5n+2 of p.c2)",":nth-child(1n-5 of .c2, .c1)",":nth-child(-0n+4 of li.c1, p.c1)",":nth-child(-5n+2 of li.c1, p.c1)","p.c1:nth-child(2)","p.c1:nth-child(-1n+1)","p:not(:nth-child(4n of li, p))","p:not(:nth-child(n+2 of li.c2))","p:not(:nth-child(4n+5 of .c2, .c1))","p:not(:nth-child(-0n+2 of li.c1, p.c1))","p:not(:nth-child(-5n+1 of li.c1, p.c1))"]},"nth-last-child":{paths:["nth.html"],selectors:["p[class]:nth-last-child(3n)","p[class]:nth-last-child(5n)","p[class]:nth-last-child(n+1)","p[class]:nth-last-child(n+2)","p[class]:nth-last-child(n-3)","p[class]:nth-last-child(n-4)","p[class]:nth-last-child(odd)","p[class]:nth-last-child(1n+5)","p[class]:nth-last-child(1n-0)","p[class]:nth-last-child(1n-2)","p[class]:nth-last-child(2n-0)","p[class]:nth-last-child(2n-1)","p[class]:nth-last-child(2n-2)","p[class]:nth-last-child(3n+5)","p[class]:nth-last-child(3n-2)","p[class]:nth-last-child(3n-3)","p[class]:nth-last-child(4n+4)","p[class]:nth-last-child(5n+2)","p[class]:nth-last-child(-n+4)","p[class]:nth-last-child(-0n+2)","p[class]:nth-last-child(-0n+4)","p[class]:nth-last-child(-1n+2)","p[class]:nth-last-child(-1n+3)","p[class]:nth-last-child(-2n+2)","p[class]:nth-last-child(-2n+5)","p[class]:nth-last-child(-3n+2)","p[class]:nth-last-child(-3n+3)","p[class]:nth-last-child(-3n+4)","p[class]:nth-last-child(-4n+1)","p[class]:nth-last-child(-4n+2)","p[class]:nth-last-child(-5n+5)","p:nth-last-child(4)","p:nth-last-child(2n)","p:nth-last-child(n+0)","p:nth-last-child(n+5)","p:nth-last-child(n-2)","p:nth-last-child(n-3)","p:nth-last-child(0n+1)","p:nth-last-child(1n+2)","p:nth-last-child(1n-3)","p:nth-last-child(2n-3)","p:nth-last-child(2n-4)","p:nth-last-child(2n-5)","p:nth-last-child(3n-2)","p:nth-last-child(4n+0)","p:nth-last-child(4n-4)","p:nth-last-child(5n+0)","p:nth-last-child(5n+2)","p:nth-last-child(even)","p:nth-last-child(-n+2)","p:nth-last-child(-n+3)","p:nth-last-child(-0n+1)","p:nth-last-child(-0n+2)","p:nth-last-child(-2n+1)","p:nth-last-child(-2n+4)","p:nth-last-child(-3n+1)","p:nth-last-child(-3n+2)","p:nth-last-child(-3n+5)","p:nth-last-child(-4n+5)","p:nth-last-child(-5n+4)"]},"nth-last-child-of-selector":{paths:["nth-child-of-selector.html"],selectors:["li.c1:nth-last-child(1n-5)","li.c1:nth-last-child(4n-4)","li:not(:nth-child(2n-2 of li))","li:not(:nth-child(-4n+1 of .c1))","li:not(:nth-child(2n+1 of li.c2))","li:not(:nth-child(3n+4 of li.c2))","li:not(:nth-child(4n+4 of li, p))","li:not(:nth-last-child(4n of li))","li:not(:nth-child(4n-5 of .c2, .c1))","li:not(:nth-last-child(3n-3 of .c1))","li:not(:nth-last-child(even of .c1))","li:not(:nth-last-child(-n+1 of .c1))","li:not(:nth-last-child(-n+4 of .c1))","li:not(:nth-last-child(-5n+3 of p.c2))","li:not(:nth-last-child(2n+4 of .c2, .c1))","li:nth-last-child(4 of .c1)","li:nth-last-child(3n-5 of li)","li:nth-last-child(4n+4 of li)","li:nth-last-child(1n-5 of .c1)","li:nth-last-child(4n-5 of .c1)","li:nth-last-child(-3n+1 of .c1)","li:nth-last-child(3n+3 of li.c2)","li:nth-last-child(5n-2 of li.c2)",":not(:nth-child(1n+3 of .c1))",":not(:nth-child(-n+1 of p.c2))",":not(:nth-child(-n+3 of p.c2))",":not(:nth-child(2n-4 of li.c2))",":not(:nth-child(5n+2 of li.c2))",":not(:nth-last-child(5 of .c1))",":not(:nth-last-child(4n+5 of li))",":not(:nth-last-child(n+4 of .c1))",":not(:nth-last-child(-n+3 of .c1))",":not(:nth-last-child(-n+4 of .c1))",":not(:nth-last-child(3n+3 of li, p))",":not(:nth-last-child(2n-4 of .c2, .c1))",":not(:nth-last-child(-1n+2 of li.c1, p.c1))",":nth-last-child(3 of .c1)",":nth-last-child(3n-2 of .c1)",":nth-last-child(3n-3 of .c1)",":nth-last-child(5n-5 of .c1)",":nth-last-child(4n+5 of li, p)",":nth-last-child(n-3 of .c2, .c1)",":nth-last-child(3n-1 of .c2, .c1)",":nth-last-child(5n+1 of .c2, .c1)",":nth-last-child(5n+4 of .c2, .c1)",":nth-last-child(-0n+1 of :not(.c1))",":nth-last-child(-0n+5 of li.c1, p.c1)",":nth-last-child(-4n+3 of li.c1, p.c1)","p.c1:nth-last-child(-n+1)","p.c1:nth-last-child(-5n+5)","p:not(:nth-child(3n of .c1))","p:not(:nth-child(1 of li.c2))","p:not(:nth-child(3n+0 of li))","p:not(:nth-child(4n+1 of li))","p:not(:nth-child(n+5 of .c1))","p:not(:nth-child(3n-1 of .c2, .c1))","p:not(:nth-child(5n+4 of .c2, .c1))","p:not(:nth-last-child(4n+3 of .c1))","p:not(:nth-last-child(-5n+4 of .c1))","p:not(:nth-last-child(-2n+3 of li.c1, p.c1))"]},"nth-of-type":{paths:["nth.html"],selectors:["p[class]:nth-of-type(2)","p[class]:nth-of-type(n)","p[class]:nth-of-type(1n)","p[class]:nth-of-type(n+5)","p[class]:nth-of-type(n-3)","p[class]:nth-of-type(odd)","p[class]:nth-of-type(0n+1)","p[class]:nth-of-type(0n+5)","p[class]:nth-of-type(1n-0)","p[class]:nth-of-type(1n-5)","p[class]:nth-of-type(2n+5)","p[class]:nth-of-type(2n-3)","p[class]:nth-of-type(2n-5)","p[class]:nth-of-type(3n+1)","p[class]:nth-of-type(3n-2)","p[class]:nth-of-type(3n-3)","p[class]:nth-of-type(3n-4)","p[class]:nth-of-type(3n-5)","p[class]:nth-of-type(4n+3)","p[class]:nth-of-type(4n-1)","p[class]:nth-of-type(4n-2)","p[class]:nth-of-type(4n-3)","p[class]:nth-of-type(4n-5)","p[class]:nth-of-type(5n+3)","p[class]:nth-of-type(5n-3)","p[class]:nth-of-type(5n-5)","p[class]:nth-of-type(-n+1)","p[class]:nth-of-type(-n+2)","p[class]:nth-of-type(-1n+2)","p[class]:nth-of-type(-1n+5)","p[class]:nth-of-type(-3n+4)","p[class]:nth-of-type(-4n+4)","p[class]:nth-of-type(-5n+1)","p:nth-of-type(3)","p:nth-of-type(4)","p:nth-of-type(5)","p:nth-of-type(n+0)","p:nth-of-type(n+3)","p:nth-of-type(n+4)","p:nth-of-type(0n+2)","p:nth-of-type(1n+5)","p:nth-of-type(1n-0)","p:nth-of-type(1n-1)","p:nth-of-type(2n+0)","p:nth-of-type(2n+1)","p:nth-of-type(2n-1)","p:nth-of-type(2n-4)","p:nth-of-type(3n+2)","p:nth-of-type(3n-2)","p:nth-of-type(4n+0)","p:nth-of-type(4n-3)","p:nth-of-type(5n+2)","p:nth-of-type(5n-0)","p:nth-of-type(-n+2)","p:nth-of-type(-0n+1)","p:nth-of-type(-0n+3)","p:nth-of-type(-1n+1)","p:nth-of-type(-2n+1)","p:nth-of-type(-2n+4)","p:nth-of-type(-4n+3)"]},"nth-last-of-type":{paths:["nth.html"],selectors:["p[class]:nth-last-of-type(2)","p[class]:nth-last-of-type(n)","p[class]:nth-last-of-type(1n)","p[class]:nth-last-of-type(n+5)","p[class]:nth-last-of-type(n-3)","p[class]:nth-last-of-type(odd)","p[class]:nth-last-of-type(0n+1)","p[class]:nth-last-of-type(0n+5)","p[class]:nth-last-of-type(1n-0)","p[class]:nth-last-of-type(1n-5)","p[class]:nth-last-of-type(2n+5)","p[class]:nth-last-of-type(2n-3)","p[class]:nth-last-of-type(2n-5)","p[class]:nth-last-of-type(3n+1)","p[class]:nth-last-of-type(3n-2)","p[class]:nth-last-of-type(3n-3)","p[class]:nth-last-of-type(3n-4)","p[class]:nth-last-of-type(3n-5)","p[class]:nth-last-of-type(4n+3)","p[class]:nth-last-of-type(4n-1)","p[class]:nth-last-of-type(4n-2)","p[class]:nth-last-of-type(4n-3)","p[class]:nth-last-of-type(4n-5)","p[class]:nth-last-of-type(5n+3)","p[class]:nth-last-of-type(5n-3)","p[class]:nth-last-of-type(5n-5)","p[class]:nth-last-of-type(-n+1)","p[class]:nth-last-of-type(-n+2)","p[class]:nth-last-of-type(-1n+2)","p[class]:nth-last-of-type(-1n+5)","p[class]:nth-last-of-type(-3n+4)","p[class]:nth-last-of-type(-4n+4)","p[class]:nth-last-of-type(-5n+1)","p:nth-last-of-type(3)","p:nth-last-of-type(4)","p:nth-last-of-type(5)","p:nth-last-of-type(n+0)","p:nth-last-of-type(n+3)","p:nth-last-of-type(n+4)","p:nth-last-of-type(0n+2)","p:nth-last-of-type(1n+5)","p:nth-last-of-type(1n-0)","p:nth-last-of-type(1n-1)","p:nth-last-of-type(2n+0)","p:nth-last-of-type(2n+1)","p:nth-last-of-type(2n-1)","p:nth-last-of-type(2n-4)","p:nth-last-of-type(3n+2)","p:nth-last-of-type(3n-2)","p:nth-last-of-type(4n+0)","p:nth-last-of-type(4n-3)","p:nth-last-of-type(5n+2)","p:nth-last-of-type(5n-0)","p:nth-last-of-type(-n+2)","p:nth-last-of-type(-0n+1)","p:nth-last-of-type(-0n+3)","p:nth-last-of-type(-1n+1)","p:nth-last-of-type(-2n+1)","p:nth-last-of-type(-2n+4)","p:nth-last-of-type(-4n+3)"]},"not-nth-child":{paths:["not-nth.html"],selectors:["p[class]:not(:nth-child(2))","p[class]:not(:nth-child(5))","p[class]:not(:nth-child(3n))","p[class]:not(:nth-child(odd))","p[class]:not(:nth-child(-4n))","p[class]:not(:nth-child(0n-1))","p[class]:not(:nth-child(0n-2))","p[class]:not(:nth-child(0n-3))","p[class]:not(:nth-child(1n+5))","p[class]:not(:nth-child(2n+3))","p[class]:not(:nth-child(2n+4))","p[class]:not(:nth-child(4n+1))","p[class]:not(:nth-child(4n-3))","p[class]:not(:nth-child(5n+1))","p[class]:not(:nth-child(5n-0))","p[class]:not(:nth-child(-n+2))","p[class]:not(:nth-child(-n+4))","p[class]:not(:nth-child(-0n+1))","p[class]:not(:nth-child(-0n-3))","p[class]:not(:nth-child(-0n-5))","p[class]:not(:nth-child(-1n+0))","p[class]:not(:nth-child(-1n+2))","p[class]:not(:nth-child(-1n+3))","p[class]:not(:nth-child(-1n+4))","p[class]:not(:nth-child(-2n+0))","p[class]:not(:nth-child(-2n-5))","p[class]:not(:nth-child(-3n+4))","p[class]:not(:nth-child(-3n-1))","p[class]:not(:nth-child(-4n-1))","p[class]:not(:nth-child(-5n+2))","p[class]:not(:nth-child(-5n-5))","p:not(:nth-child(4))","p:not(:nth-child(-0n))","p:not(:nth-child(0n-0))","p:not(:nth-child(0n-4))","p:not(:nth-child(0n-5))","p:not(:nth-child(1n+3))","p:not(:nth-child(2n-2))","p:not(:nth-child(3n-1))","p:not(:nth-child(4n+2))","p:not(:nth-child(4n-4))","p:not(:nth-child(5n-0))","p:not(:nth-child(-n+1))","p:not(:nth-child(-n-0))","p:not(:nth-child(-0n+0))","p:not(:nth-child(-0n+5))","p:not(:nth-child(-1n+0))","p:not(:nth-child(-1n+2))","p:not(:nth-child(-1n+5))","p:not(:nth-child(-1n-2))","p:not(:nth-child(-1n-4))","p:not(:nth-child(-2n+2))","p:not(:nth-child(-2n+5))","p:not(:nth-child(-3n+0))","p:not(:nth-child(-3n+3))","p:not(:nth-child(-3n+4))","p:not(:nth-child(-4n+3))","p:not(:nth-child(-5n+3))","p:not(:nth-child(-5n-1))","p:not(:nth-child(-5n-3))"]},"not-nth-last-child":{paths:["not-nth.html"],selectors:["p[class]:not(:nth-last-child(2))","p[class]:not(:nth-last-child(5))","p[class]:not(:nth-last-child(3n))","p[class]:not(:nth-last-child(odd))","p[class]:not(:nth-last-child(-4n))","p[class]:not(:nth-last-child(0n-1))","p[class]:not(:nth-last-child(0n-2))","p[class]:not(:nth-last-child(0n-3))","p[class]:not(:nth-last-child(1n+5))","p[class]:not(:nth-last-child(2n+3))","p[class]:not(:nth-last-child(2n+4))","p[class]:not(:nth-last-child(4n+1))","p[class]:not(:nth-last-child(4n-3))","p[class]:not(:nth-last-child(5n+1))","p[class]:not(:nth-last-child(5n-0))","p[class]:not(:nth-last-child(-n+2))","p[class]:not(:nth-last-child(-n+4))","p[class]:not(:nth-last-child(-0n+1))","p[class]:not(:nth-last-child(-0n-3))","p[class]:not(:nth-last-child(-0n-5))","p[class]:not(:nth-last-child(-1n+0))","p[class]:not(:nth-last-child(-1n+2))","p[class]:not(:nth-last-child(-1n+3))","p[class]:not(:nth-last-child(-1n+4))","p[class]:not(:nth-last-child(-2n+0))","p[class]:not(:nth-last-child(-2n-5))","p[class]:not(:nth-last-child(-3n+4))","p[class]:not(:nth-last-child(-3n-1))","p[class]:not(:nth-last-child(-4n-1))","p[class]:not(:nth-last-child(-5n+2))","p[class]:not(:nth-last-child(-5n-5))","p:not(:nth-last-child(4))","p:not(:nth-last-child(-0n))","p:not(:nth-last-child(0n-0))","p:not(:nth-last-child(0n-4))","p:not(:nth-last-child(0n-5))","p:not(:nth-last-child(1n+3))","p:not(:nth-last-child(2n-2))","p:not(:nth-last-child(3n-1))","p:not(:nth-last-child(4n+2))","p:not(:nth-last-child(4n-4))","p:not(:nth-last-child(5n-0))","p:not(:nth-last-child(-n+1))","p:not(:nth-last-child(-n-0))","p:not(:nth-last-child(-0n+0))","p:not(:nth-last-child(-0n+5))","p:not(:nth-last-child(-1n+0))","p:not(:nth-last-child(-1n+2))","p:not(:nth-last-child(-1n+5))","p:not(:nth-last-child(-1n-2))","p:not(:nth-last-child(-1n-4))","p:not(:nth-last-child(-2n+2))","p:not(:nth-last-child(-2n+5))","p:not(:nth-last-child(-3n+0))","p:not(:nth-last-child(-3n+3))","p:not(:nth-last-child(-3n+4))","p:not(:nth-last-child(-4n+3))","p:not(:nth-last-child(-5n+3))","p:not(:nth-last-child(-5n-1))","p:not(:nth-last-child(-5n-3))"]},"not-nth-of-type":{paths:["not-nth.html"],selectors:["p[class]:not(:nth-of-type(2))","p[class]:not(:nth-of-type(5))","p[class]:not(:nth-of-type(3n))","p[class]:not(:nth-of-type(odd))","p[class]:not(:nth-of-type(-4n))","p[class]:not(:nth-of-type(0n-1))","p[class]:not(:nth-of-type(0n-2))","p[class]:not(:nth-of-type(0n-3))","p[class]:not(:nth-of-type(1n+5))","p[class]:not(:nth-of-type(2n+3))","p[class]:not(:nth-of-type(2n+4))","p[class]:not(:nth-of-type(4n+1))","p[class]:not(:nth-of-type(4n-3))","p[class]:not(:nth-of-type(5n+1))","p[class]:not(:nth-of-type(5n-0))","p[class]:not(:nth-of-type(-n+2))","p[class]:not(:nth-of-type(-n+4))","p[class]:not(:nth-of-type(-0n+1))","p[class]:not(:nth-of-type(-0n-3))","p[class]:not(:nth-of-type(-0n-5))","p[class]:not(:nth-of-type(-1n+0))","p[class]:not(:nth-of-type(-1n+2))","p[class]:not(:nth-of-type(-1n+3))","p[class]:not(:nth-of-type(-1n+4))","p[class]:not(:nth-of-type(-2n+0))","p[class]:not(:nth-of-type(-2n-5))","p[class]:not(:nth-of-type(-3n+4))","p[class]:not(:nth-of-type(-3n-1))","p[class]:not(:nth-of-type(-4n-1))","p[class]:not(:nth-of-type(-5n+2))","p[class]:not(:nth-of-type(-5n-5))","p:not(:nth-of-type(4))","p:not(:nth-of-type(-0n))","p:not(:nth-of-type(0n-0))","p:not(:nth-of-type(0n-4))","p:not(:nth-of-type(0n-5))","p:not(:nth-of-type(1n+3))","p:not(:nth-of-type(2n-2))","p:not(:nth-of-type(3n-1))","p:not(:nth-of-type(4n+2))","p:not(:nth-of-type(4n-4))","p:not(:nth-of-type(5n-0))","p:not(:nth-of-type(-n+1))","p:not(:nth-of-type(-n-0))","p:not(:nth-of-type(-0n+0))","p:not(:nth-of-type(-0n+5))","p:not(:nth-of-type(-1n+0))","p:not(:nth-of-type(-1n+2))","p:not(:nth-of-type(-1n+5))","p:not(:nth-of-type(-1n-2))","p:not(:nth-of-type(-1n-4))","p:not(:nth-of-type(-2n+2))","p:not(:nth-of-type(-2n+5))","p:not(:nth-of-type(-3n+0))","p:not(:nth-of-type(-3n+3))","p:not(:nth-of-type(-3n+4))","p:not(:nth-of-type(-4n+3))","p:not(:nth-of-type(-5n+3))","p:not(:nth-of-type(-5n-1))","p:not(:nth-of-type(-5n-3))"]},"not-nth-last-of-type":{paths:["not-nth.html"],selectors:["p[class]:not(:nth-last-of-type(2))","p[class]:not(:nth-last-of-type(5))","p[class]:not(:nth-last-of-type(3n))","p[class]:not(:nth-last-of-type(odd))","p[class]:not(:nth-last-of-type(-4n))","p[class]:not(:nth-last-of-type(0n-1))","p[class]:not(:nth-last-of-type(0n-2))","p[class]:not(:nth-last-of-type(0n-3))","p[class]:not(:nth-last-of-type(1n+5))","p[class]:not(:nth-last-of-type(2n+3))","p[class]:not(:nth-last-of-type(2n+4))","p[class]:not(:nth-last-of-type(4n+1))","p[class]:not(:nth-last-of-type(4n-3))","p[class]:not(:nth-last-of-type(5n+1))","p[class]:not(:nth-last-of-type(5n-0))","p[class]:not(:nth-last-of-type(-n+2))","p[class]:not(:nth-last-of-type(-n+4))","p[class]:not(:nth-last-of-type(-0n+1))","p[class]:not(:nth-last-of-type(-0n-3))","p[class]:not(:nth-last-of-type(-0n-5))","p[class]:not(:nth-last-of-type(-1n+0))","p[class]:not(:nth-last-of-type(-1n+2))","p[class]:not(:nth-last-of-type(-1n+3))","p[class]:not(:nth-last-of-type(-1n+4))","p[class]:not(:nth-last-of-type(-2n+0))","p[class]:not(:nth-last-of-type(-2n-5))","p[class]:not(:nth-last-of-type(-3n+4))","p[class]:not(:nth-last-of-type(-3n-1))","p[class]:not(:nth-last-of-type(-4n-1))","p[class]:not(:nth-last-of-type(-5n+2))","p[class]:not(:nth-last-of-type(-5n-5))","p:not(:nth-last-of-type(4))","p:not(:nth-last-of-type(-0n))","p:not(:nth-last-of-type(0n-0))","p:not(:nth-last-of-type(0n-4))","p:not(:nth-last-of-type(0n-5))","p:not(:nth-last-of-type(1n+3))","p:not(:nth-last-of-type(2n-2))","p:not(:nth-last-of-type(3n-1))","p:not(:nth-last-of-type(4n+2))","p:not(:nth-last-of-type(4n-4))","p:not(:nth-last-of-type(5n-0))","p:not(:nth-last-of-type(-n+1))","p:not(:nth-last-of-type(-n-0))","p:not(:nth-last-of-type(-0n+0))","p:not(:nth-last-of-type(-0n+5))","p:not(:nth-last-of-type(-1n+0))","p:not(:nth-last-of-type(-1n+2))","p:not(:nth-last-of-type(-1n+5))","p:not(:nth-last-of-type(-1n-2))","p:not(:nth-last-of-type(-1n-4))","p:not(:nth-last-of-type(-2n+2))","p:not(:nth-last-of-type(-2n+5))","p:not(:nth-last-of-type(-3n+0))","p:not(:nth-last-of-type(-3n+3))","p:not(:nth-last-of-type(-3n+4))","p:not(:nth-last-of-type(-4n+3))","p:not(:nth-last-of-type(-5n+3))","p:not(:nth-last-of-type(-5n-1))","p:not(:nth-last-of-type(-5n-3))"]}},htmls={CssSelector:'\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n<meta charset=\'utf-8\'>\n<title>Test</title>\n</head>\n<body lang=\'EN-US\'>\n<ul>\n<li id="-a-b-c-">The background of this list item should be green</li>\n<li>The background of this second list item should be also green</li>\n</ul>\n<p>First paragraph</p><div><p>Hello in a paragraph</p></div>\n<div><p>Hello in a paragraph</p></div>\n<div>Hello again! (with no paragraph)</div>\n<div><div><p>Hello in a paragraph</p></div></div>\n<div><div><p>Hello in a paragraph</p><p>Another paragraph</p></div></div>\n<div></div><div><p>Hello in a paragraph</p><p>Another paragraph</p></div>\n<div><section id=first><div><h1></h1></div></section><section id=second></section><section><h5></h5></section></div>\n<div><h1></h1></div><main><h1></h1></main><section><h1></h1></section><footer><h1></h1></footer>\n<span>1</span><span class=italic>2</span><span class=this>3</span><span>4</span><span class=that>5</span><span class=this>6</span>\n<div><h1></h1></div><article><h2></h2></article><section><h2></h2><article><h3></h3></article></section><aside><h3></h3><h3></h3></aside><nav><div><h4></h4></div></nav>\n<span style=\'display: none\'>foo</span>\n<dd>\n<span>\n<span>Sub1</span>\n</span>\n<div>First</div>\n<div>\n<div>\n<a>Second</a>\n</div>\n</div>\n<div>Third</div>\n<div>Fourth</div>\n<div>\n<span>Fifth</span>\n</div>\n</dd>\n<input type=\'teXt\'>\n<input id=\'teXt\'>\n<body id="theBody">\n<div id="myDiv">\n<div id="someOtherDiv">subdiv!</div>\n<p><a href="http://www.g">hi</a><span class="hyphen-separated">test</span><span>oh</span></p>\n</div>\n<p class="hiclass">hi!!</p>\n<div class="checkit">wooo<p class="omg ohyeah">eeeee</p></div>\n<div class="checkit">woootooo<a href="http://colin">we</a></div>\n<form>\n<input>\n</form>\n</body>\n</body>\n</html>',CssSelector2:'\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n<meta charset=\'utf-8\'>\n<title>Te</title>\n</head>\n<body lang=\'EN-US\'>\n<div class="head">\n<p><a href="http://www.w"><img height=48 alt=W3C src="http://www.w" width=72></a>\n<h1 id="title">Se</h1>\n<h2>W3</h2>\n<dl>\n<dt>Th<dd><a href="http://www.w">\n</a>\n<dt>La<dd><a href="http://www.w">\n</a>\n<dt>Pr<dd><a href="http://www.w">\n</a>\n<dt><a name=editors-list></a>Ed<dd class="vcard"><span class="fn">Da</span> (</dd>\n<dd class="vcard"><a lang="tr" class="url fn" href="http://www.t">Ta</a> (<dd class="vcard"><a href="mailto:ian@h" class="url fn">Ia</a> (<span class="company"><a href="http://www.g">Go</a></span>)\n<dd class="vcard"><span class="fn">Pe</span> (<span class="company"><a href="http://www.n">Ne</a></span>)\n<dd class="vcard"><span class="fn">Jo</span> (<span class="company"><a href="http://www.q">Qu</a></span>)\n</dl>\n<p class="copyright"><a href="http://www.w">\n</a> &<a href="http://www.w"><abbr title="World Wide Web Consortium">W3</abbr></a><sup>&r</sup>\n<a href="http://www.c"><abbr title="Massachusetts\nInstitute of Technology">MI</abbr></a>, <a href="http://www.e"><acronym title="European Research\nConsortium for Informatics and Mathematics">ER</acronym></a>, <a href="http://www.k">Ke</a>),<a href="http://www.w">li</a>,\n<a href="http://www.w">tr</a>,\n<a href="http://www.w">do</a> r<hr title="Separator for header">\n</div>\n<h2><a name=abstract></a>Ab</h2>\n<p><em>Se</em> a</p>\n<p><acronym title="Cascading Style Sheets">CS</acronym> (<acronym title="Hypertext Markup Language">HT</acronym> a<acronym title="Extensible Markup Language">XM</acronym> d<p>Se</p>\n<pre>ex</pre>\n<p>Th</p>\n<p>Th<acronym title="Simple Tree Transformation\nSheets">ST</acronym> (<a href="#refsSTTS">[S</a></p>\n<h2><a name=status></a>St</h2>\n<p><em>Th<a href="http://www.w">W3</a></em></p>\n<p>Th<a href="#refsCSS1"><abbr title="CSS level 1">CS</abbr></a> a<a href="#refsCSS21"><abbr title="CSS level 2">CS</abbr></a>, <abbr title="CSS level\n3">CS</abbr> a</p>\n<p>Th</p>\n<p>Th<a href="http://www.w">CS</a>\n<a href="/Style/">St</a>).<a href="http://www.w">Ca</a>, </p>\n<p>Al<a href="http://lists">ar</a>)\n<a href="http://www.w">ww</a>\n<a href="http://www.w">in</a>).</p>\n<p>Th<p>Th<a href="http://www.w">tr</a>.\n<div class="subtoc">\n<h2><a name=contents>Ta</a></h2>\n<ul class="toc">\n<li class="tocline2"><a href="#context">1.</a>\n<ul>\n<li><a href="#dependencie">1.</a> </li>\n<li><a href="#terminology">1.</a> </li>\n<li><a href="#changesFrom">1.</a> </li>\n</ul>\n<li class="tocline2"><a href="#selectors">2.</a>\n<li class="tocline2"><a href="#casesens">3.</a>\n<li class="tocline2"><a href="#selector-sy">4.</a>\n<li class="tocline2"><a href="#grouping">5.</a>\n<li class="tocline2"><a href="#simple-sele">6.</a>\n<ul class="toc">\n<li class="tocline3"><a href="#type-select">6.</a>\n<ul class="toc">\n<li class="tocline4"><a href="#typenmsp">6.</a></li>\n</ul>\n<li class="tocline3"><a href="#universal-s">6.</a>\n<ul>\n<li><a href="#univnmsp">6.</a></li>\n</ul>\n<li class="tocline3"><a href="#attribute-s">6.</a>\n<ul class="toc">\n<li class="tocline4"><a href="#attribute-r">6.</a>\n<li><a href="#attribute-s">6.</a>\n<li class="tocline4"><a href="#attrnmsp">6.</a>\n<li class="tocline4"><a href="#def-values">6.</a></li>\n</ul>\n<li class="tocline3"><a href="#class-html">6.</a>\n<li class="tocline3"><a href="#id-selector">6.</a>\n<li class="tocline3"><a href="#pseudo-clas">6.</a>\n<ul class="toc">\n<li class="tocline4"><a href="#dynamic-pse">6.</a>\n<li class="tocline4"><a href="#target-pseu">6.</a>\n<li class="tocline4"><a href="#lang-pseudo">6.</a>\n<li class="tocline4"><a href="#UIstates">6.</a>\n<li class="tocline4"><a href="#structural-">6.</a>\n<ul>\n<li><a href="#root-pseudo">:r</a>\n<li><a href="#nth-child-p">:n</a>\n<li><a href="#nth-last-ch">:n</a>\n<li><a href="#nth-of-type">:n</a>\n<li><a href="#nth-last-of">:n</a>\n<li><a href="#first-child">:f</a>\n<li><a href="#last-child-">:l</a>\n<li><a href="#first-of-ty">:f</a>\n<li><a href="#last-of-typ">:l</a>\n<li><a href="#only-child-">:o</a>\n<li><a href="#only-of-typ">:o</a>\n<li><a href="#empty-pseud">:e</a></li>\n</ul>\n<li class="tocline4"><a href="#negation">6.</a></li>\n</ul>\n</li>\n</ul>\n<li><a href="#pseudo-elem">7.</a>\n<ul>\n<li><a href="#first-line">7.</a>\n<li><a href="#first-lette">7.</a>\n<li><a href="#UIfragments">7.</a>\n<li><a href="#gen-content">7.</a></li>\n</ul>\n<li class="tocline2"><a href="#combinators">8.</a>\n<ul class="toc">\n<li class="tocline3"><a href="#descendant-">8.</a>\n<li class="tocline3"><a href="#child-combi">8.</a>\n<li class="tocline3"><a href="#sibling-com">8.</a>\n<ul class="toc">\n<li class="tocline4"><a href="#adjacent-si">8.</a>\n<li class="tocline4"><a href="#general-sib">8.</a></li>\n</ul>\n</li>\n</ul>\n<li class="tocline2"><a href="#specificity">9.</a>\n<li class="tocline2"><a href="#w3cselgramm">10</a>\n<ul class="toc">\n<li class="tocline3"><a href="#grammar">10</a>\n<li class="tocline3"><a href="#lex">10</a></li>\n</ul>\n<li class="tocline2"><a href="#downlevel">11</a>\n<li class="tocline2"><a href="#profiling">12</a>\n<li><a href="#Conformance">13</a>\n<li><a href="#Tests">14</a>\n<li><a href="#ACKS">15</a>\n<li class="tocline2"><a href="#references">16</a>\n</ul>\n</div>\n<h2><a name=context>1.</a></h2>\n<h3><a name=dependencies></a>1.</h3>\n<p>So<a href="#refsCSS21">[C</a></p>\n<h3><a name=terminology></a>1.</h3>\n<p>Al</p>\n<h3><a name=changesFromCSS2></a>1.</h3>\n<p><em>Th</em></p>\n<p>Th<ul>\n<li>th</li>\n<li>an</li>\n<li>a <a href="#general-sib">ne</a> h</li>\n<li>ne</li>\n<li>ne</li>\n<li>th</li>\n<li>pr</li>\n<li>Se</li>\n<li>th</li>\n</ul>\n<h2><a name=selectors></a>2.</h2>\n<p><em>Th</em></p>\n<p>A </p>\n<p>Se</p>\n<p>Th</p>\n<table class="selectorsReview">\n<thead>\n<tr>\n<th class="pattern">Pa</th>\n<th class="meaning">Me</th>\n<th class="described">De</th>\n<th class="origin">Fi</th></tr>\n<tbody>\n<tr>\n<td class="pattern">*</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#universal-s">Un</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#type-select">Ty</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E[</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#attribute-s">At</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#structural-">St</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:<br>E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#link">Th</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E:<br>E:<br>E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#useraction-">Th</a></td>\n<td class="origin">1 </td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#target-pseu">Th</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#lang-pseudo">Th</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E:<br>E:</td>\n<td class="meaning">a </td>\n<td class="described"><a href="#UIstates">Th</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:\x3c!--<b--\x3e</td>\n<td class="meaning">a \x3c!-- o--\x3e (</td>\n<td class="described"><a href="#UIstates">Th</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">th</td>\n<td class="described"><a href="#first-line">Th</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">th</td>\n<td class="described"><a href="#first-lette">Th</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">th</td>\n<td class="described"><a href="#UIfragments">Th</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">ge</td>\n<td class="described"><a href="#gen-content">Th</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">ge</td>\n<td class="described"><a href="#gen-content">Th</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E.</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#class-html">Cl</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E#</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#id-selector">ID</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E:</td>\n<td class="meaning">an</td>\n<td class="described"><a href="#negation">Ne</a></td>\n<td class="origin">3</td></tr>\n<tr>\n<td class="pattern">E </td>\n<td class="meaning">an</td>\n<td class="described"><a href="#descendant-">De</a></td>\n<td class="origin">1</td></tr>\n<tr>\n<td class="pattern">E </td>\n<td class="meaning">an</td>\n<td class="described"><a href="#child-combi">Ch</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E </td>\n<td class="meaning">an</td>\n<td class="described"><a href="#adjacent-si">Ad</a></td>\n<td class="origin">2</td></tr>\n<tr>\n<td class="pattern">E </td>\n<td class="meaning">an</td>\n<td class="described"><a href="#general-sib">Ge</a></td>\n<td class="origin">3</td></tr></tbody></table>\n<p>Th</p>\n<h2><a name=casesens>3.</a></h2>\n<p>Th</p>\n<h2><a name=selector-syntax>4.</a></h2>\n<p>A <dfn><a name=selector>se</a></dfn> i<a href="#sequence">se</a>\n<a href="#combinators">co</a>.</p>\n<p>A <dfn><a name=sequence>se</a></dfn>\n<a href="#simple-sele">si</a>\n<a href="#combinators">co</a>. <a href="#type-select">ty</a> o<a href="#universal-s">un</a>. </p>\n<p>A <dfn><a name=simple-selectors-dfn></a><a href="#simple-sele">si</a></dfn> i<a href="#type-select">ty</a>, <a href="#universal-s">un</a>, <a href="#attribute-s">at</a>, <a href="#class-html">cl</a>, <a href="#id-selector">ID</a>, <a href="#content-sel">co</a>, <a href="#pseudo-clas">ps</a>. <a href="#pseudo-elem">ps</a> m</p>\n<p><dfn>Co</dfn> a<code>&g</code>),<code>+</code>) <code>~</code>).<a name=whitespace></a>On</p>\n<p>Th<dfn><a name=subject></a>su</dfn>. </p>\n<p>An<a href="#Conformance">in</a>.</p>\n<h2><a name=grouping>5.</a></h2>\n<p>Wh</p>\n<div class="example">\n<p>CS</p>\n<p>In</p>\n<pre>h1</pre>\n<p>is</p>\n<pre>h1</pre>\n</div>\n<p><strong>Wa</strong>: </p>\n<h2><a name=simple-selectors>6.</a></h2>\n<h3><a name=type-selectors>6.</a></h3>\n<p>A <dfn>ty</dfn> i</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>h1</code> e</p>\n<pre>h1</pre>\n</div>\n<h4><a name=typenmsp>6.</a></h4>\n<p>Ty<a href="#refsXMLNAME">[X</a>) <code>|</code>).</p>\n<p>Th</p>\n<p>An</p>\n<p>El<code>*|</code>")</p>\n<p>A <a href="#Conformance">in</a> s</p>\n<p>In<a href="http://www.w">lo</a>\n<a href="http://www.w">qu</a>. <a href="#downlevel">be</a> f</p>\n<p>In</p>\n<dl>\n<dt><code>ns</code></dt>\n<dd>el</dd>\n<dt><code>*|</code></dt>\n<dd>el</dd>\n<dt><code>|E</code></dt>\n<dd>el</dd>\n<dt><code>E</code></dt>\n<dd>if</dd>\n</dl>\n<div class="example">\n<p>CS</p>\n<pre>@n</pre>\n<p>Th<code>h1</code> e</p>\n<p>Th</p>\n<p>Th<code>h1</code> e</p>\n<p>Th<code>h1</code> e</p>\n<p>Th</p>\n</div>\n<h3><a name=universal-selector>6.</a> </h3>\n<p>Th<dfn>un</dfn>, <code>*</code>),<a href="#univnmsp">Un</a> b</p>\n<p>If<code>*</code> m</p>\n<div class="example">\n<p>Ex</p>\n<ul>\n<li><code>*[</code> a<code>[h</code> a</li>\n<li><code>*.</code> a<code>.w</code> a</li>\n<li><code>*#</code> a<code>#m</code> a</li>\n</ul>\n</div>\n<p class="note"><strong>No</strong> i<code>*</code>, </p>\n<h4><a name=univnmsp>6.</a></h4>\n<p>Th</p>\n<dl>\n<dt><code>ns</code></dt>\n<dd>al</dd>\n<dt><code>*|</code></dt>\n<dd>al</dd>\n<dt><code>|*</code></dt>\n<dd>al</dd>\n<dt><code>*</code></dt>\n<dd>if</dd>\n</dl>\n<p>A <a href="#Conformance">in</a>\n</p>\n<h3><a name=attribute-selectors>6.</a></h3>\n<p>Se</p>\n<h4><a name=attribute-representation>6.</a></h4>\n<p>CS</p>\n<dl>\n<dt><code>[a</code>\n<dd>Re<code>at</code> a</dd>\n<dt><code>[a</code></dt>\n<dd>Re<code>at</code> a</dd>\n<dt><code>[a</code></dt>\n<dd>Re<code>at</code> a<a href="#whitespace">wh</a>-s<em>se</em> b</dd>\n<dt><code>[a</code>\n<dd>Re<code>at</code> a<code>hr</code> a<code>li</code> e<a href="#refsRFC3066">[R</a>).<code>la</code> (<code>xm</code>) <a href="#lang-pseudo">th<code>:l</code> p</a>.</dd>\n</dl>\n<p>At</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>h1</code>\n<code>ti</code> a</p>\n<pre>h1</pre>\n<p>In<code>sp</code> e<code>cl</code> a</p>\n<pre>sp</pre>\n<p>Mu<code>sp</code> e<code>he</code> a<code>go</code> a</p>\n<pre>sp</pre>\n<p>Th<code>re</code> a<code>a</code> e<code>hr</code> a</p>\n<pre>a[</pre>\n<p>Th<code>li</code> e<code>hr</code> a</p>\n<pre>li</pre>\n<p>Th<code>li</code> e<code>hr</code> a</p>\n<pre>li</pre>\n<p>Si<code>DI</code> e<code>ch</code>:</p>\n<pre>DI</pre>\n</div>\n<h4><a name=attribute-substrings></a>6.</h4>\n<p>Th</p>\n<dl>\n<dt><code>[a</code></dt>\n<dd>Re<code>at</code> a</dd>\n<dt><code>[a</code>\n<dd>Re<code>at</code> a</dd>\n<dt><code>[a</code>\n<dd>Re<code>at</code> a</dd>\n</dl>\n<p>At</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>ob</code>, </p>\n<pre>ob</pre>\n<p>Th<code>a</code> w<code>hr</code> a</p>\n<pre>a[</pre>\n<p>Th<code>ti</code>\n</p>\n<pre>p[</pre>\n</div>\n<h4><a name=attrnmsp>6.</a></h4>\n<p>At<code>|</code>).<code>|a</code>")<p>An<a href="#Conformance">in</a> s<div class="example">\n<p>CS</p>\n<pre>@n</pre>\n<p>Th<code>at</code> i</p>\n<p>Th<code>at</code> r</p>\n<p>Th<code>at</code> w</p>\n</div>\n<h4><a name=def-values>6.</a></h4>\n<p>At</p>\n<p>Mo<em>no</em> r<em>is</em> r<a href="#refsXML10">[X</a> f</p>\n<p>A <a href="#refsXMLNAME">[X</a> i</p>\n<p class="note"><strong>No</strong> T</p>\n<div class="example">\n<p>Ex</p>\n<p>Co</p>\n<pre class="dtd-example">&l</pre>\n<p>If</p>\n<pre>EX</pre>\n<p>th</p>\n<pre>EX</pre>\n<p>He<code>EX</code> i</p>\n</div>\n<h3><a name=class-html>6.</a></h3>\n<p>Wo<code>.</code>) <code>~=</code>\n<code>cl</code> a<code>di</code> a<code>di</code> h<code>.</code>).</p>\n<p>UA<a href="#refsSVG">[S</a> d<a href="http://www.w">SV</a> a<a href="#refsMATH">[M</a> d<a href="http://www.w">Ma</a>.)</p>\n<div class="example">\n<p>CS</p>\n<p>We<code>cl</code> a</p>\n<pre>*.</pre>\n<p>or</p>\n<pre>.p</pre>\n<p>Th<code>cl</code>:</p>\n<pre>H1</pre>\n<p>Gi</p>\n<pre>&l</pre>\n</div>\n<p>To</p>\n<div class="example">\n<p>CS</p>\n<p>Th<a href="#whitespace">wh</a>-s</p>\n<pre>p.</pre>\n<p>Th<code>cl</code> b<code>cl</code>.</p>\n</div>\n<p class="note"><strong>No</strong> B</p>\n<p class="note"><strong>No</strong> I</p>\n<h3><a name=id-selectors>6.</a></h3>\n<p>Do</p>\n<p>An<code>#</code>) </p>\n<p>Se<div class="example">\n<p>Ex</p>\n<p>Th<code>h1</code> e</p>\n<pre>h1</pre>\n<p>Th</p>\n<pre>#c</pre>\n<p>Th</p>\n<pre>*#</pre>\n</div>\n<p class="note"><strong>No</strong> I<a href="#refsXML10">[X</a>, <code>[n</code> i<code>#p</code>. </p>\n<p>If</p>\n<h3><a name=pseudo-classes>6.</a></h3>\n<p>Th</p>\n<p>A <code>:</code>) </p>\n<p>Ps</p>\n<h4><a name=dynamic-pseudos>6.</a></h4>\n<p>Dy</p>\n<p>Dy</p>\n<h5>Th<a name=link>li</a></h5>\n<p>Us<code>:l</code> a<code>:v</code> t</p>\n<ul>\n<li>Th<code>:l</code> p</li>\n<li>Th<code>:v</code> p</li>\n</ul>\n<p>Af</p>\n<p>Th</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>ex</code> a</p>\n<pre>a.</pre>\n</div>\n<p class="note"><strong>No</strong> I<p>UA</p>\n<h5>Th<a name=useraction-pseudos>us</a></h5>\n<p>In</p>\n<ul>\n<li>Th<code>:h</code> p<a href="http://www.w">in</a> d<a href="http://www.w">in</a> m</li>\n<li>Th<code>:a</code> p</li>\n<li>Th<code>:f</code> p</li>\n</ul>\n<p>Th<code>:a</code> o<code>:f</code>.</p>\n<p>Th</p>\n<p>Se</p>\n<div class="example">\n<p>Ex</p>\n<pre>a:</pre>\n<p>An</p>\n<pre>a:</pre>\n<p>Th<code>a</code> e</p>\n</div>\n<p class="note"><strong>No</strong> A</p>\n<h4><a name=target-pseudo>6.</a></h4>\n<p>So</p>\n<p>UR<code>se</code> i</p>\n<pre>ht</pre>\n<p>A <code>:t</code>\n</p>\n<div class="example">\n<p>Ex</p>\n<pre>p.</pre>\n<p>Th<code>p</code> e<code>no</code> t</p>\n</div>\n<div class="example">\n<p>CS</p>\n<p>He<code>:t</code> p</p>\n<pre>*:</pre>\n</div>\n<h4><a name=lang-pseudo>6.</a></h4>\n<p>If<a href="#refsHTML4">[H</a>, <code>la</code> a<code>me</code>\n<code>xm</code>, </p>\n<p>Th<code>:l</code> r<code>:l</code> s<a href="#attribute-r">\'|</a> o</p>\n<p>C </p>\n<p class="note"><strong>No</strong> I<a href="#refsRFC3066">[R</a> o<a href="#refsXML10">[X</a>. <a href="http://www.w">\n</a></p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>q</code> q</p>\n<pre>ht</pre>\n</div>\n<h4><a name=UIstates>6.</a></h4>\n<h5><a name=enableddisabled>Th</a></h5>\n<p>Th<code>:e</code> p<code>in</code> e</p>\n<p>Si<code>:e</code>, <code>:d</code> a</p>\n<p>Mo</p>\n<h5><a name=checked>Th</a></h5>\n<p>Ra<code>:c</code> p<code>:c</code> p<code>se</code> a<code>ch</code>\n<a href="http://www.w">Se</a>, <code>:c</code> p<code>:c</code> p<code>se</code> a<code>ch</code> a<h5><a name=indeterminate>Th</a></h5>\n<div class="note">\n<p>Ra</p>\n<p>A <code>:i</code> p\x3c!--Wh--\x3e</p>\n</div>\n<h4><a name=structural-pseudos>6.</a></h4>\n<p>Se<dfn>st</dfn> t<p>No<h5><a name=root-pseudo>:r</a></h5>\n<p>Th<code>:r</code> p<code>HT</code> e<h5><a name=nth-child-pseudo>:n</a></h5>\n<p>Th<code>:n<var>a</var><code>n</code>+<var>b</var>)</code>\n<var>a</var><code>n</code>+<var>b</var>-1<strong>be</strong> i<code>n</code>, <var>b</var>th<var>a</var> e<var>a</var> a<var>b</var> v<p>In<code>:n</code> c<code>od</code>\' <code>ev</code>\' <code>od</code>\' <code>2n</code>,\n<code>ev</code>\' <code>2n</code>.\n<div class="example">\n<p>Ex</p>\n<pre>tr</pre>\n</div>\n<p>Wh<var>a</var>=0<code>:n</code> m<var>a</var>=0<var>a</var><code>n</code> p<code>:n<var>b</var>)</code> a<code>:n</code>.\n<div class="example">\n<p>Ex</p>\n<pre>fo</pre>\n</div>\n<p>Wh<var>a</var>=1<div class="example">\n<p>Ex</p>\n<p>Th</p>\n<pre>ba</pre>\n</div>\n<p>If<var>b</var>=0<var>a</var>th<var>b</var> p<div class="example">\n<p>Ex</p>\n<pre>tr</pre>\n</div>\n<p>If<var>a</var> a<var>b</var> a</p>\n<p>Th<var>a</var> c<var>a</var><code>n</code>+<var>b</var>, <code>n</code>&g</p>\n<div class="example">\n<p>Ex</p>\n<pre>ht</pre>\n</div>\n<p>Wh<var>b</var> i<var>b</var>).</p>\n<div class="example">\n<p>Ex</p>\n<pre>:n</pre>\n</div>\n<h5><a name=nth-last-child-pseudo>:n</a></h5>\n<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>\n<var>a</var><code>n</code>+<var>b</var>-1<strong>af</strong> i<code>n</code>, <code>:n</code> p<code>ev</code>\' <code>od</code>\' <div class="example">\n<p>Ex</p>\n<pre>tr</pre>\n</div>\n<h5><a name=nth-of-type-pseudo>:n</a></h5>\n<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>\n<var>a</var><code>n</code>+<var>b</var>-1<strong>be</strong> i<code>n</code>, <var>b</var>th<code>:n</code> p<code>ev</code>\' <code>od</code>\' <div class="example">\n<p>CS</p>\n<p>Th</p>\n<pre>im</pre>\n</div>\n<h5><a name=nth-last-of-type-pseudo>:n</a></h5>\n<p>Th<code>:n<var>a</var>n+<var>b</var>)</code>\n<var>a</var><code>n</code>+<var>b</var>-1<strong>af</strong> i<code>n</code>, <code>:n</code> p<code>ev</code>\' <code>od</code>\' <div class="example">\n<p>Ex</p>\n<p>To<code>h2</code> c<code>bo</code> e</p>\n<pre>bo</pre>\n<p>In<code>:n</code>, </p>\n<pre>bo</pre>\n</div>\n<h5><a name=first-child-pseudo>:f</a></h5>\n<p>Sa<code>:n</code>. <code>:f</code> p<div class="example">\n<p>Ex</p>\n<p>Th<code>p</code> e<code>di</code> e</p>\n<pre>di</pre>\n<p>Th<code>p</code> i<code>di</code> o</p>\n<pre>&l</pre>bu<code>p</code> i<pre>&l</pre>\n<p>Th</p>\n<pre>* </pre>\n</div>\n<h5><a name=last-child-pseudo>:l</a></h5>\n<p>Sa<code>:n</code>. <code>:l</code> p<div class="example">\n<p>Ex</p>\n<p>Th<code>li</code> t<code>ol</code>.\n<pre>ol</pre>\n</div>\n<h5><a name=first-of-type-pseudo>:f</a></h5>\n<p>Sa<code>:n</code>. <code>:f</code> p<div class="example">\n<p>Ex</p>\n<p>Th<code>dt</code> i<code>dl</code>, <code>dt</code> b</p>\n<pre>dl</pre>\n<p>It<code>dt</code>\n</p>\n<pre>&l</pre>\n</div>\n<h5><a name=last-of-type-pseudo>:l</a></h5>\n<p>Sa<code>:n</code>. <code>:l</code> p</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>td</code> o</p>\n<pre>tr</pre>\n</div>\n<h5><a name=only-child-pseudo>:o</a></h5>\n<p>Re<code>:f</code> o<code>:n</code>, </p>\n<h5><a name=only-of-type-pseudo>:o</a></h5>\n<p>Re<code>:f</code> o<code>:n</code>, </p>\n<h5><a name=empty-pseudo></a>:e</h5>\n<p>Th<code>:e</code> p</p>\n<div class="example">\n<p>Ex</p>\n<p><code>p:</code> i</p>\n<pre>&l</pre>\n<p><code>fo</code> i</p>\n<pre>&l</pre>\n<pre>&l</pre>\n<pre>&l</pre>\n</div>\n<h4><a name=content-selectors>6.</a></h4> \x3c!-- I--\x3e\n<p>Th</p>\n\x3c!-- (--\x3e\n<h4><a name=negation></a>6.</h4>\n<p>Th<code>:n<var>X</var>)</code>, <a href="#simple-sele">si</a> (\x3c!-- p--\x3e\n<div class="example">\n<p>Ex</p>\n<p>Th<code>bu</code>\n</p>\n<pre>bu</pre>\n<p>Th<code>FO</code>\n</p>\n<pre>*:</pre>\n<p>Th</p>\n<pre>ht</pre>\n</div>\n<p>De</p>\n<div class="example">\n<p>Ex</p>\n<p>As</p>\n<pre>*|</pre>\n<p>Th<em>ar</em> b</p>\n<pre>*|</pre>\n</div>\n<p class="note"><strong>No</strong>: <code>:n</code>,\n<code>fo</code>,\n<code>fo</code> b</p>\n<h3><a name=pseudo-elements>7.</a></h3>\n<p>Ps<code>::</code> a<code>::</code> p</p>\n<p>A <code>::</code>) </p>\n<p>Th<code>::</code> n<code>:f</code>, <code>:f</code>,\n<code>:b</code> a<code>:a</code>).</p>\n<p>On<a href="#subject">su</a> o<span class="note">A\n</span></p>\n<h4><a name=first-line>7.</a></h4>\n<p>Th<code>::</code> p<div class="example">\n<p>CS</p>\n<pre>p:</pre>\n<p>Th</p>\n</div>\n<p>Th<code>p:</code> d</p>\n<p>No</p>\n<pre>\n&</pre>\n<p>th<pre>\nT</pre>\n<p>Th<em>fi</em> f<code>::</code>. </p>\n<pre>\n&<b>&l</b> T<b>&l</b> w</pre>\n<p>If<code>sp</code> e</p>\n<pre>\n&<b>&l</b> T<b>&l</b> T</pre>\n<p>th<code>sp</code> w<code>::</code>.\n<pre>\n&<b>&l</b> T<b>&l</b>&l<b>&l</b> b<b>&l</b> T</pre>\n<p>In<code>::</code> p</p>\n<p><a name="first-formatted-line"></a>Th<code>di</code> i<code>&l</code> i<code>p</code> (<code>p</code> a<code>di</code> a<p>Th<code>&l</code> t<code>di</code> i<p class="note">No<code>p</code> i<code>&l</code> d<code>br</code> i<p>A <code>::</code> p</p>\n<pre>\n&</pre>\n<p>is</p>\n<pre>\n&</pre>\n<p>Th<code>::</code> p<code>::</code>\n</p>\n<h4><a name=first-letter>7.</a></h4>\n<p>Th<code>::</code> p</p>\n<p>In<code>::</code>\n</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>::</code>\n<span>sp</span>, <span>sp</span>:\n<pre>\np</pre>\n<div class="figure">\n<p><img src="initial-cap." alt="Image illustrating the ::first-letter pseudo-element">\n</div>\n</div>\n<div class="example">\n<p>Th</p>\n<pre>\n&</pre>\n<p>Th</p>\n<div class="figure">\n<p><img src="first-letter" alt="Image illustrating the combined effect of the ::first-letter and ::first-line pseudo-elements"></p>\n</div>\n<p>Th<span class="index-inst" title="fictional tag\nsequence">fi</span> i</p>\n<pre>\n&</pre>\n<p>No<code>::</code> p</p> </div>\n<p>In</p>\n<p>Pu<a href="#refsUNICODE">[U</a></p>\n<div class="figure">\n<p><img src="first-letter" alt="Quotes that precede the\nfirst letter should be included."></p>\n</div>\n<p>Th<code>::</code> a</p>\n<p>In<code>::</code> p<span class="note">A </span></p>\n<p>Th<code>::</code> p</p>\n<div class="example">\n<p>Ex</p>\n<p>Th<pre>&l</pre>\n<p>is<pre>&l</pre>\n</div>\n<p>Th<code>&l</code> t<code>di</code> i<code>di</code> d<p>Th<a href="#first-forma">fi</a> F<code>&l</code> t<code>::</code> d<code>br</code> i<p>In<code>::</code> a<code>::</code> o<code>::</code> o<code>::</code> c<code>::</code> a<em>in</em> t<div class="example">\n<p>Ex</p>\n<p>Af</p>\n</div>\n<p>So<code>::</code> p<p>If<code>&l</code>, </p>\n<p>Si<div class="example">\n<p>Ex</p>\n<p><a name="overlapping-example">Th</a> i</p>\n<pre>p </pre>\n<p>As<span class="index-inst" title="fictional tag sequence">fi</span> f</p>\n<pre>&l</pre>\n<p>No<code>::</code> e<code>::</code>\n<code>::</code> a<code>::</code>, <code>::</code>.</p>\n</div>\n<h4><a name=UIfragments>7.</a> <a name=selection>Th</a></h4>\n<p>Th<code>::</code> p<code><a href="#checked">:c</a></code> p<code>:s</code>)\n<p>Al<code>::</code> p<a href="#refsCSS21">[C</a>) <code>::</code> s<code>::</code>\n<p>Th<code>::</code>\n<code>::</code> m<h4><a name=gen-content>7.</a></h4>\n<p>Th<code>::</code> a<code>::</code> p<a href="#refsCSS21">[C</a>.</p>\n<p>Wh<code>::</code> a<code>::</code>\n<code>::</code> a<code>::</code>, </p>\n<h2><a name=combinators>8.</a></h2>\n<h3><a name=descendant-combinators>8.</a></h3>\n<p>At<code>EM</code> e<code>H1</code>\n<a href="#whitespace">wh</a> t<code>A </code>" <code>B</code> t<code>A</code>.\n<div class="example">\n<p>Ex</p>\n<p>Fo</p>\n<pre>h1</pre>\n<p>It<code>em</code> e<code>h1</code> e</p>\n<pre>&l</pre>\n<p>Th</p>\n<pre>di</pre>\n<p>re<code>p</code> e<code>di</code> e</p>\n<p>Th<a href="#attribute-s">at</a>, <code>hr</code> a<code>p</code> t<code>di</code>:</p>\n<pre>di</pre>\n</div>\n<h3><a name=child-combinators>8.</a></h3>\n<p>A <dfn>ch</dfn> d<code>&g</code>) <div class="example">\n<p>Ex</p>\n<p>Th<code>p</code> e<code>bo</code>:</p>\n<pre>bo</pre>\n<p>Th</p>\n<pre>di</pre>\x3c!-- L--\x3e\n<p>It<code>p</code> e<code>li</code> e<code>li</code> e<code>ol</code> e<code>ol</code> e<code>di</code>. </p>\n</div>\n<p>Fo<code><a href="#structural-">:f</a></code> p</p>\n<h3><a name=sibling-combinators>8.</a></h3>\n<p>Th</p>\n<h4><a name=adjacent-sibling-combinators>8.</a></h4>\n<p>Th<code>+</code>) </p>\n<div class="example">\n<p>Ex</p>\n<p>Th<code>p</code> e<code>ma</code> e</p>\n<pre>ma</pre>\n<p>Th<code>h1</code> e<code>cl</code>:</p>\n<pre>h1</pre>\n</div>\n<h4><a name=general-sibling-combinators>8.</a></h4>\n<p>Th<code>~</code>) </p>\n<div class="example">\n<p>Ex</p>\n<pre>h1</pre>\n<p>re<code>pr</code> e<code>h1</code>. </p>\n<pre>&l</pre>\n</div>\n<h2><a name=specificity>9.</a></h2>\n<p>A </p>\n<ul>\n<li>co</li>\n<li>co</li>\n<li>co</li>\n<li>ig</li>\n</ul>\n<p>Se<a href="#negation">th</a>\n</p>\n<p>Co</p>\n<div class="example">\n<p>Ex</p>\n<pre>* </pre>\n</div>\n<p class="note"><strong>No</strong> t<code>st</code> a<a href="#refsCSS21">[C</a>.</p>\n<h2><a name=w3cselgrammar>10</a></h2>\n<h3><a name=grammar>10</a></h3>\n<p>Th<a href="#refsYACC">[Y</a>)\n</p>\n<ul>\n<li><b>*</b>: <li><b>+</b>: <li><b>?</b>: <li><b>|</b>: <li><b>[ </b>: </li>\n</ul>\n<p>Th</p>\n<pre>se</pre>\n<h3><a name=lex>10</a></h3>\n<p>Th<a name=x3>to</a>, <a href="#refsFLEX">[F</a>) </p>\n<p>Th<a href="#refsUNICODE">[U</a></p>\n<pre>%o</pre>\n<h2><a name=downlevel>11</a></h2>\n<p>An</p>\n<p>It<code>@n</code> a</p>\n<p>Th</p>\n<p>Th</p>\n<ol>\n<li>\n<p>Th</p>\n<ul>\n<li>In</li>\n<li>In<code>|n</code>")</li>\n</ul>\n</li>\n<li>\n<p>Th</p>\n<ul>\n<li>In</li>\n</ul>\n</li>\n<li>\n<p>Th<b>no</b> u</p>\n<ul>\n<li>In<a href="#typenmsp">Ty</a> s<code>:</code>"\n<code>ht</code>" <code>&l</code>. </li>\n<li>No<em>on</em> m</li>\n</ul>\n</li>\n</ol>\n<p>In<em>di</em> n</p>\n<h2><a name=profiling>12</a></h2>\n<p>Ea</p>\n<p>No<div class="profile">\n<table class="tprofile">\n<tbody>\n<tr>\n<th class="title" colspan=2>Se</th></tr>\n<tr>\n<th>Sp</th>\n<td>CS</td></tr>\n<tr>\n<th>Ac</th>\n<td>ty<br>cl<br>ID<br>:l<br>de<br>::</td></tr>\n<tr>\n<th>Ex</th>\n<td>\n<p>un<br>at<br>:h<br>:t<br>:l<br>al<br>al<br>ne<br>al<br>::<br>ch<br>si<p>na</td></tr>\n<tr>\n<th>Ex</th>\n<td>on</td></tr></tbody></table><br><br>\n<table class="tprofile">\n<tbody>\n<tr>\n<th class="title" colspan=2>Se</th></tr>\n<tr>\n<th>Sp</th>\n<td>CS</td></tr>\n<tr>\n<th>Ac</th>\n<td>ty<br>un<br>at<br>cl<br>ID<br>:l<br>de<br>ch<br>ad<br>::<br>::</td></tr>\n<tr>\n<th>Ex</th>\n<td>\n<p>co<br>su<br>:t<br>al<br>al<br>ne<br>al<br>ge<p>na</td></tr>\n<tr>\n<th>Ex</th>\n<td>mo</td></tr></tbody></table>\n<p>In<p>Th<b>ma</b> a<code>a</code>\n<code>na</code> s<code>h1</code>:\n<pre>h1</pre>\n<p>Al</div>\n<div class="profile">\n<table class="tprofile">\n<tbody>\n<tr>\n<th class="title" colspan=2>Se</th></tr>\n<tr>\n<th>Sp</th>\n<td>ST</td>\n</tr>\n<tr>\n<th>Ac</th>\n<td>\n<p>ty<br>un<br>at<br>cl<br>ID<br>al<br>\n<p>na</td></tr>\n<tr>\n<th>Ex</th>\n<td>no<br>ps<br></td></tr>\n<tr>\n<th>Ex</th>\n<td>so</td></tr></tbody></table>\n<p>Se<ol>\n<li>a <li>fr</li></ol></div>\n<h2><a name=Conformance></a>13</h2>\n<p>Th<p>Th<p>Al<a href="#profiling">Pr</a> l<p>In<p>Us<ul>\n<li>a </li>\n<li>a </li>\n<li>a </li>\n</ul>\n<p>Sp</p>\n\x3c!-- A--\x3e\n<h2><a name=Tests></a>14</h2>\n<p>Th<a href="http://www.w">a </a> a</p>\n<h2><a name=ACKS></a>15</h2>\n<p>Th</p>\n<p>Th</p>\n<h2><a name=references>16</a></h2>\n<dl class="refs">\n<dt>[C<dd><a name=refsCSS1></a> B<cite>Ca</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[C<dd><a name=refsCSS21></a> B<cite>Ca</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[C<dd><a name=refsCWWW></a> M<cite>Ch</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[F<dd><a name="refsFLEX"></a> "<cite>Fl</cite>",<dt>[H<dd><a name="refsHTML4"></a> D<cite>HT</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)\n<dt>[M<dd><a name="refsMATH"></a> P<cite>Ma</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[R<dd><a name="refsRFC3066"></a> H<cite>Ta</cite>",<dd>(<a href="http://www.i"><code>ht</code></a>)\n<dt>[S<dd><a name=refsSTTS></a> D<cite>Si</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[S<dd><a name="refsSVG"></a> J<cite>Sc</cite>",<dd>(<code><a href="http://www.w">ht</a></code>)\n<dt>[U</dt>\n<dd><a name="refsUNICODE"></a> <cite><a href="http://www.u">Th</a></cite>, <a href="http://www.u">Un</a> a<a href="http://www.u">Un</a>.\n<dd>(<code><a href="http://www.u">ht</a></code>)</dd>\n<dt>[X<dd><a name="refsXML10"></a> T<cite>Ex</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)\n<dt>[X<dd><a name="refsXMLNAMES"></a> T<cite>Na</cite>",<dd>(<a href="http://www.w"><code>ht</code></a>)\n<dt>[Y<dd><a name="refsYACC"></a> S<cite>YA</cite>",</dl>\n</body>\n</html>',CssToXPath:"\n<!DOCTYPE html>\n<html lang='en'>\n<head>\n<meta charset='utf-8'>\n<title>Test</title>\n</head>\n<body lang='EN-US'>\n<p class='XYZΨΩ' title='ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'>Greek uppercase</p>\n<div>\n<div>d1</div>\n<p class='p1'>p1</p>\n</div>\n<div>\n<div>d2</div>\n<p class='p2'>p2</p>\n<p class='p3'>p3</p>\n<p class='p4'>p4</p>\n</div>\n<div>\n<div>d3</div>\n<span>span</span>\n<p class='p5'>p5</p>\n</div>\n<div>\n<div>d1</div>\n<p class='p1'>p1</p>\n</div>\n<div>\n<div>d2</div>\n<p class='p2'>\n<span>span1</span>\n<b>b1</b>\n</p>\n</div>\n<div>\n<div>d3</div>\n<p class='p3'>\n<span>span2</span>\n<b>b2</b>\n</p>\n</div>\n<article>\n<div dir='rtl'>\n<span>test rtl</span>\n<div dir='ltr'>\n<span>test1 ltr</span>\n<div dir='rtl'>עִבְרִית rtl<span>test2 rtl</span></div>\n<span>test3 ltr</span>\n<div dir='rtl'><span>test6 rtl</span></div>\n<div><span>test7 ltr</span></div>\n</div>\n<span>test8 rtl</span>\n</div>\n<div dir='ltr'>\n<span>test ltr</span>\n<div dir='rtl'>\n<span>test1 rtl</span>\n<div dir='ltr'>ltr<span>test2 ltr</span></div>\n<span>test3 rtl</span>\n<div dir='ltr'><span>test6 ltr</span></div>\n<div><span>test7 rtl</span></div>\n</div>\n<span>test8 ltr</span>\n</div>\n</article>\n<article lang='en'>\n<div lang='en-us'>\n<p class='p1'>1.</p>\n<p class='p2'>2.</p>\n<p class='p3'>3.</p>\n<p class='P4'>4.</p>\n</div>\n</article>\n<article lang='fr'>\n<div>\n<p class='p1'>5.</p>\n</div>\n<div>\n<p class='p2'>6.</p>\n<p class='p3'>7.</p>\n</div>\n<p lang='de-Latn-DE-1996'>8.</p>\n<p lang='en-GB'>10.</p>\n<p lang='fr-Latn-FR'>12.</p>\n<p lang='de'>8.</p>\n<p lang='en'>9.</p>\n<p lang='en-GB'>10.</p>\n<p lang='fr'>11.</p>\n<p lang='fr-Latn-FR'>12.</p>\n</article>\n<div>\n<p class='c1'>1.</p>\n<h2>h2.</h2>\n<p class='c2'>2.</p>\n<p class='c3'>3.</p>\n<h2>h2.</h2>\n<p class='c4'>4</p>\n<p class='c5'>5</p>\n<p class='c6'>6</p>\n</div>\n<ul id='list'>\n<li class='c1' title='Item One'>1</li>\n<li class='c2' title='Item Two'>2</li>\n<li class='c3'>3</li>\n<li class='c4'>4</li>\n<li class='c5'>5</li>\n<li class='c6'>6</li>\n<li class='c7'>7</li>\n<li class='c8'>8</li>\n<li class='c9'>9</li>\n<li class='c10'>10</li>\n</ul>\n<ul id='list'>\n<li class='c1' title='Item One'><b>1</b></li>\n<li class='c2' title='Item Two'><b>2</b></li>\n<li class='c3'><b>3</b></li>\n<li class='c4'><b>4</b></li>\n<li class='c5'><b>5</b></li>\n<li class='c6'><b>6</b></li>\n<li class='c7'><b>7</b></li>\n</ul>\n<div>\n<div>d1</div>\n<p class='p1'>p1</p>\n</div>\n<div>\n<div>d2</div>\n<p class='p2'>p2</p>\n</div>\n<div>\n<div>d3</div>\n<span>span</span>\n</div>\n<ul id='list'>\n<li class='c1' title='Item One'>1</li>\n<li class='c2' title='Item Two'>2</li>\n<li class='c3'>3</li>\n<li class='c4'>4</li>\n<li class='c5'>5</li>\n<li class='c6'>6</li>\n<li class='c7'>7</li>\n<li class='c8'>8</li>\n<li class='c9'>9</li>\n</ul>\n<div>\n<div>d1</div>\n<p class='p0'>p0</p>\n<p class='p1'>p1</p>\n</div>\n<div>\n<div>d2</div>\n<p class='p2'>p2</p>\n</div>\n<div>\n<div>d3</div>\n<span>span</span>\n</div>\n<ul id='list'>\n<li class='c1' title='Item One'>1</li>\n<li class='c2' title='Item Two'>2</li>\n<li class='c3'>3</li>\n<li class='c4'>4</li>\n<li class='c5'>5</li>\n<li class='c6'>6</li>\n<li class='c7'>7</li>\n</ul>\n<main id='main'>\n<div id='header'>\n<h1>Test</h1>\n</div>\n<div class='descr'>\n<p class='p1'><b>Css to XPath</ b> convertor</b></p>\n<p> The convertor ...</p>\n</div>\n<div id='sidebar'>\n<h2>Content</h2>\n<ul>\n<li>Header\n<ul class='c1'>\n<li><a href='#'>Item </a></li>\n<li><a href='#'>Item </a></li>\n<li>Subheader\n<ul class='c2'>\n<li><a href='#'>Item </a></li>\n<li><a href='#'>Item </a></li>\n<li>SubSubheader\n<ul class='c3'>\n<li><a href='#'>Item </a></li>\n<li><a href='#'>Item </a></li>\n</ul>\n</li>\n</ul>\n</li>\n</ul>\n</li>\n<ul>\n</ul></ul></div>\n<div class='has-text content'>\n<p class='p1'>Css to XPath convertor</p>\n<p>convertor</p>\n<p>...</p>\n</div>\n</main>\n<ul>\n<li class=\"noted\">Diego</li>\n<li>Shilpa</li>\n<li class=\"noted\">Caterina</li>\n<li>Jayla</li>\n<li>Tyrone</li>\n<li>Ricardo</li>\n<li class=\"noted\"><span>Gila</span></li>\n<li>Sienna</li>\n<li>Titilayo</li>\n<li class=\"noted\">Lexi</li>\n<li><span>Aylin</span></li>\n<li>Leo</li>\n<li>Leyla</li>\n<li class=\"noted\"><span>Bruce</span></li>\n<li>Aisha</li>\n<li>Veronica</li>\n<li class=\"noted\">Kyouko</li>\n<li>Shireen</li>\n<li><span>Tanya</span></li>\n<li class=\"noted\">Marlene</li>\n</ul>\n<div>\n<p class='noted'>1.</p>\n<p>2.</p>\n<p class='noted'>3.</p>\n<p> 4.</p>\n<p class='noted'>5.</p>\n<p class='noted'>6.</p>\n<p>7.</p>\n<p>8.</p>\n<p class='noted'>9.</p>\n<p class='noted'>10.</p>\n</div>\n<div>\n<p class='non-escaped'>non-escaped.</p>\n<p class='1escaped'>escaped.</p>\n<p class=\"es'cap'ed\">escaped.</p>\n<p class='es\"cap\"ed'>escaped.</p>\n<p class='#escaped'>escaped.</p>\n<p class='#escaped-2'>escaped.</p>\n<p class='es{cap}ed'>escaped.</p>\n<p id='non-escaped'>non-escaped.</p>\n<p id='1escaped'>escaped.</p>\n<p id=\"es'cap'ed\">escaped.</p>\n<p id='es\"cap\"ed'>escaped.</p>\n<p id='#escaped'>escaped.</p>\n<p id='#escaped-2'>escaped.</p>\n<p id='es{cap}ed'>escaped.</p>\n</div>\n<div>\n<p class='p2 d'>2.</p>\n<p class='p2'>2.</p>\n<p class='dp2'>2.</p>\n<p class='dp2d'>2.</p>\n<p class='p2d'>2.</p>\n<p class='p2-d'>2.</p>\n<p class='p2'>2.</p>\n</div>\n<a name=test>Test name</a>\n<ol>\n<li>Saturn</li>\n<li>\n<ul>\n<li>Mimas</li>\n<li>Enceladus</li>\n<li>\n<ol class='c1'>\n<li>Voyager</li>\n<li>Cassini</li>\n</ol>\n</li>\n<li>Tethys</li>\n</ul>\n</li>\n<li>Uranus</li>\n<li>\n<ol>\n<li>Titania</li>\n<li>Oberon</li>\n</ol>\n</li>\n</ol>\n<a href=test>Test href</a>\n<article>\n<div>div 0.</div>\n<div class='Div'>div 1.</div>\n<p class='P1'>p 1</ p>\n<div class='div'>div 2.</div>\n<div class='DiV Parent'>div 3.\n<p class='P2'>p 1</p>\n<i class='I1'>i 1.</i>\n<em class='Emphasize'>em 1.</em>\n<em class='Emphasize'>em 2.</em>\n<div class='last-child'>div 4.</div>\n<div class='diV4 last-child'>div 4.</div>\n<div class='last'>div 5.</div>\n<div class='diV5 last'>div 5.</div>\n</div>\n</article>\n<article>\n<div class='div1'>div 1.</div>\n<p class='p1'>p 1</ p>\n<div class='div2'>div 2.</div>\n<div class='div3'>div 3.\n<p class='p2'>p 1</p>\n<i class='i1'>i 1.</i>\n<em class='em1'>em 1.</em>\n<em class='em2'>em 2.</em>\n<div class='div4'>div 2.</div>\n</div>\n<section first>section 1.\n<i class='i2'>i 1.</i>\n<p class='p3'>p 1</p>\n<em class='em3'>em 1.</em>\n<p class='p4'>p 1</p>\n<em class='em4'>em 2.</em>\n<div class='div5'>div 2.</div>\n</section>\n</article>\n<meta charset='utf-8'>\n<title>Test</title>\n<link rel='stylesheet' href='style.css'>\n<body lang='EN-US En-gb en-au en-nz'>\n<main id='main'>\n<div id='sidebar'>\n<h2>Content</h2>\n</div>\n<div id='header'>\n<h1>Test</h1>\n</div>\n<div class='has-text content'>\n<p id='p1'>Css to XPath convertor</p>\n<p id='p2'><b>Css</b> to <b>XPath</b> convertor</p>\n<p id='p3'>Css to XPath <b>convertor</b></p>\n</div>\n<div id='lists'>\n<div class='nested'>\n<h3>Number  list</h3>\n<ul id='list'>\n<li class='c1' title='Item One'><b>1</b></li>\n<li class='c2' title='Item Two'><b>2</b></li>\n<li class='c3'><b>3</b></li>\n<li class='c4'><b>4</b></li>\n<li class='c5'><b>5</b></li>\n<li class='c6'><b>6</b></li>\n<li class='c7'><b>7</b></li>\n</ul>\n<ul class='list2'>\n<li class='c21' title='Item Twenty One'>21</li>\n<li class='c22' title='Item Twenty Two'>22</li>\n</ul>\n</div>\n</div>\n<div id='empty'></div>\n</main>\n</body>\n</body>\n</html>",CssW3CSelector:'\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n<meta charset=\'utf-8\'>\n<title>Te</title>\n</head>\n<body lang=\'EN-US\'>\n<ul>\n<li>Th</li>\n<li>Th</li>\n</ul>\n<p>Th</p>\n<address>Th</address>\n<p>\n<span class="t1">Th</span>\n</p>\n<ul>\n<li class="t1">Th</li>\n</ul>\n<foo>An</foo>\n<p>\n<span class="t1">Th</span>\n</p>\n<ul>\n<li class="t1">Th</li>\n</ul>\n<p id="foo">Th</p>\n<p title="title">Th</p>\n<address title="foo">\n<span title="b">Th</span>\n<span title="aa">ha</span>\n</address>\n<p class="a b c">Th</p>\n<address title="tot foo bar">\n<span class="a c">Th</span>\n<span class="a bb c">ha</span>\n</address>\n<p lang="en-gb">Th</p>\n<address lang="fi">\n<span lang="en-us">Th</span>\n<span lang="en-fr">ha</span>\n</address>\n<p title="foobar">Th<br><br>\nb</p>\n<p title="foobar">Th</p>\n<p title="foobarufoo">Th</p>\n<ul>\n<li class="t1">Th</li>\n<li class="t2">Th</li>\n<li class="t2">\n<span class="t33">Th</span>\n</li>\n</ul>\n<p class="t1 t2">Th</p>\n<div class="test">Th</div>\n<p class="t1">Th</p>\n<p class="t1 t2">Th</p>\n<p class="t1 t2">Th</p>\n<div class="t3">Th</div>\n<address class="t4 t5 t6">Th</address>\n<p class="t1 t2">Th</p>\n<ul>\n<li id="t1">Th</li>\n<li id="t2">Th</li>\n<li id="t3"><span id="t44">Th</span></li>\n</ul>\n<p id="test">Th</p>\n<div id="pass">Th</div>\n<p class="warning">Th</p>\n<div id="Aone" xml:id="Atwo" title="Athree">Th</div>\n<p id="Bone">Th</p>\n<p xml:id="Ctwo">Th</p>\n<p title="Dthree">Th</p>\n\x3c!-- T--\x3e\n<p class="test">Th</p>\n<p class=".test">Th</p>\n<p class="foo">Th</p>\n<p class="foo quux">Th</p>\n<p class="foo quux">Th</p>\n<p class="bar">Th</p>\n<p>Th</p>\n<p>Th</p>\n<div>\n<p> T</p>\n<div id="test"></div>\n</div>\n<div>\n<p> T</p>\n<div id="test1"></div>\n<div id="test2"></div>\n</div>\n<div>\n<p> T</p>\n<div id="stub"></div>\n<div></div>\n<div><div>\x3c!-- <--\x3e<div><div id="test"></div></div></div></div>\n</div>\n<div>\n<div><p id="two">Th</p><p id="three">Th</p><p>Th</p></div>\n</div>\n<p>Th</p>\n<p>Th</p>\n<ul>\n<li class="red">Th</li>\n<li>Se</li>\n<li class="red">Th</li>\n<li>Fo</li>\n<li class="red">Th</li>\n<li>Si</li>\n</ul>\n<ol>\n<li>Fi</li>\n<li class="red">Th</li>\n<li>Th</li>\n<li class="red">Th</li>\n<li>Fi</li>\n<li class="red">Th</li>\n</ol>\n<div>\n<table border="1" class="t1">\n<tr class="red">\n<td>Gr</td>\n<td>1.</td>\n<td>1.</td>\n</tr>\n<tr class="red">\n<td>Gr</td>\n<td>2.</td>\n<td>2.</td>\n</tr>\n<tr class="red">\n<td>Gr</td>\n<td>3.</td>\n<td>3.</td>\n</tr>\n<tr class="red">\n<td>Gr</td>\n<td>4.</td>\n<td>4.</td>\n</tr>\n<tr>\n<td>5.</td>\n<td>5.</td>\n<td>5.</td>\n</tr>\n<tr>\n<td>6.</td>\n<td>6.</td>\n<td>6.</td>\n</tr>\n</table>\n<table class="t2" border="1">\n<tr>\n<td class="red">gr</td>\n<td>1.</td>\n<td>1.</td>\n<td class="red">gr</td>\n<td>1.</td>\n<td>1.</td>\n<td class="red">gr</td>\n<td>1.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td>2.</td>\n<td>2.</td>\n<td class="red">gr</td>\n<td>2.</td>\n<td>2.</td>\n<td class="red">gr</td>\n<td>2.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td>3.</td>\n<td>3.</td>\n<td class="red">gr</td>\n<td>3.</td>\n<td>3.</td>\n<td class="red">gr</td>\n<td>3.</td>\n</tr>\n</table>\n</div>\n<ul>\n<li class="green">Th</li>\n<li>Se</li>\n<li class="green">Th</li>\n<li>Fo</li>\n<li class="green">Th</li>\n<li>Si</li>\n</ul>\n<ol>\n<li>Fi</li>\n<li class="green">Th</li>\n<li>Th</li>\n<li class="green">Th</li>\n<li>Fi</li>\n<li class="green">Th</li>\n</ol>\n<div>\n<table border="1" class="t1">\n<tr class="green">\n<td>Gr</td>\n<td>1.</td>\n<td>1.</td>\n</tr>\n<tr class="green">\n<td>Gr</td>\n<td>2.</td>\n<td>2.</td>\n</tr>\n<tr class="green">\n<td>Gr</td>\n<td>3.</td>\n<td>3.</td>\n</tr>\n<tr class="green">\n<td>Gr</td>\n<td>4.</td>\n<td>4.</td>\n</tr>\n<tr>\n<td>5.</td>\n<td>5.</td>\n<td>5.</td>\n</tr>\n<tr>\n<td>6.</td>\n<td>6.</td>\n<td>6.</td>\n</tr>\n</table>\n<p></p>\n<table class="t2" border="1">\n<tr>\n<td class="green">gr</td>\n<td>1.</td>\n<td>1.</td>\n<td class="green">gr</td>\n<td>1.</td>\n<td>1.</td>\n<td class="green">gr</td>\n<td>1.</td>\n</tr>\n<tr>\n<td class="green">gr</td>\n<td>2.</td>\n<td>2.</td>\n<td class="green">gr</td>\n<td>2.</td>\n<td>2.</td>\n<td class="green">gr</td>\n<td>2.</td>\n</tr>\n<tr>\n<td class="green">gr</td>\n<td>3.</td>\n<td>3.</td>\n<td class="green">gr</td>\n<td>3.</td>\n<td>3.</td>\n<td class="green">gr</td>\n<td>3.</td>\n</tr>\n</table>\n</div>\n<p>Th</p>\n<address>An</address>\n<p>So</p>\n<p class="red">Bu</p>\n<dl>\n<dt class="red">Fi</dt>\n<dd class="red">Fi</dd>\n<dt>Se</dt>\n<dd>Se</dd>\n<dt>Th</dt>\n<dd>Th</dd>\n<dt class="red">Fo</dt>\n<dd class="red">Fo</dd>\n<dt>Fi</dt>\n<dd>Fi</dd>\n<dt>Si</dt>\n<dd>Si</dd>\n</dl>\n<p class="red">Th</p>\n<address>Bu</address>\n<p>So</p>\n<p>An</p>\n<dl>\n<dt>Fi</dt>\n<dd>Fi</dd>\n<dt>Se</dt>\n<dd>Se</dd>\n<dt class="red">Th</dt>\n<dd class="red">Th</dd>\n<dt>Fo</dt>\n<dd>Fo</dd>\n<dt>Fi</dt>\n<dd>Fi</dd>\n<dt class="red">Si</dt>\n<dd class="red">Si</dd>\n</dl>\n<div>\n<table class="t1" border="1">\n<tr>\n<td class="red">gr</td>\n<td>1.</td>\n<td>1.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td>2.</td>\n<td>2.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td>3.</td>\n<td>3.</td>\n</tr>\n</table>\n</div>\n<p>Th<span>an</span>\n</p>\n<div>\n<table class="t1" border="1">\n<tr>\n<td>1.</td>\n<td>1.</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>2.</td>\n<td>2.</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>3.</td>\n<td>3.</td>\n<td class="red">gr</td>\n</tr>\n</table>\n</div>\n<p>\n<span>Th</span> a</p>\n<div>Th<address class="red">A </address>\n<address>A </address>\n<address>A </address>\n</div>\n<div>\n<address>A </address>\n<address>A </address>\n<address class="red">A </address>\nT</div>\n<p>Th</p>\n<div>Th<p class="red">Th</p>\n</div>\n<div class="t1">\n<p>Th</p>\n<address class="red">Bu</address>\n<p>Th</p>\n</div>\n<div class="t1">\n<p class="red">Th</p>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="red">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n</div>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="white">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n<div class="t1">\n<p class="white">Th</p>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="white">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n</div>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="green">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n<div>\n<p class="red test">Th</p>\n<div>\n<p class="red test">Th</p>\n</div>\n</div>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="white test">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n<div>\n<p class="white test">Th</p>\n<div>\n<p class="white test">Th</p>\n</div>\n</div>\n<table>\n<tbody>\n<tr>\n<td>\n<p class="green test">Th</p>\n</td>\n</tr>\n</tbody>\n</table>\n<div> T</div>\n<div class="control"> T</div>\n<div> T</div>\n<p> T</p>\n<div class="stub">\n<p>Th</p>\n<p class="red">Bu</p>\n<p class="red">An</p>\n<address>Th</address>\n<p>Th</p>\n</div>\n<div class="stub">\n<p class="green">Th</p>\n<p class="white">Bu</p>\n<p class="white">An</p>\n<address class="green">Th</address>\n<p class="green">Th</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p class="red">Bu</p>\n<p class="red">An</p>\n<address>Th</address>\n<p class="red">Th</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p class="green">Bu</p>\n<p class="green">An</p>\n<address>Th</address>\n<p class="green">Th</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p title="on chante?">Th</p>\n<p title="si on chantait">\n<span title="si il chantait">Th</span>\n</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p title="on chante?">Th</p>\n<p title="si on chantait">\n<span title="si il chante">Th</span>\n</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p class="bar foofoo tut">Th</p>\n<p class="bar foo tut">\n<span class="tut foo2">Th</span>\n</p>\n</div>\n<div class="stub">\n<p>Th</p>\n<p id="foo2">Th</p>\n<p id="foo">\n<span>Th</span>\n</p>\n</div>\n<ul>\n<li>Fi</li>\n<li class="red">Th</li>\n<li>Th</li>\n<li class="red">Th</li>\n<li>Fi</li>\n<li class="red">Th</li>\n</ul>\n<ol>\n<li class="red">Th</li>\n<li>Se</li>\n<li class="red">Th</li>\n<li>Fo</li>\n<li class="red">Th</li>\n<li>Si</li>\n</ol>\n<div>\n<table border="1" class="t1">\n<tr>\n<td>1.</td>\n<td>1.</td>\n<td>1.</td>\n</tr>\n<tr>\n<td>2.</td>\n<td>2.</td>\n<td>2.</td>\n</tr>\n<tr>\n<td>3.</td>\n<td>3.</td>\n<td>3.</td>\n</tr>\n<tr>\n<td>4.</td>\n<td>4.</td>\n<td>4.</td>\n</tr>\n<tr class="red">\n<td>Gr</td>\n<td>5.</td>\n<td>5.</td>\n</tr>\n<tr class="red">\n<td>Gr</td>\n<td>6.</td>\n<td>6.</td>\n</tr>\n</table>\n<p></p>\n<table class="t2" border="1">\n<tr>\n<td>1.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>1.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>1.</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>2.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>2.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>2.</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>3.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>3.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>3.</td>\n<td class="red">gr</td>\n</tr>\n</table>\n</div>\n<ul>\n<li>Fi</li>\n<li class="green">Th</li>\n<li>Th</li>\n<li class="green">Th</li>\n<li>Fi</li>\n<li class="green">Th</li>\n</ul>\n<ol>\n<li class="green">Th</li>\n<li>Se</li>\n<li class="green">Th</li>\n<li>Fo</li>\n<li class="green">Th</li>\n<li>Si</li>\n</ol>\n<div>\n<table border="1" class="t1">\n<tr>\n<td>1.</td>\n<td>1.</td>\n<td>1.</td>\n</tr>\n<tr>\n<td>2.</td>\n<td>2.</td>\n<td>2.</td>\n</tr>\n<tr>\n<td>3.</td>\n<td>3.</td>\n<td>3.</td>\n</tr>\n<tr>\n<td>4.</td>\n<td>4.</td>\n<td>4.</td>\n</tr>\n<tr class="green">\n<td>Gr</td>\n<td>5.</td>\n<td>5.</td>\n</tr>\n<tr class="green">\n<td>Gr</td>\n<td>6.</td>\n<td>6.</td>\n</tr>\n</table>\n<p></p>\n<table class="t2" border="1">\n<tr>\n<td>1.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>1.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>1.</td>\n<td class="green">gr</td>\n</tr>\n<tr>\n<td>2.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>2.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>2.</td>\n<td class="green">gr</td>\n</tr>\n<tr>\n<td>3.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>3.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>3.</td>\n<td class="green">gr</td>\n</tr>\n</table>\n</div>\n<p class="red">Th</p>\n<address>An</address>\n<p class="red">Th</p>\n<p>Bu</p>\n<dl>\n<dt>Fi</dt>\n<dd>Fi</dd>\n<dt class="red">Se</dt>\n<dd class="red">Se</dd>\n<dt class="red">Th</dt>\n<dd class="red">Th</dd>\n<dt>Fo</dt>\n<dd>Fo</dd>\n<dt class="red">Fi</dt>\n<dd class="red">Fi</dd>\n<dt class="red">Si</dt>\n<dd class="red">Si</dd>\n</dl>\n<div>\n<table class="t1" border="1">\n<tr>\n<td>1.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>2.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n</tr>\n<tr>\n<td>3.</td>\n<td class="red">gr</td>\n<td class="red">gr</td>\n</tr>\n</table>\n</div>\n<p>Th<span>sh</span> u</p>\n<div>\n<table class="t1" border="1">\n<tr>\n<td>1.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n</tr>\n<tr>\n<td>2.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n</tr>\n<tr>\n<td>3.</td>\n<td class="green">gr</td>\n<td class="green">gr</td>\n</tr>\n</table>\n</div>\n<p>Th<span>sh</span> u</p>\n<div>\n<table class="t1" border="1">\n<tr>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>1.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>2.</td>\n</tr>\n<tr>\n<td class="red">gr</td>\n<td class="red">gr</td>\n<td>3.</td>\n</tr>\n</table>\n</div>\n<p>Th<span>pa</span> b</p>\n<div>\n<table class="t1" border="1">\n<tr>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>1.</td>\n</tr>\n<tr>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>2.</td>\n</tr>\n<tr>\n<td class="green">gr</td>\n<td class="green">gr</td>\n<td>3.</td>\n</tr>\n</table>\n</div>\n<p>Th<span>pa</span> b</p>\n<div>Th<address>A </address>\n<address class="red">A </address>\n<address class="red">A </address>\n</div>\n<div>\n<address class="red">A </address>\n<address class="red">A </address>\n<address>A </address>\n</div>\n<p class="red">Th</p>\n<div>Th<p>Th</p>\n</div>\n<p class="green">Th</p>\n<div>Th<p>Th</p>\n</div>\n<main>\n<div>I </div>\n<p>I </p>\n<div>I </div>\n<div>I <i>I </i>\n<i name>I </i>\n<em>I </em>\n<em>I </em>\n</div>\n</main>\n<div class="t1">\n<p class="red">Th</p>\n<address>Bu</address>\n<p class="red">Th</p>\n</div>\n<p>Th</p>\n<blockquote>\n<div>\n<div>\n<p>Th</p>\n</div>\n</div>\n</blockquote>\n<blockquote><div>Th</div></blockquote>\n<div>Th</div>\n<div>Th</div>\n<p>Th</p>\n<blockquote><div>Th</div></blockquote>\n<div>\n<div>\n<p>Th</p>\n</div>\n</div>\n<p html:lang="en-us">Th</p>\n<q foo="bargain-trash">Th</q>\n<r foo="bar-drink-glass">Th</r>\n<s foo="bar-drink-glass">Th</s>\n<p title="si on chantait">Th</p>\n<q title="et si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<p title="si on chantait">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<p title="si on chantait">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<p title="si on chantait">Th</p>\n<q foo="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<p title="si on chantait">Th</p>\n<q foo="si on chantait">Th</q>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<p class="un deux trois">Th</p>\n<q a:bar="un deux trois">Th</q>\n<q foo="un second deuxieme trois">Th</q>\n<r foo="un deux trois">Th</r>\n<s foo="un deux trois">Th</s>\n<p lang="en-us">Th</p>\n<q foo="un-deux-trois">Th</q>\n<q foo="un-second-deuxieme-trois">Th</q>\n<r foo="un-d-trois">Th</r>\n<s foo="un-d-trois">Th</s>\n<p title="si on chantait">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t b:ti="si on chantait">Th</t>\n<p title="si on chantait">Th</p>\n<q title="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<p title="si on chantait">Th</p>\n<q title="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t title="si nous chantions">Th</t>\n<p class="bar foo toto">Th</p>\n<address class="bar foofoo toto">Th</address>\n<q class="bar foo toto">Th</q>\n<r b:class="bar foo toto">Th</r>\n<p lang="foo-bar">Th</p>\n<address lang="foo-b">Th</address>\n<address lang="foo-barbar-toto">Th</address>\n<q myattr="tat-tut-tot">Th</q>\n<r b:myattr="tat-tut-tot">Th</r>\n<p title="si on chantait">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t b:ti="si on chantait">Th</t>\n<p title="si on chantait">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t title="si nous chantions">Th</t>\n<div class="test">\n<p>Th</p>\n<p>Th</p>\n<p xmlns="">Th</p>\n<p>\n<l>Th</l>\n</p>\n</div>\n<div class="test">\n<div class="stub">\n<p>Th</p>\n<p>Th</p>\n<p xmlns="">Th</p>\n<p>Th</p>\n</div>\n<address>Th</address>\n<s>Th</s>\n<t xmlns="">Th</t>\n<u>Th</u>\n</div>\n<div class="stub">\n<p>Th</p>\n<p>Th</p>\n<l>\n<p xmlns="">Th</p>\n</l>\n<p>Th</p>\n</div>\n<div class="stub">\n<address>Th</address>\n<s>Th</s>\n<t xmlns="">Th</t>\n<u>\n<v>Th</v>\n</u>\n</div>\n<div class="stub">\n<address>Th</address>\n<s>Th</s>\n<t xmlns="">Th</t>\n<u>Th</u>\n</div>\n<div class="stub">\n<address>Th</address>\n<s>Th</s>\n<u>Th</u>\n</div>\n<div class="stub">\n<t xmlns="">Th</t>\n</div>\n<div class="stub">\n<p title="foo">Th</p>\n<q title="foo">Th</q>\n<s title="foobar">Th</s>\n<r b:title="foo">Th</r>\n</div>\n<div class="stub">\n<q foo="hgt bardot f">Th</q>\n<r foo="hgt bar f">Th</r>\n<s foo="hgt bar f">Th</s>\n</div>\n<div class="stub">\n<q foo="bargain-trash">Th</q>\n<r foo="bar-drink-glass">Th</r>\n<s foo="bar-drink-glass">Th</s>\n</div>\n<div class="stub">\n<q title="et si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n</div>\n<div class="stub">\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n</div>\n<div class="stub">\n<q foo="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n</div>\n<div class="stub">\n<q foo="si on chantait">Th</q>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n</div>\n<div class="stub">\n<p class="un deux trois">Th</p>\n<p class="un deu trois">Th</p>\n<q a:bar="un deux trois">Th</q>\n<q foo="un second deuxieme trois">Th</q>\n<r foo="un deux trois">Th</r>\n<s foo="un deux trois">Th</s>\n</div>\n<div class="stub">\n<p lang="en-us">Th</p>\n<p lang="fr" class="foo">Th</p>\n<q foo="un-deux-trois">Th</q>\n<q foo="un-second-deuxieme-trois">Th</q>\n<r foo="un-d-trois">Th</r>\n<s foo="un-d-trois">Th</s>\n</div>\n<div class="stub">\n<p title="si on chantait">Th</p>\n<p title="si il chantait" class="red">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t b:ti="si on chantait">Th</t>\n</div>\n<div class="stub">\n<p title="si on chantait">Th</p>\n<p title="si tu chantais" class="red">Th</p>\n<q title="si nous chantions">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t b:ti="si on chantait">Th</t>\n</div>\n<div class="stub">\n<q title="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n</div>\n<div class="stub">\n<q title="si on chantait">Th</q>\n<r title="si on chantait">Th</r>\n<s b:title="si on chantait">Th</s>\n<t title="si nous chantions">Th</t>\n</div>\n<div class="stub">\n<p class="bar foo toto">Th</p>\n<address class="bar foofoo toto">Th</address>\n<q class="bar foo toto">Th</q>\n<r b:class="bar foo toto">Th</r>\n</div>\n<div class="stub">\n<p lang="foo-bar">Th</p>\n<address lang="foo-b">Th</address>\n<address lang="foo-barbar-toto">Th</address>\n<q lang="foo-bar">Th</q>\n<r b:lang="foo-bar">Th</r>\n</div>\n<test xmlns="http://www.example.org/">\n<line type="odd">Th</line>\n<line type="even">Th</line>\n<line type="odd" hidden="hidden">Th</line>\n<line type="even">Th</line>\n<line type="odd">Th</line>\n<line type="even">Th</line>\n<line type="odd">Th</line>\n<line type="even" hidden="hidden">Th</line>\n<line type="odd">Th</line>\n<line type="even">Th</line>\n<line type="odd">Th</line>\n<line type="even" hidden="hidden">Th</line>\n<line type="odd" hidden="hidden">Th</line>\n<line type="even">Th</line>\n<line type="odd">Th</line>\n</test>\n<test xmlns="http://www.example.org/">\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="" hidden="hidden">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="" hidden="hidden">Th</line>\n<line type="match" hidden="hidden">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n</test>\n<p>Th</p>\n<address></address>\n<div class="text">Th</div>\n<address>\x3c!-- --\x3e</address>\n<div class="text">Th</div>\n<p>(N</p>\n<address> </address>\n<div class="text">Th</div>\n<address><span></span></address>\n<div class="text">Th</div>\n<address xmlns="http://tests.example.org/xml-only/"></address>\n<div class="text">Th</div>\n<p>(N</p>\n<p class="5cm">Th</p>\n<p class="one.word">Th</p>\n<div xmlns="http://www.w3.org/2000/xmlns/">\n<p attribute="pass">Th</p>\n</div>\n<div>\n<p attribute="pass">Th</p>\n</div>\n<div xmlns="http://www.w3.org/2000/xmlns/" xmlns:ns="http://www.w3.org/2000/xmlns/">\n<ns:p ns:attribute="pass">Th</ns:p>\n<p attribute="pass">Th</p>\n</div>\n<div>\n<p attribute="pass">Th</p>\n</div>\n<p id="id" class="class test">Th</p>\n<div id="theid" class="class test">Th</div>\n<p xmlns="http://www.w3.org/1999/xhtml">Th</p>\n<address xmlns="http://www.w3.org/1999/xhtml">Th</address>\n<p xmlns="http://www.w3.org/1999/xhtml" class="red">Th</p>\n<p xmlns="http://www.w3.org/1999/xhtml" class="red">Th</p>\n<dl xmlns="http://www.w3.org/1999/xhtml">\n<dt class="red">Fi</dt>\n<dd class="red">Fi</dd>\n<dt class="red">Se</dt>\n<dd class="red">Se</dd>\n<dt>Th</dt>\n<dd>Th</dd>\n<dt class="red">Fo</dt>\n<dd class="red">Fo</dd>\n<dt class="red">Fi</dt>\n<dd class="red">Fi</dd>\n<dt>Si</dt>\n<dd>Si</dd>\n</dl>\n<p xmlns="http://www.w3.org/1999/xhtml">Th</p>\n<address xmlns="http://www.w3.org/1999/xhtml">Th</address>\n<p xmlns="http://www.w3.org/1999/xhtml" class="green">Th</p>\n<p xmlns="http://www.w3.org/1999/xhtml" class="green">Th</p>\n<dl xmlns="http://www.w3.org/1999/xhtml">\n<dt class="green">Fi</dt>\n<dd class="green">Fi</dd>\n<dt class="green">Se</dt>\n<dd class="green">Se</dd>\n<dt>Th</dt>\n<dd>Th</dd>\n<dt class="green">Fo</dt>\n<dd class="green">Fo</dd>\n<dt class="green">Fi</dt>\n<dd class="green">Fi</dd>\n<dt>Si</dt>\n<dd>Si</dd>\n</dl>\n<test xmlns="http://www.example.org/">\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match" hidden="hidden">Th</line>\n<line type="" hidden="hidden">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="" hidden="hidden">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n<line type="">Th</line>\n<line type="match">Th</line>\n<line type="">Th</line>\n</test>\n</body>\n</html>',"not-nth":"<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n\n<div>\n\t<p class='c1'>1.</p>\n\t<h2>h2.</h2>\n\t<p class='c2'>2.</p>\n\t<p class='c3'>3.</p>\n\t<h2>h2.</h2>\n\t<p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<div id=div1>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t\x3c!-- <p>The tenth p.</p> --\x3e\n</div>\n<hr>\n\n<div id=first>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n    <p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<hr>\n\n<div id=second>\n    <p>The first p.</p>\n\t<p>The second p.</p>\n\t<p>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\t<b>The B element.</b>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>\n\n<div id=third>\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>\n\n</body>\n</html>","nth-child-of-selector":"<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n<div>\n\t<ul>\n\t\t<li class=\"c1 c2\">peacock</li>\n\t\t<li>marten</li>\n\t\t<li>basilisk</li>\n\t\t<li class=\"c1 c2\">buzzard</li>\n\t\t<li>reptile</li>\n\t\t<li>crane</li>\n\t\t<li>mammal</li>\n\t\t<li class=\"c2 c1\">platypus</li>\n\t\t<li>hedgehog</li>\n\t\t<li class=\"c1\">gibbon</li>\n\t\t<li class=\"c1 c2\">wildebeest</li>\n\t\t<li>crab</li>\n\t\t<li>porcupine</li>\n\t\t<li>goldfish</li>\n\t\t<li class=\"c1 c2\">owl</li>\n\t\t<li>chickadee</li>\n\t\t<li>gopher</li>\n\t\t<li class=\"c1 c2\">puma</li>\n\t\t<li>goat</li>\n\t\t<li>unicorn</li>\n\t\t<li>limpet</li>\n\t\t<li>chameleon</li>\n\t\t<li class=\"c1 c2\">pelican</li>\n\t\t<li>gamefowl</li>\n\t\t<li>possum</li>\n\t\t<li>crocodile</li>\n\t\t<li class=\"c2 c1\">cricket</li>\n\t\t<li>lemming</li>\n\t\t<li>chinchilla</li>\n\t\t<li class=\"c1\">spoonbill</li>\n\t\t<li>bee</li>\n\t\t<li>leech</li>\n\t\t<li>elephant</li>\n\t\t<li class=\"c2 c1\">haddock</li>\n\t\t<li>termite</li>\n\t\t<li>squirrel</li>\n\t\t<li>badger</li>\n\t\t<li>stoat</li>\n\t\t<li>anglerfish</li>\n\t\t<li>camel</li>\n\t\t<li class=\"c2 c1\">coral</li>\n\t\t<li>ostrich</li>\n\t\t<li>hookworm</li>\n\t\t<li>prawn</li>\n\t\t<li>chicken</li>\n\t\t<li>mackerel</li>\n\t\t<li class=\"c1 c2\">meerkat</li>\n\t\t<li>iguana</li>\n\t\t<li>worm</li>\n\t\t<li>reindeer</li>\n\t\t<li>cod</li>\n\t\t<li class=\"c1 c2\">caterpillar</li>\n\t\t<li>bison</li>\n\t\t<li>tahr</li>\n\t\t<li class=\"c1 c2\">hummingbird</li>\n\t\t<li>ape</li>\n\t\t<li class=\"c1 c2\">parrotfish</li>\n\t</ul>\n\t<div>\n\t\t<p class='c1'>1</p>\n\t\t<p>2</p>\n\t\t<p class='c2'>3</p>\n\t\t<p class='c1 c2'>4</p>\n\t\t<p>5</p>\n\t\t<p class='c2 c1'>6</p>\n\t\t<p class='c2'>7</p>\n\t\t<p class='c2 c1'>8</p>\n\t\t<p>9</p>\n\t\t<p class='c1 c2'>10</p>\n\t</div>\n\t<div>\n\t\t<p>2</p>\n\t\t<p class='c2'>14</p>\n\t\t<p class='c1'>1</p>\n\t\t<p class='c1 c2'>4</p>\n\t\t<p class='c2'>3</p>\n\t\t<p>5</p>\n\t\t<p class='c2 c1'>6</p>\n\t\t<p class='c1'>12</p>\n\t\t<p class='c2'>7</p>\n\t\t<p class='c2 c1'>8</p>\n\t\t<p>9</p>\n\t\t<p class='c1 c2'>10</p>\n\t\t<p class='c1'>11</p>\n\t\t<p class='c2'>13</p>\n\t</div>\n</div>\n</body>\n</html>",nth:"<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n\n<div>\n\t<p class='c1'>1.</p>\n\t<h2>h2.</h2>\n\t<p class='c2'>2.</p>\n\t<p class='c3'>3.</p>\n\t<h2>h2.</h2>\n\t<p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<div id=div1>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t\x3c!-- <p>The tenth p.</p> --\x3e\n</div>\n<hr>\n\n<div id=first>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n    <p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<hr>\n\n<div id=second>\n    <p>The first p.</p>\n\t<p>The second p.</p>\n\t<p>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\t<b>The B element.</b>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>\n\n<div id=third>\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>\n\n</body>\n</html>"};

/*!****************************
* css2xpath-test.js
******************************/
"use strict";let saveResults;function performTest(){const t={};let e,s=!0;for(const n in cssSelectors){const r=cssSelectors[n];for(let l=0;l<r.paths.length;l++){const o=r.paths[l].replace(/\.html$/,""),a=htmls[o];console.log("testing "+n+" with "+o);const c=(new DOMParser).parseFromString(a,"text/html");if(!c)return;e=[];for(let t=0;t<r.selectors.length;t++){const n=r.selectors[t],l=entitize(n);let o,a,h,p,u=[];const i=toXPath(n,{standard:!0});if(i.error)e.push({error:!0,text:`${l}`,message:i.error});else{p=entitize(i.xpath);try{o=c.querySelectorAll(n)}catch(t){a=!0}try{let t;const e=c.evaluate(i.xpath,c,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);for(;t=e.iterateNext();)u.push(t)}catch(t){h=!0}if(a){let t=u?u.length:NaN;e.push({notValid:"css",text:`${l}`,xpath:`${p}`,xpathCount:t})}if(h){let t=o?o.length:NaN;e.push({notValid:"xpath",css:`${l}`,text:`${p}`,cssCount:t})}if(!a&&!h)if(o.length===u.length)if(0===o.length)e.push({noMatch:!0,css:`${l}`,xpath:`${p}`});else{let t=!0;for(let e=0;e<o.length;e++){o[e]===u[e]||(t=s=!1)}t?e.push({success:!0,css:`${l}`,xpath:`${p}`,count:o.length}):e.push({notReferenceEquals:!0,css:`${l}`,xpath:`${p}`,count:o.length})}else e.push({notEquals:!0,css:`${l}`,xpath:`${p}`,cssCount:o.length,xpathCount:u.length}),s=!1}}t[n]=e}}reportCoverage(t),s&&console.log("All tests are passed")}function reportCoverage(t){let e="<nav><ul>\n",s="",n="<h3>Total results:</h3>",r=0,l=0,o=0,a=0,c=0,h=0;for(let n of Object.keys(t)){const u=t[n],i=n.replace(/\W+/g,"_").toLowerCase();let $=[],g=[],f=[],m=[],b=[],d=[],x=[];u.forEach((t=>{if(t.success)$.push(`<p>${t.css} <b>${t.count} === ${t.count}</b> ${t.xpath}</p>\n`);else if(t.notReferenceEquals)g.push(`<p>${t.css}  <b>${t.count}  !== ${t.count}</b> ${t.xpath}</p>\n`);else if(t.notValid){if("css"===t.notValid){const e=`<p><span style="${NaN===t.xpathCount?"color: #f0f":""}">${t.text}</span> <b>CSS</b><b>  x === ${t.xpathCount}</b> ${t.xpath}</p>\n`;m.push({html:e})}else if("xpath"===t.notValid){const e=`<p>${t.css} <b>${t.cssCount} --- x </b> <span style="color: #f00">${t.text}</span> <b>XPath</b></p>\n`;m.push({html:e,error:!0})}}else t.noMatch?b.push(`<p>${t.css} <b>- 0 -</b> ${t.xpath}</p>\n`):t.warning?x.push(`<p>${t.text} <b>converter warning</b></p>\n`):t.error?f.push(`<p>${t.text} <b>converter error:</b> ${t.message}</p>\n\n`):t.notEquals&&d.push(`<p>${t.css} <b>${t.cssCount} !== ${t.xpathCount}</b> ${t.xpath}</p>\n`)}));let v,y="",C="",E="";if($.length&&(r+=$.length,v=p(n,"Passed",$),y+=v.str,C+=v.summary,E+=v.nav),g.length&&(l+=g.length,v=p(n,"Not reference equals",g,"red"),y+=v.str,C+=v.summary,E+=v.nav),m.length){a+=m.length;const t=m.filter((t=>t.error)).length;v=p(n,"Not valid",m.map((t=>t.html)),"#ff8300",t),y+=v.str,C+=v.summary,E+=v.nav}d.length&&(h+=d.length,v=p(n,"Have different match count",d,"red"),y+=v.str,C+=v.summary,E+=v.nav),b.length&&(c+=b.length,v=p(n,"Have no matches",b),y+=v.str,C+=v.summary,E+=v.nav),f.length&&(o+=f.length,v=p(n,"Coverter errors",f),y+=v.str,C+=v.summary,E+=v.nav),s+=`<section>\n<h2 id="${i}">${n}</h2>\n<h3>Results:</h3>\n`+C+(y||"<p>Has no tests</p>\n")+"</section>",e+=`<li><a href="#${i}">${n}</a></li>\n`,E&&(e+=`<ul>${E}</ul>\n`)}function p(t,e,s,n,r){const l=t+"_"+e.replace(/\W+/g,"_").toLowerCase(),o=r?` <b style="color: red">${r}</b>`:"";return{str:`<h3 id="${l}">${e=n?'<span style="color:'+n+'">'+e+"</span>":e}: <b>${s.length}</b>${o}</h3>\n`+s.join(""),summary:`<p><a href="#${l}">${e}: <b>${s.length}</b></a>${o}</p>\n`,nav:`<li><a href="#${l}">${e}</a> <b>${s.length}</b>${o}</li>\n`}}r&&(n+="<p>Passed: <b>"+r+"</b></p>\n"),l&&(n+="<p>Failed: <b>"+l+"</b></p>\n"),a&&(n+="<p>Not valid: <b>"+a+"</b></p>\n"),h&&(n+="<p>Have different match count: <b>"+h+"</b></p>\n"),c&&(n+="<p>Have no matches: <b>"+c+"</b></p>\n"),o&&(n+="<p>Coverter errors: <b>"+o+"</b></p>\n"),e+="</ul><br><br></nav>\n",document.getElementById("sidebar").innerHTML=e,document.getElementById("summary").innerHTML=n,document.getElementById("result").innerHTML=s,saveResults&&save(s)}function save(t){if("file:"!==location.protocol)return;let e=deEntitize(t.trim().replace(/<h\d[^>]*>/g,"\n").replace(/<\/?[^>]+>/g,""));const s=e.split("\n").filter((t=>!/^(?:Coverter|Css|Have|Not|Passed|Results)/.test(t)));e=s.sort().join("\n").trim();const n=document.getElementById("save-results");n.download="test-results.txt",n.href=URL.createObjectURL(new Blob([e],{type:"text/text"}))}function entitize(t){return t=t.replace(/[<>&"']/g,(t=>"<"===t?"&lt;":">"===t?"&gt;":"&"===t?"&amp;":'"'===t?"&quot;":"&#039;"))}function deEntitize(t){return t=t.replace(/&lt;|&gt;|&amp;|&quot;|&#039;/g,(t=>"&lt;"===t?"<":"&gt;"===t?">":"&amp;"===t?"&":"&quot;"===t?'"':"'"))}performTest(),document.getElementById("save-results").addEventListener("click",(function(){saveResults=!0,performTest()}));

