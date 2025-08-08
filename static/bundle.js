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

  function hasOr(xpath, union) {
    var reg = union ? /(?:[^'" |]|"[^"]*"|'[^']*')+|( or |\|)/g : /(?:[^'" ]|'[^']*'|"[^"]*")+|( or )/g;
    var rm;
    while (rm = reg.exec(xpath)) {
      if (rm[1]) return true;
    }
    return false;
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
        arg = arguments,
        forbid = false;
      for (var i = 0; i < arg.length; i++) {
        if (i === arg.length - 1 && typeof arg[i] === 'boolean') forbid = true;else {
          if (hasOr(arg[i], true)) forbid = true;
          str += arg[i];
        }
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
        var array = this.content;
        if (array) {
          var len = array.length;
          if (len === 1) {
            text += this.or ? array[0].str : '[' + removeBrackets(array[0].str) + ']';
          } else {
            var join = false;
            for (var i = 0; i < len; i++) {
              var obj = array[i],
                str = removeBrackets(obj.str),
                last = i + 1 === len;
              if (!obj.forbid) {
                text += (join ? ' and ' : '[') + str;
                if (i + 1 < len && !array[i + 1].forbid) {
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
      xpath = xpath.replace(/([[(])\{((?:[^'"{}]|'[^']*'|"[^"]*")+)\}([\])])/g, '$1$2$3');
      xpath = xpath.replace(/([/:])\*\[self::(\w+)(\[(?:[^"'[\]]|'[^']*'|"[^"]*")+\])?\]/g, "$1$2$3");
      xpath = xpath.replace(/\/child::/g, '/');
    }
    xpath = xpath.replace(/(?:[^'"{}]|'[^']*'|"[^"]*")+|([{}])/g, function (m, gr) {
      return gr ? gr === "{" ? "(" : ")" : m;
    });
    return xpath;
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
    var asii = attrName === 'lang' || attrName === 'type' && getOwner(node) == "input",
      ignoreCase = modifier === "i" || asii;
    if (!opt.standard && attrName === "class") {
      processClass(attrValue, operation, ignoreCase, node);
      return;
    }
    var attr = ignoreCase ? translateToLower("@" + attrName, asii) : "@" + attrName;
    var value = ignoreCase ? toLower(attrValue, asii) : normalizeQuotes(attrValue);
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
      psName = pseudo + name,
      localName = 'local-name()';
    switch (name) {
      case "any-link":
        node.add("(", localName, " = 'a' or ", localName, " = 'area') and @href");
        break;
      case "external":
        node.add("(", localName, " = 'a' or ", localName, " = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://'))");
        break;
      case "contains":
        node.add("contains(normalize-space(), ", normalizeString(arg, psName), ")");
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
        if (not) node.add(arg ? getNot(precedingSibling, " <= ") : notSibling(precedingSibling));else node.add(arg ? "position() <= " + parseNumber(arg, psName) : "1", !arg);
        break;
      case "first-of-type":
        owner = getOwner(node, name);
        node.add(notSibling(precedingSibling, owner));
        break;
      case "gt":
        if (not) node.add(getNot(precedingSibling, " > "));else node.add("position() > ", parseNumber(arg, psName));
        break;
      case "lt":
        if (not) node.add(getNot(precedingSibling, " <= "));else node.add("position() < ", parseNumber(arg, psName));
        break;
      case "eq":
      case "nth":
        if (not) node.add(getNot(precedingSibling, " = "));else node.add(parseNumber(arg, psName), true);
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
        node.add("starts-with(normalize-space(), ", normalizeString(arg, psName), ")");
        break;
      case "istarts-with":
        node.add("starts-with(", toLower(), ", ", normalizeArg(arg), ")");
        break;
      case "ends-with":
        str = normalizeString(arg, psName);
        node.add(endsWith("normalize-space()", "normalize-space()", str, str));
        break;
      case "iends-with":
        str = normalizeArg(arg);
        node.add(endsWith(toLower(), "normalize-space()", normalizeString(arg, psName), str));
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
        if (not) node.add(arg ? getNot(followingSibling, " <= ") : notSibling(followingSibling));else node.add(arg ? "position() > last() - " + parseNumber(arg, psName) + "" : "last()", !arg);
        break;
      case "last-of-type":
        owner = getOwner(node, name);
        node.add(notSibling(followingSibling, owner));
        break;
      case "skip":
        if (not) node.add(getNot(precedingSibling, " > "));else node.add("position() > ", parseNumber(arg, psName));
        break;
      case "skip-first":
        if (not) node.add(arg ? getNot(precedingSibling, " > ") : notSibling(precedingSibling));else node.add("position() > ", arg ? parseNumber(arg, psName) : "1", !arg);
        break;
      case "skip-last":
        if (not) node.add(arg ? getNot(followingSibling, " > ") : notSibling(followingSibling));else node.add("position() < last()", arg ? " - " + (parseNumber(arg, psName) - 1) : "");
        break;
      case "limit":
        if (not) node.add(getNot(precedingSibling, " <= "));else node.add("position() <= ", parseNumber(arg, psName));
        break;
      case "lang":
        str = processLang(arg, psName);
        if (str) node.add("{", str, "}");
        break;
      case "range":
        var splits = arg.split(',');
        if (splits.length !== 2) argumentException(psName + "(,)' is required two numbers");
        var start = parseNumber(splits[0], psName);
        var end = parseNumber(splits[1], psName);
        if (start >= end) argumentException(psName + "(" + start + ", " + end + ")' have wrong arguments");
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
        parseException(psName + "' is not implemented");
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
        count: parseNumber(arg, psName) - 1,
        comparison: comparison
      });
    }
    function normalizeArg(arg) {
      var text = normalizeString(arg, psName);
      return opt.translate ? translateToLower(text) : text;
    }
  }
  function processLang(arg, psName) {
    var ancestor = "ancestor-or-self::*[@lang][1][",
      lang = translateToLower("@lang", true),
      splits = arg.split(',');
    var result = "";
    for (var i = 0; i < splits.length; i++) {
      var str = getStringContent(splits[i]).replace(/(?:-\*)+$/, "");
      if (!str) argumentException(psName + "()' has no argument");
      var array = str.split('-'),
        arr = str.replace(/^\*(?:-\*)*/g, "").split(/(?:-\*)+/),
        len = arr.length;
      if (len > 2) argumentException(psName + "()' support max two wildcards");
      result += (i > 0 ? " or " : "") + ancestor;
      if (array[0] === "*") {
        if (len > 1) {
          result += contains(arr[0]) + " and " + ends(arr[1]);
        } else if (arr[0]) {
          result += contains(arr[0]) + " or " + ends(arr[0]);
        } else {
          return ancestor + "string-length(@lang) > 0]";
        }
      } else {
        var starts = "starts-with(" + lang + ", " + normalize(arr[0] + "-") + ")";
        if (len > 1) {
          result += starts + " and ";
          result += "(" + contains(arr[1], arr[0]) + " or " + ends(arr[1]) + ")";
        } else {
          result += lang + " = " + normalize(arr[0]) + " or " + starts;
        }
      }
      result += "]";
    }
    function contains(text, text2) {
      var val = normalize(text + "-"),
        attr = text2 ? "substring(" + lang + ", string-length(" + normalizeQuotes(text2, psName) + "))" : lang;
      return "contains(" + attr + ", " + val + ")";
    }
    function ends(text) {
      var val = normalize(text);
      return endsWith(lang, "@lang", val, val);
    }
    function normalize(text) {
      text = normalizeQuotes(text, psName);
      return opt.translate ? translateToLower(text, true) : text;
    }
    return result;
  }
  function endsWith(attr, attr2, val, val2) {
    return "substring(" + attr + ", string-length(" + attr2 + ") - (string-length(" + val + ") - 1)) = " + val2;
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
        parseException(psName + "' is not implemented");
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
  function toLower(str, asii) {
    str = str ? normalizeQuotes(str) : "normalize-space()";
    return opt.translate ? translateToLower(str, asii) : str;
  }
  function translateToLower(str, asii) {
    var letters = 'abcdefghjiklmnopqrstuvwxyz';
    return "translate(" + str + ", '" + letters.toUpperCase() + (asii ? "" : uppercase) + "', '" + letters + (asii ? "" : lowercase) + "')";
  }
  function normalizeString(str, psName) {
    if (!str) {
      argumentException(psName + "' has missing argument");
    }
    str = normalizeQuotes(str, psName);
    return "normalize-space(" + str + ")";
  }
  function normalizeQuotes(text, psName) {
    text = text.replace(/\\(?=.)/g, '');
    if (text.includes("'")) {
      if (!text.includes("\"")) return '"' + text + '"';
      argumentException((psName ? psName + "' string argument" : 'string') + " contains both '\"' and '\'' quotes");
    }
    return '\'' + text + '\'';
  }
  function parseNumber(str, psName) {
    var num = parseInt(str);
    if (Number.isInteger(num)) return num;
    var msg = !str ? "' has missing argument" : "' argument '" + str + "' is not an integer";
    argumentException(psName + msg);
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
        text = text.substr(1, len - 2);
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


/*!*******************************************
* auto-complete.js 1.0.0
* https://github.com/angezid/auto-complete.js
* MIT licensed
* Copyright (c) 2025, angezid
*********************************************/
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).autoComplete=e()}(this,(function(){"use strict";function t(){return t=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)({}).hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},t.apply(null,arguments)}var e={create:function(t,e){var n=this.preprocess(t.queryChars),r="([".concat(n,"]+)"),o="(^|["+this.preprocess(t.triggerChars)+"]+)";return t.debug&&console.log(e+": RegExp trigger pattern - "+o," query pattern - "+r),new RegExp("".concat(o).concat(r,"$"),"u")},preprocess:function(t){var e=this;return t&&t.length?t.split(/(\\[pPu]\{[^}]+\}|\\[swdSWDnt]|.)/).filter((function(t){return t.length})).map((function(t,n){return e.noEscape(t,n)?t:e.escapeCharSet(t)})).join(""):""},noEscape:function(t,e){return 0===e&&"^"===t||t.length>4||/\\[swdSWDnt]/.test(t)},escapeCharSet:function(t){return t.replace(/[-^\]\\]/g,"\\$&")}},n={caretCoordinates:null,getText:function(t,e){var n,r=this.getSelection(t),o="";if(!r.rangeCount||(n=r.getRangeAt(0)).startContainer===t)return this.caretCoordinates=t.getBoundingClientRect(),t.textContent;var i=n.startContainer,s=n.startOffset;if(e||"plaintext-only"===t.contentEditable&&!this.isFirefox()){var a=document.createRange();if(a.selectNodeContents(t),a.setEnd(i,s),o=a.toString(),e)return o}else{var u=r.anchorNode,c=r.anchorOffset,l=r.focusNode,f=r.focusOffset;r.setBaseAndExtent(t,0,i,s),o=r.toString(),r.setBaseAndExtent(u,c,l,f)}var d=n.getBoundingClientRect();return 0===d.x&&0===d.y&&(d=i.getBoundingClientRect()),this.caretCoordinates=d,o},replace:function(t,e,n){var r=this.getText(t,!0).length,o="true"===t.contentEditable||!this.isFirefox();if(o){var i={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#039;"};n=n.replace(/[<>&"']/g,(function(t){return i[t]}))}this.select(t,r-e.length,r),document.execCommand(o?"insertHTML":"insertText",!1,n)},select:function(t,e,n){for(var r,o,i,s=0,a=0,u=0,c=document.createNodeIterator(t,NodeFilter.SHOW_TEXT);i=c.nextNode();){var l=u+i.nodeValue.length;if(!r&&l>e&&(r=i,s=e-u),!o&&l>=n){o=i,a=n-u;break}u=l}r&&o&&this.getSelection(t).setBaseAndExtent(r,s,o,a)},getSelection:function(t){return t.getRootNode().getSelection()},isFirefox:function(){return/firefox/i.test(navigator.userAgent)}};function r(t,e,n,r){var o=document.createElement(e);if(n)for(var i in n)o.setAttribute(i,n[i]);return r&&(o.textContent=r),t.appendChild(o),o}var o={caretCoordinates:null,getText:function(t){var e=t.selectionStart,n=t.value.substr(0,e);return this.caretCoordinates=this.getCaretCoordinates(t,e),n},replace:function(t,e,n){var r=t.value,o=t.selectionStart,i=o-e.length;t.value=r.substr(0,i)+n+r.substr(o),t.selectionStart=t.selectionEnd=i+n.length},getCaretCoordinates:function(e,n){var o=e.getBoundingClientRect(),i=e instanceof HTMLInputElement,s=e.value,a=s.substring(0,n),u=window.getComputedStyle(e),c=r(document.body,"div",null,i?a.replace(/\s/g," "):a),l=r(c,"span",null,s.substring(n)||".");["direction","boxSizing","textAlign","textAlignLast","textTransform","textIndent","letterSpacing","wordSpacing","wordBreak","overflowX","overflowY","tabSize"].forEach((function(t){c.style[t]=u[t]}));var f={width:u.width,height:u.height,wordWrap:"normal",whiteSpace:"pre-wrap"};t(c.style,{position:"absolute",visibility:"hidden",top:o.top+"px",left:o.left+"px",font:u.font,padding:u.padding,border:u.border},i?{}:f);var d=parseInt(u.fontSize),g=d+d/2,h=o.top+l.offsetTop-(e.scrollHeight>e.clientHeight?e.scrollTop:0)+parseInt(u.borderTopWidth),p=o.left+l.offsetLeft-(e.scrollWidth>e.clientWidth?e.scrollLeft:0)+parseInt(u.borderLeftWidth)-1;return document.body.removeChild(c),{top:h,left:p,height:g}}},i={chars:["aàáảãạăằắẳẵặâầấẩẫậäåāą","cçćč","dđď","eèéẻẽẹêềếểễệëěēę","iìíỉĩịîïī","lł","nñňń","oòóỏõọôồốổỗộơởỡớờợöøōő","rř","sšśșş","tťțţ","uùúủũụưừứửữựûüůūű","yýỳỷỹỵÿ","zžżź"],obj:{},init:function(){var t=this;this.chars.forEach((function(e){for(var n=e[0],r=e[0].toUpperCase(),o=1;o<e.length;o++)t.obj[e[o]]=n,t.obj[e[o].toUpperCase()]=r}))},replace:function(t){for(var e=this,n=0;n<t.length;n++)if(this.obj[t[n]])return t.split("").map((function(t){return e.obj[t]||t})).join("");return t}};return function(s,a){this.newElement=function(t){M(),T(t)},this.destroy=function(){M(),D(document,"click",A),D(window,"resize",O),D(window,"load",I),f&&document.body.removeChild(f)},this.createIndexes=function(t){return R(t)};var u,c,l,f,d,g,h,p,v,y,m="auto-complete",x="auto-complete.js",b=0,C=0,w=t({},{queryChars:"\\d\\p{L}_-",triggerChars:"\\s!\"#$%&'()*+,-./:;<=>?@[]\\^`{|}~",listTag:"ul",listItemTag:"li",listClass:m+"-list",listItemClass:m+"-item",listOffsetX:5,listOffsetY:5,debounce:1,threshold:1,maxResults:100,debug:!1},a),E=(p=function(){l=null;var t=function(){var t=g?n:o,e=t.getText(u);l=t.caretCoordinates;var r=c.exec(e);if(r){var i,s,a=r.groups;return a&&(s=a.query)?i=a.trigger:(s=r[2])&&(i=r[1]),H("trigger = '".concat(i,"' query = '").concat(s,"'")),{trigger:i,query:s}}var f=e.length;return H("No match. ",(f>20?" ... "+e.slice(f-20):e).replace(/\r?\n|\r/g," ")),null}();if(t&&t.query.length>=w.threshold&&l){var e=function(t){var e=[],n=N(t.query),r=w.startsWith,o=w.suggestions,i=0;function s(t,e){var r=t.indexes,o=function(t,e){for(var n=Math.min(w.threshold+1,t.length);n>=1;n--){var r=e[k(t,n)];if(r)return r}return null}(n,r);o?o.forEach((function(n,r){a(t.array,n[0],n[1],e,r)})):H("Array of indexes is undefined for ",t.query)}function a(o,s,a,u,c){for(;s<a;s++){var l=o[s],f=N(l).indexOf(n);if(r?0===f:f>=0){if(++i>=w.maxResults)break;e.push({text:l,query:t.query,trigger:t.trigger,startIndex:f,arrayIndex:u,sortIndex:c})}}}return Array.isArray(o)?W(o)?a(o,0,o.length,0,0):W(o[0])?o.forEach((function(t,e){a(t,0,t.length,e,0)})):o.forEach((function(t,e){s(t,e)})):s(o,0),H("Suggestion count =",e.length),e}(t);if(B(w.filter)&&e.length&&(e=w.filter(e)||e),b=e.length)return!w.startsWith&&w.sort&&function(t,e){e=N(e,!0),t.sort((function(t,e){return t.startIndex-e.startIndex}));var n=t.findIndex((function(t){return 0===t.startIndex&&e===N(t.value,!0)}));if(n>0){var r=t[0];t[0]=t[n],t[n]=r}}(e,t.query),void function(t){var e=B(w.listItem);f.innerHTML="",t.forEach((function(t){var n=t.text,o=r(f,w.listItemTag,{class:w.listItemClass},n);if(w.highlight){var i=t.startIndex,s=i+t.query.length;o.textContent=i>0?n.substr(0,i):"",r(o,"mark",null,n.substring(i,s)),s<n.length&&o.appendChild(document.createTextNode(n.substr(s)))}e&&w.listItem(o,t);var a=JSON.stringify(t).replace(/"/g,"&#34;");o.setAttribute("data-json",a)}));var n=function(){f.style.display="block";var t=f.getBoundingClientRect(),e=w.listOffsetX,n=w.listOffsetY,r=window.pageYOffset,o=window.pageXOffset,i=o+window.innerWidth-20,s=r+window.innerHeight-20,a=l.top+l.height+r,u=l.left+o;return a+t.height>s?a=a-t.height-l.height-n:a+=n,u+t.width>i?u=u-t.width-e:u+=e,{top:a,left:u}}();f.style.top=n.top+"px",f.style.left=n.left+"px",f.scrollTop=0,C=-1,B(w.open)&&w.open(f)}(e)}O()},v=w.debounce,function(){clearTimeout(y),y=setTimeout((function(){p()}),v)});function T(t){var e="string"==typeof t?document.querySelector(t):t;e&&(g=!(e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement),z(e,"input",q),z(e,"blur",O),z(e,"keydown",L),u=e)}function S(t){!function(t){var e,r;if(h=!0,!t||!(e=t.getAttribute("data-json")))return;var i=JSON.parse(e.replace(/&#34;/g,'"'));r=i.text,B(w.select)&&(r=w.select(i));if(!r)return void O();g?n.replace(u,i.query,r):o.replace(u,i.query,r);var s=w.event;s&&(s instanceof KeyboardEvent||s instanceof InputEvent)&&u.dispatchEvent(s);O()}(t.target.closest(w.listItemTag))}function I(){setTimeout((function(){document.querySelectorAll(d).forEach((function(t){t.style.display="none"}))}),20)}function A(t){f.contains(t.target)||O()}function q(t){!h&&/^(?:insertText|deleteContent($|B))/.test(t.inputType)?E():(h=!1,O())}function O(){f.innerHTML="",f.style.display="none"}function L(t){var e=t.key;if("ArrowUp"===e)return t.preventDefault(),C=C<=0?b-1:C-1,void j();if("ArrowDown"===e)return t.preventDefault(),C=C>=b-1?0:C+1,void j();if("Enter"===e||"Tab"===e){var n=f.querySelector(".selected");if(n)return t.preventDefault(),void n.click()}O()}function j(){var t=document.querySelectorAll("".concat(d," > ").concat(w.listItemTag));t.forEach((function(t,e){t.classList.toggle("selected",e===C)}));var e=t[C];e&&e.scrollIntoView({block:"nearest",behavior:"smooth"})}function R(t){return new Promise((function(e,n){if(W(t))e(o(t));else if(W(t[0])){var r=[];t.forEach((function(t){r.push(o(t))})),e(r)}else n("Must be an array of strings or an array of arrays of strings");function o(t){(t=t.slice()).sort();for(var e=w.threshold,n={},r=Math.max(e+1,4),o=function(){for(var r,o=-1;++o<t.length&&!(r=k(t[o],e)););t.forEach((function(t,s){var a=k(t,e);a&&a!==r&&(n[r]=i(n[r],o,s),o=s,r=a)})),n[r]=i(n[r],o,t.length)};e<r;e++)o();function i(t,e,n){return t||(t=[]),t.unshift([e,n]),t}return{array:t,indexes:n}}}))}function k(t,e){return t.length<e?null:N(t.substr(0,e))}function W(t){return Array.isArray(t)&&t.length&&"string"==typeof t[0]}function N(t,e){return t?(t=w.caseSensitive?t:t.toLowerCase(),e?t:i.replace(t)):""}function B(t){return"function"==typeof t}function H(){w.debug&&console.log(x+": "+Array.from(arguments).join(" "))}function M(){u&&(D(u,"input",q),D(u,"blur",O),D(u,"keydown",L))}function z(t,e,n){t.addEventListener(e,n)}function D(t,e,n){t.removeEventListener(e,n)}T(s),u&&(z(f=r(document.body,w.listTag,{class:w.listClass}),"mousedown",(function(t){return t.preventDefault()})),z(f,"click",S),z(window,"load",I),z(window,"resize",O),z(document,"click",A),i.init(),d="".concat(w.listTag,".").concat(w.listClass),H("RegExp - /"+(c=w.regex instanceof RegExp?w.regex:e.create(w,x)).source+"/"+c.flags),w.optimize&&w.startsWith&&R(w.suggestions).then((function(t){w.suggestions=t})).catch((function(t){H(""+t)})))}}));

/*!*******************************************
* Modified version of https://github.com/antonmedv/codejar
* MIT licensed
*********************************************/
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).CodeJar=e()}(this,(function(){"use strict";function t(){return t=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)({}).hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},t.apply(null,arguments)}return function(e,n,r){var o,i=t({tab:"\t",indentOn:/[({[][ \t]*$/,moveToNewLine:/^[ \t]*[)}\]]/,spellcheck:!1,catchTab:!0,preserveIndent:!0,addClosing:!0,history:!0},r),a=/firefox/i.test(window.navigator.userAgent),f=[],u=[],c=-1,d=!1,s=!1,l=function(){};e.setAttribute("contenteditable","plaintext-only"),e.setAttribute("spellcheck",i.spellcheck),t(e.style,{outline:"none",overflowWrap:"break-word",overflowY:"auto",whiteSpace:"pre-wrap"});var v="plaintext-only"!==e.contentEditable;v&&e.setAttribute("contenteditable","true");var p=function(t){n&&"function"==typeof n&&n(e,t)};p();var g=F((function(){var t=x();p(t),T(t)}),30),h=function(t){return!$(t)||!/^(?:Control|Meta|Alt)$|^Arrow/.test(t.key)},b=F((function(t){h(t)&&(V(),d=!1)}),300),y=function(t,n){f.push([t,n]),e.addEventListener(t,n)};function m(t){return t.defaultPrevented||t.isComposing}function x(){var t={start:0,end:0,dir:null},n=W(),r=n.anchorNode,o=n.anchorOffset,i=n.focusNode,a=n.focusOffset;return k(r)&&(r=E(r,r.childNodes[o]),o=0),k(i)&&(i=E(i,i.childNodes[a]),a=0),N(e,(function(e){var n=e===r,f=e===i;if(n){if(t.start+=o,t.dir)return!0;f||(t.dir="->")}if(f){if(t.end+=a,t.dir)return!0;n||(t.dir="<-")}if(n&&f)return t.dir=o<=a?"->":"<-",!0;"->"!==t.dir&&(t.start+=e.nodeValue.length),"<-"!==t.dir&&(t.end+=e.nodeValue.length)})),e.normalize(),t}function w(t,e,n){T({start:t,end:e,dir:n})}function T(t){t.dir||(t.dir="->"),t.start<0&&(t.start=0),t.end<0&&(t.end=0);var n,r,o,i=W(),a="<-"===t.dir,f=t.start!==t.end||0===i.anchorOffset&&0===i.focusOffset,u=0,c=0,d=0;a&&(o=t.start,t.start=t.end,t.end=o),N(e,(function(e){var o=d+(e.nodeValue||"").length;if((!f&&o>=t.start||f&&o>t.start)&&(n||(n=e,u=t.start-d),o>=t.end))return r=e,c=t.end-d,!0;d=o}));var s=O(n,u),l=O(r,c);a&&(o=s,s=l,l=o),i.setBaseAndExtent(s.node,s.offset,l.node,l.offset)}function N(t,e){for(var n,r=document.createNodeIterator(t,NodeFilter.SHOW_TEXT);(n=r.nextNode())&&!e(n););}function O(t,n){if(t)for(var r=t;r&&r!==e;){if(k(r)&&"false"===r.getAttribute("contenteditable")){t=E(r.parentNode,r),n=0;break}r=r.parentNode}else t=e,n=e.childNodes.length;return{node:t,offset:n}}function k(t){return t.nodeType===Node.ELEMENT_NODE}function E(t,e){var n=document.createTextNode("");return t.insertBefore(n,e),n}function C(){var t=W().getRangeAt(0);return{before:S(t,!0),after:S(t)}}function S(t,n){var r=document.createRange();return r.selectNodeContents(e),n?r.setEnd(t.startContainer,t.startOffset):r.setStart(t.endContainer,t.endOffset),r.toString()}function A(t){(v||a)&&(B(t,!0),C().after?z("\n"):L("\n ",1))}function M(t,e,n){B(t);var r=x(),o=r.start==r.end?"":W().toString();L(t.key+o+n[e.indexOf(t.key)],1)}function L(t,e){var n=x();z(t),w(n.start+e,n.end+e,n.dir)}function D(t){var e=/^[ \t]+/.exec(t);return null!==e?e[0].length:0}function K(){W().deleteFromDocument()}function R(t,n){if(t){V(),t=function(t){var n,r=/(^|\n)[ \t]+(?=(\S)?)/g,o=i.tab;if("\t"===i.tab){var a=window.getComputedStyle(e).getPropertyValue("tab-size")||8;n=new RegExp(" {".concat(a<3?1:Math.floor(a/2)+1,",").concat(a,"}"),"g"),o=" ".repeat(a)}return t=t.replace(r,(function(t,e,r){if(!r)return e;var i=t.replace(/\t/g,o);return n?i.replace(n,"\t"):i})),t}(t=t.replace(/\r\n?/g,"\n"));var r=x(),o=t.length;z(t),H(n,r,o)}}function H(t,e,n){B(t),p();var r=Math.min(e.start,e.end)+n;w(r,r,"<-"),V(),l(I(),t)}function j(t){var e=/(^|[\n\r])([ \t]*)[^\n\r]*$/.exec(t);return{indent:e[2],start:e.index+e[1].length}}function P(){var t=u[c];t&&(e.innerHTML=t.html,T(t.pos))}function V(){if(s){var t=e.innerHTML,n=x(),r=u[c];r&&r.pos.start===n.start&&r.pos.end===n.end&&r.html===t||(u[++c]={html:t,pos:n},u.splice(c+1),c>300&&(c=300,u.shift()))}}function $(t){return(t.ctrlKey||t.metaKey)&&"z"===t.key.toLowerCase()}function z(t){var e=v||!a;if(e){var n={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#039;"};t=t.replace(/[<>&"']/g,(function(t){return n[t]}))}document.execCommand(e?"insertHTML":"insertText",!1,t)}function F(t,e){var n;return function(r){clearTimeout(n),n=window.setTimeout((function(){return t(r)}),e)}}function I(){return e.textContent||""}function B(t,e){t.preventDefault(),e&&t.stopPropagation()}function W(){try{return e.getRootNode().getSelection()}catch(t){}return window.getSelection()}return y("keydown",(function(t){m(t)||(o=I(),"F8"!==t.key?("Enter"===t.key&&(i.preserveIndent?function(t){var e=C(),n=e.before,r=e.after,o=j(n).indent,a=i.indentOn.test(n)?o+i.tab:o;a.length?(B(t,!0),z("\n"+a)):A(t);a!==o&&i.moveToNewLine.test(r)&&L("\n"+o,0)}(t):A(t)),i.catchTab&&"Tab"===t.key&&function(t){B(t),"Range"===W().type?(V(),function(t){!function(){var t=x(),e=j(C().before).start,n="->"===t.dir;w(n?e:t.start,n?t.end:e,t.dir)}();for(var e=x(),n=i.tab.length,r=W().toString().split(/\r?\n|\r/),o=0,a=e.start,f=e.end,u=0;u<r.length;u++)if(t){var c=D(r[u]);c&&(c=Math.min(c,n),r[u]=r[u].slice(c),o+=c)}else{if(!r[u])continue;r[u]=i.tab+r[u],o+=n}"->"===e.dir?f=t?e.end-o:e.end+o:a=t?e.start-o:e.start+o;z(r.join("\n")),w(a,f,e.dir)}(t.shiftKey)):t.shiftKey?function(){var t=C(),e=t.before,n=t.after,r=j(e),o=D(n);if(r.indent||o){var a=x(),f=r.start,u=Math.min(i.tab.length,r.indent.length+o),c=Math.max(f,a.start-u);w(f,f+u),K(),w(c,c,a.dir)}}():(V(),z(i.tab))}(t),i.addClosing&&function(t){var e=t.key,n="([{",r=")]}",o="'\"",i=n.includes(e),a=o.includes(e);if(!i&&!a)return;var f=C(),u=f.before,c=f.after;if("Range"===W().type)i?M(t,n,r):M(t,o,o);else{var d=u[u.length-1],s=c.charAt(0),l=/^$|[\s]/.test(s),v=s?r.indexOf(s):-1;i&&"\\"!==d&&(v>=0||l)?M(t,n,r):a&&(d===n[v]||v>=0&&/[\s=]/.test(d)||l&&!/[^\s([{]/.test(d))&&M(t,o,o)}}(t),i.history&&(!function(t){(function(t){return $(t)&&!t.shiftKey})(t)&&(B(t),--c<0&&(c=0),P());(function(t){return $(t)&&t.shiftKey})(t)&&(B(t),++c>=u.length&&(c=u.length-1),P())}(t),h(t)&&!d&&(V(),d=!0))):function(t){B(t),V();var e=C(),n=e.before,r=e.after,o=j(n).start,i=r.indexOf("\n"),a=i>=0?i+1:r.length;w(o,n.length+a),K()}(t))})),y("keyup",(function(t){m(t)||(o!==I()&&g(),b(t),l(I(),t))})),y("focus",(function(t){s=!0})),y("blur",(function(t){s=!1})),y("paste",(function(t){!function(t){if(m(t))return;var e=(t.originalEvent||t).clipboardData.getData("text/plain");R(e,t)}(t)})),y("cut",(function(t){!function(t){var e=W().toString();if(!e)return;V();var n=x();(t.originalEvent||t).clipboardData.setData("text/plain",e),K(),H(t,n,0)}(t)})),y("dragover",(function(t){var e;null!==(e=t.dataTransfer)&&e.types.includes("text/plain")&&B(t)})),y("drop",(function(t){!function(t){var e=t.dataTransfer;e&&R(e.getData("text/plain"),t)}(t)})),{updateOptions:function(e){t(i,e)},updateCode:function(t){e.textContent=t,p(),l(t)},onUpdate:function(t){l=t},toString:I,save:x,restore:T,recordHistory:V,destroy:function(){f.forEach((function(t){e.removeEventListener(t[0],t[1])}))}}}}));

/*!***************************************************
* advanced-mark.js v2.6.1
* https://github.com/angezid/advanced-mark.js
* MIT licensed
* Copyright (c) 2022–2025, angezid
* Based on 'mark.js', license https://git.io/vwTVl
*****************************************************/
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).Mark=e()}(this,(function(){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(e)}function e(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,(void 0,"symbol"==typeof(o=function(t){if("object"!=typeof t||null===t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var n=e.call(t,"string");if("object"!=typeof n)return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(r.key))?o:String(o)),r)}var o}function r(t,e,r){return e&&n(t.prototype,e),r&&n(t,r),Object.defineProperty(t,"prototype",{writable:!1}),t}function o(){return o=Object.assign?Object.assign.bind():function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},o.apply(this,arguments)}var a=function(){function t(n,r){e(this,t),this.ctx=n,this.opt=r,this.map=[]}return r(t,[{key:"getContexts",value:function(){var t=this.ctx,e=this.opt.window,n=!1;if(!t)return[];Array.isArray(t)?n=!0:"string"==typeof t?t=e.document.querySelectorAll(t):void 0===t.length&&(t=[t]);for(var r=[],o=function(e){-1!==r.indexOf(t[e])||r.some((function(n){return n.contains(t[e])}))||r.push(t[e])},a=0;a<t.length;a++)o(a);return n&&r.sort((function(t,n){return(t.compareDocumentPosition(n)&e.Node.DOCUMENT_POSITION_FOLLOWING)>0?-1:1})),r}},{key:"getIframeContents",value:function(t,e,n){try{var r=t.contentWindow.document;r&&(this.map.push([t,"ready"]),e({iframe:t,context:r}))}catch(e){n({iframe:t,error:e})}}},{key:"observeIframeLoad",value:function(t,e,n){var r=this;if(!this.map.some((function(e){return e[0]===t}))){var o=null,a=function a(){clearTimeout(o),t.removeEventListener("load",a),r.getIframeContents(t,e,n)};t.addEventListener("load",a),this.map.push([t,!0]),o=setTimeout(a,this.opt.iframesTimeout)}}},{key:"onIframeReady",value:function(t,e,n){try{var r="about:blank",o=t.getAttribute("src"),a=t.contentWindow;"complete"===a.document.readyState?o&&o.trim()!==r&&a.location.href===r?this.observeIframeLoad(t,e,n):this.getIframeContents(t,e,n):this.observeIframeLoad(t,e,n)}catch(t){n(t)}}},{key:"waitForIframes",value:function(t,e){var n,r,o=this,a=this.opt.shadowDOM,i=0,s=0,c=function t(e){for(var i=o.createIterator(e,o.opt.window.NodeFilter.SHOW_ELEMENT);r=i.nextNode();)o.isIframe(r)&&!o.map.some((function(t){return t[0]===r}))&&(n.push(r),s++),a&&r.shadowRoot&&"open"===r.shadowRoot.mode&&t(r.shadowRoot)};!function t(r){n=[],r.iframe&&"about:blank"===r.context.location.href||(c(r.context),r.iframe||n.length)?n.length?n.forEach((function(n){o.onIframeReady(n,(function(e){i++,t(e)}),(function(t){o.opt.debug&&console.log(t.error||t),++i===s&&e()}))})):i===s&&e():e()}({context:t})}},{key:"createIterator",value:function(t,e){var n=this.opt.window;return n.document.createNodeIterator(t,e,(function(){return n.NodeFilter.FILTER_ACCEPT}),!1)}},{key:"addRemoveStyle",value:function(t,e,n){if(!n||e){var r=t.querySelector("style[data-markjs]");n?(r||((r=this.opt.window.document.createElement("style")).setAttribute("data-markjs","true"),t.appendChild(r)),r.textContent=e):r&&t.removeChild(r)}}},{key:"isIframe",value:function(e){return"IFRAME"===e.tagName&&!t.matches(e,this.opt.exclude)}},{key:"iterateThroughNodes",value:function(t,e,n,r,o){var a=this,i=this.opt.window.NodeFilter,s=this.opt.shadowDOM,c=this.opt.iframes;if(c||s){var u=(e&i.SHOW_ELEMENT)>0,h=(e&i.SHOW_TEXT)>0;!function t(o){for(var f,l=a.createIterator(o,e|i.SHOW_ELEMENT);o=l.nextNode();)if(1===o.nodeType){if(u&&n(o)&&r(o),c&&a.isIframe(o)&&a.map.some((function(t){return t[0]===o&&"ready"===t[1]}))){var p=o.contentWindow.document;p&&t(p)}s&&(f=o.shadowRoot)&&"open"===f.mode&&(a.addRemoveStyle(f,s.style,h),t(f))}else h&&3===o.nodeType&&n(o)&&r(o)}(t)}else for(var f,l=this.createIterator(t,e);f=l.nextNode();)n(f)&&r(f);o()}},{key:"forEachNode",value:function(t,e,n){var r=this,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:function(){},a=this.getContexts(),i=a.length;i||o();var s=function(){a.forEach((function(a){r.iterateThroughNodes(a,t,n,e,(function(){--i<=0&&o()}))}))};if(this.opt.iframes){var c=i,u=!1,h=setTimeout((function(){u=!0,s()}),this.opt.iframesTimeout);a.forEach((function(t){r.waitForIframes(t,(function(){--c<=0&&(clearTimeout(h),u||s())}))}))}else s()}}],[{key:"matches",value:function(t,e){if(!e||!e.length)return!1;var n="string"==typeof e?[e]:e,r=t.matches||t.matchesSelector||t.msMatchesSelector||t.mozMatchesSelector||t.oMatchesSelector||t.webkitMatchesSelector;return r&&n.some((function(e){return r.call(t,e)}))}}]),t}(),i=function(){function t(n){e(this,t),this.opt=o({},{diacritics:!0,synonyms:{},accuracy:"partially",caseSensitive:!1,ignoreJoiners:!1,ignorePunctuation:[],wildcards:"disabled"},n)}return r(t,[{key:"chars",get:function(){var t=this;return this._chars||(this._chars=[],["aàáảãạăằắẳẵặâầấẩẫậäåāą","cçćč","dđď","eèéẻẽẹêềếểễệëěēę","iìíỉĩịîïī","lł","nñňń","oòóỏõọôồốổỗộơởỡớờợöøōő","rř","sšśșş","tťțţ","uùúủũụưừứửữựûüůūű","yýỳỷỹỵÿ","zžżź"].forEach((function(e){t._chars.push(e,e.toUpperCase())}))),this._chars}},{key:"create",value:function(t,e){var n="g"+(this.opt.caseSensitive?"":"i");t=this.checkWildcardsEscape(t),t=this.createSynonyms(t,n);var r=this.getJoinersPunctuation();r&&(t=this.setupIgnoreJoiners(t)),this.opt.diacritics&&(t=this.createDiacritics(t)),t=t.replace(/\s+/g,"[\\s]+"),r&&(t=this.createJoiners(t,r)),"disabled"!==this.opt.wildcards&&(t=this.createWildcards(t));var o=this.createAccuracy(t);return e?o:new RegExp("".concat(o.lookbehind,"(").concat(o.pattern,")").concat(o.lookahead),n)}},{key:"createCombinePattern",value:function(t,e){var n=this;if(!Array.isArray(t)||!t.length)return null;var r=e?"(":"(?:",o=this.create(t[0],!0);return o.pattern=this.distinct(t.map((function(t){return"".concat(r).concat(n.create(t,!0).pattern,")")}))).join("|"),o}},{key:"escape",value:function(t){return t.replace(/[[\]/{}()*+?.\\^$|]/g,"\\$&")}},{key:"preprocess",value:function(t){return t&&t.length?this.distinct("string"==typeof t?t.split(""):t).join("").replace(/[-^\]\\]/g,"\\$&"):""}},{key:"distinct",value:function(t){var e=[];return t.forEach((function(t){t.trim()&&-1===e.indexOf(t)&&e.push(t)})),e}},{key:"createSynonyms",value:function(t,e){var n=this,r=this.opt.synonyms;for(var o in r)if(r.hasOwnProperty(o)){var a=Array.isArray(r[o])?r[o]:[r[o]];if(a.unshift(o),(a=this.distinct(a)).length>1){a.sort((function(t,e){return e.length-t.length}));var i=(a=a.map((function(t){return n.checkWildcardsEscape(t)}))).map((function(t){return n.escape(t)})).join("|");t=t.replace(new RegExp(i,e),"(?:".concat(a.join("|"),")"))}}return t}},{key:"checkWildcardsEscape",value:function(t){return"disabled"!==this.opt.wildcards&&(t=t.replace(/(\\.)+|[?*]/g,(function(t,e){return e?t:"?"===t?"":""})).replace(/\\(?=[?*\x01\x02])/g,"")),this.escape(t)}},{key:"createWildcards",value:function(t){var e="withSpaces"===this.opt.wildcards,n=this.opt.blockElementsBoundary,r="[^".concat(e&&n?"":"","]*?");return t.replace(/\x01/g,e?"[^]?":"\\S?").replace(/\x02/g,e?r:"\\S*")}},{key:"setupIgnoreJoiners",value:function(t){return t.replace(/((?:\\\\)+|\x02|\(\?:|\|)|\\?(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|.)(?=([|)\x02]|$)|.)/g,(function(t,e,n){return e||void 0!==n?t:t+"\0"}))}},{key:"createJoiners",value:function(t,e){return t.split(/\x00+/).join("[".concat(e,"]*"))}},{key:"getJoinersPunctuation",value:function(){var t=this.preprocess(this.opt.ignorePunctuation)||"";return this.opt.ignoreJoiners&&(t+="\\u00ad\\u200b\\u200c\\u200d"),t}},{key:"createDiacritics",value:function(t){var e=this,n=this.chars;return t.split("").map((function(t){for(var r=0;r<n.length;r+=2){var o=-1!==n[r].indexOf(t);if(e.opt.caseSensitive){if(o)return"["+n[r]+"]";if(-1!==n[r+1].indexOf(t))return"["+n[r+1]+"]"}else if(o||-1!==n[r+1].indexOf(t))return"["+n[r]+n[r+1]+"]"}return t})).join("")}},{key:"createAccuracy",value:function(t){var e,n=this.opt.accuracy,r="()",o=t,a="";if("string"!=typeof n&&(e=this.preprocess(n.limiters),n=n.value),"exactly"===n){var i=e?"[\\s"+e+"]":"\\s";r="(^|".concat(i,")"),a="(?=$|".concat(i,")")}else{var s=e||"!-/:-@[-`{-~¡¿",c="[^\\s".concat(s,"]*");"complementary"===n?o=c+t+c:"startsWith"===n&&(r="(^|[\\s".concat(s,"])"),o=t.split(/\[\\s\]\+/).join(c+"[\\s]+")+c)}return{lookbehind:r,pattern:o,lookahead:a}}}]),t}(),s=function(){function n(t){e(this,n),this.ctx=t,this.nodeNames=["script","style","title","head","html"]}return r(n,[{key:"opt",get:function(){return this._opt},set:function(t){if(!(t&&t.window&&t.window.document)&&"undefined"==typeof window)throw new Error("Mark.js: please provide a window object as an option.");var e=t&&t.window||window;this._opt=o({},{window:e,element:"",className:"",exclude:[],iframes:!1,iframesTimeout:5e3,separateWordSearch:!0,acrossElements:!1,ignoreGroups:0,each:function(){},noMatch:function(){},filter:function(){return!0},done:function(){},debug:!1,log:e.console},t),this._opt.element||(this._opt.element="mark"),this.filter=e.NodeFilter,this.empty=e.document.createTextNode("")}},{key:"iterator",get:function(){return new a(this.ctx,this.opt)}},{key:"log",value:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"debug";if(this.opt.debug){var r=this.opt.log;"object"===t(r)&&"function"==typeof r[n]&&r[n]("mark.js: ".concat(e))}}},{key:"report",value:function(t){var e=this;t.forEach((function(t){e.log("".concat(t.text," ").concat(JSON.stringify(t.obj)),t.level||"debug"),t.skip||e.opt.noMatch(t.obj)}))}},{key:"checkOption",value:function(t,e){this.opt=t;var n=this.cacheDict,r=!0;n&&(!e&&this.opt.cacheTextNodes&&(this.opt.acrossElements?n.across&&(r=!1):n.across||(r=!1)),r&&(this.cacheDict=null))}},{key:"getSeachTerms",value:function(t){var e="string"==typeof t?[t]:t,n=this.opt.separateWordSearch,r=[],o={},a=function(t){t.split(/ +/).forEach((function(t){return i(t)}))},i=function(t){t.trim()&&-1===r.indexOf(t)&&(r.push(t),o[t]=0)};return e.forEach((function(t){n?"preserveTerms"===n?t.split(/"("*[^"]+"*)"/).forEach((function(t,e){e%2>0?i(t):a(t)})):a(t):i(t)})),r.sort((function(t,e){return e.length-t.length})),{terms:r,termStats:o}}},{key:"isNumeric",value:function(t){return Number(parseFloat(t))==t}},{key:"checkRanges",value:function(t,e,n,r){var o=this,a="error",i=t.filter((function(t){return!!(o.isNumeric(t.start)&&o.isNumeric(t.length)&&(t.start=parseInt(t.start),t.length=parseInt(t.length),t.start>=n&&t.start<r&&t.length>0))||(e.push({text:"Invalid range: ",obj:t,level:a}),!1)})).sort((function(t,e){return t.start-e.start}));if(this.opt.wrapAllRanges)return i;var s,c=0;return i.filter((function(t){return s=t.start+t.length,t.start>=c?(c=s,!0):(e.push({text:(s<c?"Nest":"Overlapp")+"ing range: ",obj:t,level:a}),!1)}))}},{key:"setType",value:function(t,e){var n=Array.isArray(e.tagNames)&&e.tagNames.length;if(n&&e.tagNames.forEach((function(e){return t[e.toLowerCase()]=2})),!n||e.extend)for(var r in t)t[r]=2;t.br=3}},{key:"getTextNodesAcross",value:function(t){var e=this;if(this.opt.cacheTextNodes&&this.cacheDict)return this.cacheDict.lastIndex=0,this.cacheDict.lastTextIndex=0,void t(this.cacheDict);var n,r,o,a={div:1,p:1,li:1,td:1,tr:1,th:1,ul:1,ol:1,dd:1,dl:1,dt:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,hr:1,blockquote:1,figcaption:1,figure:1,pre:1,table:1,thead:1,tbody:1,tfoot:1,input:1,img:1,nav:1,details:1,label:1,form:1,select:1,menu:1,br:3,menuitem:1,main:1,section:1,article:1,aside:1,picture:1,output:1,button:1,header:1,footer:1,address:1,area:1,canvas:1,map:1,fieldset:1,textarea:1,track:1,video:1,audio:1,body:1,iframe:1,meter:1,object:1,svg:1},i=[],s=this.opt.blockElementsBoundary,c=s?2:1,u="";s&&(this.setType(a,s),s.char&&(u=s.char.charAt(0)));var h={text:"",regex:/\s/,tags:a,boundary:s,startOffset:0,str:"",ch:u};this.iterator.forEachNode(this.filter.SHOW_ELEMENT|this.filter.SHOW_TEXT,(function(t){o&&i.push(e.getNodeInfo(o,t,r,h)),r=null,o=t}),(function(t){return 1===t.nodeType?(3===(n=a[t.nodeName.toLowerCase()])&&(h.str+="\n"),r&&n!==c||(r=n),!1):!e.excluded(t.parentNode)}),(function(){o&&i.push(e.getNodeInfo(o,null,r,h)),t(e.createDict(h.text,i,!0))}))}},{key:"getNodeInfo",value:function(t,e,n,r){var o=r.text.length,a=r.startOffset,i=r.ch,s=0,c=r.str,u=t.textContent;if(e){var h=r.regex.test(e.textContent[0]),f=h&&r.regex.test(u[u.length-1]);if(r.boundary||!f){var l=n;if(!n)for(var p=t.parentNode;p;){if(n=r.tags[p.nodeName.toLowerCase()]){l=!(p===e.parentNode||p.contains(e));break}p=p.parentNode}l&&(f?2===n&&(c+=f?i:h?" "+i:i+" "):c+=1===n?" ":2===n?" "+i+" ":"")}}return c&&(u+=c,s=c.length,r.startOffset-=s,r.str=""),r.text+=u,this.createInfo(t,o,r.text.length-s,s,a)}},{key:"getTextNodes",value:function(t){var e=this;if(this.opt.cacheTextNodes&&this.cacheDict)t(this.cacheDict);else{var n,r=[],o=/\n/g,a=[0],i=this.opt.markLines,s=this.filter.SHOW_TEXT|(i?this.filter.SHOW_ELEMENT:0),c="",u=0;this.iterator.forEachNode(s,(function(t){if(i)for(;null!==(n=o.exec(t.textContent));)a.push(u+n.index);c+=t.textContent,r.push({start:u,end:u=c.length,offset:0,node:t})}),(function(t){return i&&1===t.nodeType?("BR"===t.tagName&&a.push(u),!1):!e.excluded(t.parentNode)}),(function(){var n=e.createDict(c,r,!1);i&&(a.push(u),n.newLines=a),t(n)}))}}},{key:"createDict",value:function(t,e,n){var r={text:t,nodes:e,lastIndex:0,lastTextIndex:0};return this.opt.cacheTextNodes&&(this.cacheDict=r,this.cacheDict.across=n),r}},{key:"excluded",value:function(t){return-1!==this.nodeNames.indexOf(t.nodeName.toLowerCase())||a.matches(t,this.opt.exclude)}},{key:"wrapRangeInsert",value:function(t,e,n,r,o,a){var i=r===e.node.textContent.length,s=e.end,c=1,u=r,h=e.node;0!==n?(h=h.splitText(n),u=r-n,c=i?2:3):i&&(c=0);var f=i?this.empty:h.splitText(u),l=this.wrapTextNode(h),p=l.childNodes[0],d=this.createInfo(f,0===c||2===c?s:e.start+r,s,e.offset,e.startOffset);if(0===c)return e.node=p,{mark:l,nodeInfo:d,increment:0};var v=this.createInfo(p,1===c?e.start:o,e.start+r,0,e.startOffset);return 1===c?t.nodes.splice(a,1,v,d):(2===c?t.nodes.splice(a+1,0,v):t.nodes.splice(a+1,0,v,d),e.end=o,e.offset=0),{mark:l,nodeInfo:d,increment:c<3?1:2}}},{key:"createInfo",value:function(t,e,n,r,o){return{node:t,start:e,end:n,offset:r,startOffset:o}}},{key:"wrapRange",value:function(t,e,n,r){var o,a=n===t.textContent.length,i=n;return 0!==e&&(t=t.splitText(e),i=n-e),o=a?this.empty:t.splitText(i),r(this.wrapTextNode(t)),o}},{key:"wrapTextNode",value:function(t){var e=this.opt.window.document.createElement(this.opt.element);return e.setAttribute("data-markjs","true"),this.opt.className&&e.setAttribute("class",this.opt.className),e.textContent=t.textContent,t.parentNode.replaceChild(e,t),e}},{key:"wrapRangeAcross",value:function(t,e,n,r,o){var a=t.lastIndex,i=!0,s=this.opt.wrapAllRanges||this.opt.cacheTextNodes;if(s)for(;a>0&&t.nodes[a].start>e;)a--;else if(e<t.lastTextIndex)return;for(;a<t.nodes.length;a++)if(a+1===t.nodes.length||t.nodes[a+1].start>e){var c=t.nodes[a];if(!r(c))break;var u=e-c.start,h=(n>c.end?c.end:n)-c.start;if(u>=0&&h>u){if(s){var f=this.wrapRangeInsert(t,c,u,h,e,a);c=f.nodeInfo,o(f.mark,i)}else c.node=this.wrapRange(c.node,u,h,(function(t){o(t,i)})),c.start+=h,t.lastTextIndex=c.start;i=!1}if(!(n>c.end))break;e=c.end+c.offset}t.lastIndex=a}},{key:"wrapGroups",value:function(t,e,n,r,o){var a,i,s=this,c=e.index,u=!1;return n.groups.forEach((function(n){(a=e[n])&&-1!==(i=t.textContent.indexOf(a,c))&&(r(t,a,n)?(t=s.wrapRange(t,i,i+a.length,(function(t){o(t,n)})),c=0,u=!0):c=i+a.length)})),u&&(n.regex.lastIndex=0),t}},{key:"wrapGroupsAcross",value:function(t,e,n,r,o){var a,i,s,c=this,u=0,h=e.index,f=e[0],l=function(e,n,a){c.wrapRangeAcross(t,h+e,h+n,(function(t){return r(t,f,a)}),(function(t,e){o(t,e,a)}))};this.opt.wrapAllRanges&&l(0,f.length,0),n.groups.forEach((function(t){(a=e[t])&&-1!==(i=f.indexOf(a,u))&&(s=i+a.length,l(i,s,t),u=s)}))}},{key:"wrapGroupsDFlag",value:function(t,e,n,r,o){for(var a,i,s=0,c=0,u=0,h=!1,f=0;++u<e.length;)(a=e[u])&&(i=e.indices[u][0])>=s&&(f=e.indices[u][1],r(t,a,u)&&(t=this.wrapRange(t,i-c,f-c,(function(t){o(t,u)})),f>s&&(s=f),c=f,h=!0));return h?n.regex.lastIndex=0:0===e[0].length&&this.setLastIndex(n.regex,f),t}},{key:"wrapGroupsDFlagAcross",value:function(t,e,n,r,o){for(var a,i,s,c=0,u=0,h=0;++u<e.length;)(a=e[u])&&(i=e.indices[u][0],(this.opt.wrapAllRanges||i>=c)&&(h=e.indices[u][1],s=!1,this.wrapRangeAcross(t,i,h,(function(t){return r(t,a,u)}),(function(t,e){s=!0,o(t,e,u)})),s&&h>c&&(c=h)));0===e[0].length&&this.setLastIndex(n.regex,h)}},{key:"setLastIndex",value:function(t,e){var n=t.lastIndex;t.lastIndex=e>n?e:e>0?n+1:1/0}},{key:"collectGroupIndexes",value:function(t){for(var e,n=[],r=[],o=0,a=0,i=t.source,s=/(?:\\.)+|\[(?:[^\\\]]|(?:\\.))+\]|(\(\?<(?![=!])|\((?!\?))|(\()|(\))/g;null!==(e=s.exec(i));)e[1]?(r.push(1),o++,0==a++&&n.push(o)):e[2]?r.push(0):e[3]&&r.pop()&&a--;return n}},{key:"wrapSeparateGroups",value:function(t,e,n,r,o){var a,i,s,c,u=this,h=t.hasIndices,f=h?"wrapGroupsDFlag":"wrapGroups",l={regex:t,groups:h?{}:this.collectGroupIndexes(t)},p={abort:!1},d={execution:p},v=0;this.getTextNodes((function(e){e.nodes.every((function(e){for(a=e.node,d.offset=e.start;null!==(i=t.exec(a.textContent))&&(h||""!==i[0])&&(d.match=i,s=c=!0,a=u[f](a,i,l,(function(t,e,r){return d.matchStart=s,d.groupIndex=r,s=!1,n(t,e,d)}),(function(t,e){c&&v++,r(t,{match:i,matchStart:c,count:v,groupIndex:e}),c=!1})),!p.abort););return!p.abort})),o(v)}))}},{key:"wrapSeparateGroupsAcross",value:function(t,e,n,r,o){var a,i,s,c=this,u=t.hasIndices,h=u?"wrapGroupsDFlagAcross":"wrapGroupsAcross",f={regex:t,groups:u?{}:this.collectGroupIndexes(t)},l={abort:!1},p={execution:l},d=0;this.getTextNodesAcross((function(e){for(;null!==(a=t.exec(e.text))&&(u||""!==a[0])&&(p.match=a,i=s=!0,c[h](e,a,f,(function(t,e,r){return p.matchStart=i,p.groupIndex=r,p.offset=t.startOffset,i=!1,n(t.node,e,p)}),(function(t,e,n){s&&d++,r(t,{match:a,matchStart:s,count:d,groupIndex:n,groupStart:e}),s=!1})),!l.abort););o(d)}))}},{key:"wrapMatches",value:function(t,e,n,r,o){var a,i,s,c,u=this,h=0===e?0:e+1,f={abort:!1},l={execution:f},p=0;this.getTextNodes((function(e){for(var d=0;d<e.nodes.length;d++){for(a=e.nodes[d],i=a.node;null!==(s=t.exec(i.textContent))&&""!==(c=s[h]);)if(l.match=s,l.offset=a.start,n(i,c,l)){for(var v=0,m=s.index;++v<h;)s[v]&&(m+=s[v].length);var g=m+c.length;if(u.opt.cacheTextNodes){var y=u.wrapRangeInsert(e,a,m,g,a.start+m,d);if(r(y.mark,{match:s,count:++p}),0===y.increment)break;d+=y.increment,a=y.nodeInfo,i=a.node}else i=u.wrapRange(i,m,g,(function(t){r(t,{match:s,count:++p})}));if(t.lastIndex=0,f.abort)break}if(f.abort)break}o(p)}))}},{key:"wrapMatchesAcross",value:function(t,e,n,r,o){var a,i,s,c=this,u=0===e?0:e+1,h={abort:!1},f={execution:h},l=0;this.getTextNodesAcross((function(e){for(;null!==(a=t.exec(e.text))&&""!==(i=a[u]);){f.match=a,s=!0;for(var p=0,d=a.index;++p<u;)a[p]&&(d+=a[p].length);if(c.wrapRangeAcross(e,d,d+i.length,(function(t){return f.matchStart=s,f.offset=t.startOffset,s=!1,n(t.node,i,f)}),(function(t,e){e&&l++,r(t,{match:a,matchStart:e,count:l})})),h.abort)break}o(l)}))}},{key:"wrapRanges",value:function(t,e,n,r){var o=this,a=this.opt.markLines,i=[],s=[],c="warn",u=0;this.getTextNodes((function(h){var f=a?h.newLines.length:h.text.length,l=o.checkRanges(t,i,a?1:0,f);l.forEach((function(t,r){var l=t.start,p=l+t.length;p>f&&(i.push({text:"Range was limited to: ".concat(f),obj:t,skip:!0,level:c}),p=f),a&&(l=h.newLines[l-1],"\n"===h.text[l]&&l++,p=h.newLines[p-1]);var d=h.text.substring(l,p);d.trim()?o.wrapRangeAcross(h,l,p,(function(n){return e(n.node,t,d,r)}),(function(e,r){r&&u++,n(e,t,{matchStart:r,count:u})})):(i.push({text:"Skipping whitespace only range: ",obj:t,level:c}),s.push(t))})),o.log("Valid ranges: ".concat(JSON.stringify(l.filter((function(t){return-1===s.indexOf(t)}))))),r(u,i)}))}},{key:"unwrapMatches",value:function(t){var e=t.parentNode,n=t.firstChild;if(1===t.childNodes.length)if(3===n.nodeType){var r=t.previousSibling,o=t.nextSibling;if(r&&3===r.nodeType)o&&3===o.nodeType?(r.nodeValue+=n.nodeValue+o.nodeValue,e.removeChild(o)):r.nodeValue+=n.nodeValue;else{if(!o||3!==o.nodeType)return void e.replaceChild(t.firstChild,t);o.nodeValue=n.nodeValue+o.nodeValue}e.removeChild(t)}else e.replaceChild(t.firstChild,t);else{if(n){for(var a=this.opt.window.document.createDocumentFragment();t.firstChild;)a.appendChild(t.removeChild(t.firstChild));e.replaceChild(a,t)}else e.removeChild(t);e.normalize()}}},{key:"markRegExp",value:function(t,e){var n=this;this.checkOption(e);var r=0,o=0,a=this.opt.separateGroups?"wrapSeparateGroups":"wrapMatches";if(this.opt.acrossElements&&(a+="Across",!t.global&&!t.sticky)){var i=t.toString().split("/");t=new RegExp(t.source,"g"+i[i.length-1]),this.log("RegExp is recompiled - it must have a `g` flag")}this.log('RegExp "'.concat(t,'"')),this[a](t,this.opt.ignoreGroups,(function(t,e,r){return n.opt.filter(t,e,o,r)}),(function(t,e){o=e.count,r++,n.opt.each(t,e)}),(function(e){0===e&&n.opt.noMatch(t),n.opt.done(r,e)}))}},{key:"mark",value:function(t,e){var n=this;this.checkOption(e);var r=this.getSeachTerms(t),o=r.terms,a=r.termStats;if(o.length)if(this.opt.combinePatterns)this.markCombinePatterns(o,a);else{var s,c=0,u=0,h=0,f=0,l=new i(this.opt),p=this.opt.acrossElements?"wrapMatchesAcross":"wrapMatches";!function t(e){s=0;var r=l.create(e);n.log('RegExp "'.concat(r,'"')),n[p](r,1,(function(t,r,o){return h=f+s,n.opt.filter(t,e,h,s,o)}),(function(t,e){s=e.count,u++,n.opt.each(t,e)}),(function(r){f+=r,0===r&&n.opt.noMatch(e),a[e]=r,++c<o.length?t(o[c]):n.opt.done(u,f,a)}))}(o[c])}else this.opt.done(0,0,a)}},{key:"markCombinePatterns",value:function(t,e){var n,r,o=this,a=0,i=0,s=0,c=this.opt.acrossElements,u=c?"wrapMatchesAcross":"wrapMatches",h="g".concat(this.opt.caseSensitive?"":"i"),f=this.getPatterns(t);!function t(l){var p=l.pattern,d=l.regTerms,v=new RegExp(p,h);o.log('RegExp "'.concat(v,'"')),o[u](v,1,(function(t,a,i){return c&&!i.matchStart||(n=o.getCurrentTerm(i.match,d)),r=e[n],o.opt.filter(t,n,s+r,r,i)}),(function(t,r){i++,c&&!r.matchStart||(e[n]+=1),o.opt.each(t,r)}),(function(n){s+=n;var r=d.filter((function(t){return 0===e[t]}));r.length&&o.opt.noMatch(r),++a<f.length?t(f[a]):o.opt.done(i,s,e)}))}(f[a])}},{key:"getCurrentTerm",value:function(t,e){for(var n=t.length;--n>2;)if(t[n])return e[n-3];return" "}},{key:"getPatterns",value:function(t){var e,n=new i(this.opt),r=this.opt.combinePatterns,o=t.length,a=[],s=10;r===1/0?s=o:Number.isInteger(r)&&(e=parseInt(r))>0&&(s=e);for(var c=0;c<o;c+=s){var u=t.slice(c,Math.min(c+s,o)),h=n.createCombinePattern(u,!0);a.push({pattern:"".concat(h.lookbehind,"(").concat(h.pattern,")").concat(h.lookahead),regTerms:u})}return a}},{key:"markRanges",value:function(t,e){var n=this;if(this.checkOption(e,!0),Array.isArray(t)){var r=0;this.wrapRanges(t,(function(t,e,r,o){return n.opt.filter(t,e,r,o)}),(function(t,e,o){r++,n.opt.each(t,e,o)}),(function(t,e){n.report(e),n.opt.done(r,t)}))}else this.report([{text:"markRanges() accept an array of objects: ",obj:t,level:"error"}]),this.opt.done(0,0)}},{key:"unmark",value:function(t){var e=this;this.checkOption(t,!0);var n=this.opt.element+"[data-markjs]";this.opt.className&&(n+=".".concat(this.opt.className)),this.log('Removal selector "'.concat(n,'"')),this.iterator.forEachNode(this.filter.SHOW_ELEMENT,(function(t){e.unwrapMatches(t)}),(function(t){return a.matches(t,n)&&!e.excluded(t)}),this.opt.done)}}]),n}();return function(t){var e=this,n=new s(t);return this.mark=function(t,r){return n.mark(t,r),e},this.markRegExp=function(t,r){return n.markRegExp(t,r),e},this.markRanges=function(t,r){return n.markRanges(t,r),e},this.unmark=function(t){return n.unmark(t),e},this.getVersion=function(){return"2.6.1"},this}}));

!function(){var t;!function(){"use strict";var e=[,,function(t){function e(t){this.__parent=t,this.__character_count=0,this.__indent_count=-1,this.__alignment_count=0,this.__wrap_point_index=0,this.__wrap_point_character_count=0,this.__wrap_point_indent_count=-1,this.__wrap_point_alignment_count=0,this.__items=[]}function n(t,e){this.__cache=[""],this.__indent_size=t.indent_size,this.__indent_string=t.indent_char,t.indent_with_tabs||(this.__indent_string=new Array(t.indent_size+1).join(t.indent_char)),e=e||"",t.indent_level>0&&(e=new Array(t.indent_level+1).join(this.__indent_string)),this.__base_string=e,this.__base_string_length=e.length}function _(t,_){this.__indent_cache=new n(t,_),this.raw=!1,this._end_with_newline=t.end_with_newline,this.indent_size=t.indent_size,this.wrap_line_length=t.wrap_line_length,this.indent_empty_lines=t.indent_empty_lines,this.__lines=[],this.previous_line=null,this.current_line=null,this.next_line=new e(this),this.space_before_token=!1,this.non_breaking_space=!1,this.previous_token_wrapped=!1,this.__add_outputline()}e.prototype.clone_empty=function(){var t=new e(this.__parent);return t.set_indent(this.__indent_count,this.__alignment_count),t},e.prototype.item=function(t){return t<0?this.__items[this.__items.length+t]:this.__items[t]},e.prototype.has_match=function(t){for(var e=this.__items.length-1;e>=0;e--)if(this.__items[e].match(t))return!0;return!1},e.prototype.set_indent=function(t,e){this.is_empty()&&(this.__indent_count=t||0,this.__alignment_count=e||0,this.__character_count=this.__parent.get_indent_size(this.__indent_count,this.__alignment_count))},e.prototype._set_wrap_point=function(){this.__parent.wrap_line_length&&(this.__wrap_point_index=this.__items.length,this.__wrap_point_character_count=this.__character_count,this.__wrap_point_indent_count=this.__parent.next_line.__indent_count,this.__wrap_point_alignment_count=this.__parent.next_line.__alignment_count)},e.prototype._should_wrap=function(){return this.__wrap_point_index&&this.__character_count>this.__parent.wrap_line_length&&this.__wrap_point_character_count>this.__parent.next_line.__character_count},e.prototype._allow_wrap=function(){if(this._should_wrap()){this.__parent.add_new_line();var t=this.__parent.current_line;return t.set_indent(this.__wrap_point_indent_count,this.__wrap_point_alignment_count),t.__items=this.__items.slice(this.__wrap_point_index),this.__items=this.__items.slice(0,this.__wrap_point_index),t.__character_count+=this.__character_count-this.__wrap_point_character_count,this.__character_count=this.__wrap_point_character_count," "===t.__items[0]&&(t.__items.splice(0,1),t.__character_count-=1),!0}return!1},e.prototype.is_empty=function(){return 0===this.__items.length},e.prototype.last=function(){return this.is_empty()?null:this.__items[this.__items.length-1]},e.prototype.push=function(t){this.__items.push(t);var e=t.lastIndexOf("\n");-1!==e?this.__character_count=t.length-e:this.__character_count+=t.length},e.prototype.pop=function(){var t=null;return this.is_empty()||(t=this.__items.pop(),this.__character_count-=t.length),t},e.prototype._remove_indent=function(){this.__indent_count>0&&(this.__indent_count-=1,this.__character_count-=this.__parent.indent_size)},e.prototype._remove_wrap_indent=function(){this.__wrap_point_indent_count>0&&(this.__wrap_point_indent_count-=1)},e.prototype.trim=function(){for(;" "===this.last();)this.__items.pop(),this.__character_count-=1},e.prototype.toString=function(){var t="";return this.is_empty()?this.__parent.indent_empty_lines&&(t=this.__parent.get_indent_string(this.__indent_count)):(t=this.__parent.get_indent_string(this.__indent_count,this.__alignment_count),t+=this.__items.join("")),t},n.prototype.get_indent_size=function(t,e){var n=this.__base_string_length;return e=e||0,t<0&&(n=0),n+=t*this.__indent_size,n+=e},n.prototype.get_indent_string=function(t,e){var n=this.__base_string;return e=e||0,t<0&&(t=0,n=""),e+=t*this.__indent_size,this.__ensure_cache(e),n+=this.__cache[e]},n.prototype.__ensure_cache=function(t){for(;t>=this.__cache.length;)this.__add_column()},n.prototype.__add_column=function(){var t=this.__cache.length,e=0,n="";this.__indent_size&&t>=this.__indent_size&&(t-=(e=Math.floor(t/this.__indent_size))*this.__indent_size,n=new Array(e+1).join(this.__indent_string)),t&&(n+=new Array(t+1).join(" ")),this.__cache.push(n)},_.prototype.__add_outputline=function(){this.previous_line=this.current_line,this.current_line=this.next_line.clone_empty(),this.__lines.push(this.current_line)},_.prototype.get_line_number=function(){return this.__lines.length},_.prototype.get_indent_string=function(t,e){return this.__indent_cache.get_indent_string(t,e)},_.prototype.get_indent_size=function(t,e){return this.__indent_cache.get_indent_size(t,e)},_.prototype.is_empty=function(){return!this.previous_line&&this.current_line.is_empty()},_.prototype.add_new_line=function(t){return!(this.is_empty()||!t&&this.just_added_newline())&&(this.raw||this.__add_outputline(),!0)},_.prototype.get_code=function(t){this.trim(!0);var e=this.current_line.pop();e&&("\n"===e[e.length-1]&&(e=e.replace(/\n+$/g,"")),this.current_line.push(e)),this._end_with_newline&&this.__add_outputline();var n=this.__lines.join("\n");return"\n"!==t&&(n=n.replace(/[\n]/g,t)),n},_.prototype.set_wrap_point=function(){this.current_line._set_wrap_point()},_.prototype.set_indent=function(t,e){return t=t||0,e=e||0,this.next_line.set_indent(t,e),this.__lines.length>1?(this.current_line.set_indent(t,e),!0):(this.current_line.set_indent(),!1)},_.prototype.add_raw_token=function(t){for(var e=0;e<t.newlines;e++)this.__add_outputline();this.current_line.set_indent(-1),this.current_line.push(t.whitespace_before),this.current_line.push(t.text),this.space_before_token=!1,this.non_breaking_space=!1,this.previous_token_wrapped=!1},_.prototype.add_token=function(t){this.__add_space_before_token(),this.current_line.push(t),this.space_before_token=!1,this.non_breaking_space=!1,this.previous_token_wrapped=this.current_line._allow_wrap()},_.prototype.__add_space_before_token=function(){this.space_before_token&&!this.just_added_newline()&&(this.non_breaking_space||this.set_wrap_point(),this.current_line.push(" "))},_.prototype.remove_indent=function(t){for(var e=this.__lines.length;t<e;)this.__lines[t]._remove_indent(),t++;this.current_line._remove_wrap_indent()},_.prototype.trim=function(t){for(t=void 0!==t&&t,this.current_line.trim();t&&this.__lines.length>1&&this.current_line.is_empty();)this.__lines.pop(),this.current_line=this.__lines[this.__lines.length-1],this.current_line.trim();this.previous_line=this.__lines.length>1?this.__lines[this.__lines.length-2]:null},_.prototype.just_added_newline=function(){return this.current_line.is_empty()},_.prototype.just_added_blankline=function(){return this.is_empty()||this.current_line.is_empty()&&this.previous_line.is_empty()},_.prototype.ensure_empty_line_above=function(t,n){for(var _=this.__lines.length-2;_>=0;){var i=this.__lines[_];if(i.is_empty())break;if(0!==i.item(0).indexOf(t)&&i.item(-1)!==n){this.__lines.splice(_+1,0,new e(this)),this.previous_line=this.__lines[this.__lines.length-2];break}_--}},t.exports.Output=_},function(t){t.exports.Token=function(t,e,n,_){this.type=t,this.text=e,this.comments_before=null,this.newlines=n||0,this.whitespace_before=_||"",this.parent=null,this.next=null,this.previous=null,this.opened=null,this.closed=null,this.directives=null}},,,function(t){function e(t,e){this.raw_options=n(t,e),this.disabled=this._get_boolean("disabled"),this.eol=this._get_characters("eol","auto"),this.end_with_newline=this._get_boolean("end_with_newline"),this.indent_size=this._get_number("indent_size",4),this.indent_char=this._get_characters("indent_char"," "),this.indent_level=this._get_number("indent_level"),this.preserve_newlines=this._get_boolean("preserve_newlines",!0),this.max_preserve_newlines=this._get_number("max_preserve_newlines",32786),this.preserve_newlines||(this.max_preserve_newlines=0),this.indent_with_tabs=this._get_boolean("indent_with_tabs","\t"===this.indent_char),this.indent_with_tabs&&(this.indent_char="\t",1===this.indent_size&&(this.indent_size=4)),this.wrap_line_length=this._get_number("wrap_line_length",this._get_number("max_char")),this.indent_empty_lines=this._get_boolean("indent_empty_lines"),this.templating=this._get_selection_list("templating",["auto","none","angular","django","erb","handlebars","php","smarty"],["auto"])}function n(t,e){var n,i={};for(n in t=_(t))n!==e&&(i[n]=t[n]);if(e&&t[e])for(n in t[e])i[n]=t[e][n];return i}function _(t){var e,n={};for(e in t){n[e.replace(/-/g,"_")]=t[e]}return n}e.prototype._get_array=function(t,e){var n=this.raw_options[t],_=e||[];return"object"==typeof n?null!==n&&"function"==typeof n.concat&&(_=n.concat()):"string"==typeof n&&(_=n.split(/[^a-zA-Z0-9_\/\-]+/)),_},e.prototype._get_boolean=function(t,e){var n=this.raw_options[t];return void 0===n?!!e:!!n},e.prototype._get_characters=function(t,e){var n=this.raw_options[t],_=e||"";return"string"==typeof n&&(_=n.replace(/\\r/,"\r").replace(/\\n/,"\n").replace(/\\t/,"\t")),_},e.prototype._get_number=function(t,e){var n=this.raw_options[t];e=parseInt(e,10),isNaN(e)&&(e=0);var _=parseInt(n,10);return isNaN(_)&&(_=e),_},e.prototype._get_selection=function(t,e,n){var _=this._get_selection_list(t,e,n);if(1!==_.length)throw new Error("Invalid Option Value: The option '"+t+"' can only be one of the following values:\n"+e+"\nYou passed in: '"+this.raw_options[t]+"'");return _[0]},e.prototype._get_selection_list=function(t,e,n){if(!e||0===e.length)throw new Error("Selection list cannot be empty.");if(n=n||[e[0]],!this._is_valid_selection(n,e))throw new Error("Invalid Default Value!");var _=this._get_array(t,n);if(!this._is_valid_selection(_,e))throw new Error("Invalid Option Value: The option '"+t+"' can contain only the following values:\n"+e+"\nYou passed in: '"+this.raw_options[t]+"'");return _},e.prototype._is_valid_selection=function(t,e){return t.length&&e.length&&!t.some((function(t){return-1===e.indexOf(t)}))},t.exports.Options=e,t.exports.normalizeOpts=_,t.exports.mergeOpts=n},,function(t){var e=RegExp.prototype.hasOwnProperty("sticky");function n(t){this.__input=t||"",this.__input_length=this.__input.length,this.__position=0}n.prototype.restart=function(){this.__position=0},n.prototype.back=function(){this.__position>0&&(this.__position-=1)},n.prototype.hasNext=function(){return this.__position<this.__input_length},n.prototype.next=function(){var t=null;return this.hasNext()&&(t=this.__input.charAt(this.__position),this.__position+=1),t},n.prototype.peek=function(t){var e=null;return t=t||0,(t+=this.__position)>=0&&t<this.__input_length&&(e=this.__input.charAt(t)),e},n.prototype.__match=function(t,n){t.lastIndex=n;var _=t.exec(this.__input);return!_||e&&t.sticky||_.index!==n&&(_=null),_},n.prototype.test=function(t,e){return e=e||0,(e+=this.__position)>=0&&e<this.__input_length&&!!this.__match(t,e)},n.prototype.testChar=function(t,e){var n=this.peek(e);return t.lastIndex=0,null!==n&&t.test(n)},n.prototype.match=function(t){var e=this.__match(t,this.__position);return e?this.__position+=e[0].length:e=null,e},n.prototype.read=function(t,e,n){var _,i="";return t&&(_=this.match(t))&&(i+=_[0]),!e||!_&&t||(i+=this.readUntil(e,n)),i},n.prototype.readUntil=function(t,e){var n,_=this.__position;t.lastIndex=this.__position;var i=t.exec(this.__input);return i?(_=i.index,e&&(_+=i[0].length)):_=this.__input_length,n=this.__input.substring(this.__position,_),this.__position=_,n},n.prototype.readUntilAfter=function(t){return this.readUntil(t,!0)},n.prototype.get_regexp=function(t,n){var _=null,i="g";return n&&e&&(i="y"),"string"==typeof t&&""!==t?_=new RegExp(t,i):t&&(_=new RegExp(t.source,i)),_},n.prototype.get_literal_regexp=function(t){return RegExp(t.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&"))},n.prototype.peekUntilAfter=function(t){var e=this.__position,n=this.readUntilAfter(t);return this.__position=e,n},n.prototype.lookBack=function(t){var e=this.__position-1;return e>=t.length&&this.__input.substring(e-t.length,e).toLowerCase()===t},t.exports.InputScanner=n},function(t,e,n){var _=n(8).InputScanner,i=n(3).Token,r=n(10).TokenStream,s=n(11).WhitespacePattern,a={START:"TK_START",RAW:"TK_RAW",EOF:"TK_EOF"},o=function(t,e){this._input=new _(t),this._options=e||{},this.__tokens=null,this._patterns={},this._patterns.whitespace=new s(this._input)};o.prototype.tokenize=function(){var t;this._input.restart(),this.__tokens=new r,this._reset();for(var e=new i(a.START,""),n=null,_=[],s=new r;e.type!==a.EOF;){for(t=this._get_next_token(e,n);this._is_comment(t);)s.add(t),t=this._get_next_token(e,n);s.isEmpty()||(t.comments_before=s,s=new r),t.parent=n,this._is_opening(t)?(_.push(n),n=t):n&&this._is_closing(t,n)&&(t.opened=n,n.closed=t,n=_.pop(),t.parent=n),t.previous=e,e.next=t,this.__tokens.add(t),e=t}return this.__tokens},o.prototype._is_first_token=function(){return this.__tokens.isEmpty()},o.prototype._reset=function(){},o.prototype._get_next_token=function(t,e){this._readWhitespace();var n=this._input.read(/.+/g);return n?this._create_token(a.RAW,n):this._create_token(a.EOF,"")},o.prototype._is_comment=function(t){return!1},o.prototype._is_opening=function(t){return!1},o.prototype._is_closing=function(t,e){return!1},o.prototype._create_token=function(t,e){return new i(t,e,this._patterns.whitespace.newline_count,this._patterns.whitespace.whitespace_before_token)},o.prototype._readWhitespace=function(){return this._patterns.whitespace.read()},t.exports.Tokenizer=o,t.exports.TOKEN=a},function(t){function e(t){this.__tokens=[],this.__tokens_length=this.__tokens.length,this.__position=0,this.__parent_token=t}e.prototype.restart=function(){this.__position=0},e.prototype.isEmpty=function(){return 0===this.__tokens_length},e.prototype.hasNext=function(){return this.__position<this.__tokens_length},e.prototype.next=function(){var t=null;return this.hasNext()&&(t=this.__tokens[this.__position],this.__position+=1),t},e.prototype.peek=function(t){var e=null;return t=t||0,(t+=this.__position)>=0&&t<this.__tokens_length&&(e=this.__tokens[t]),e},e.prototype.add=function(t){this.__parent_token&&(t.parent=this.__parent_token),this.__tokens.push(t),this.__tokens_length+=1},t.exports.TokenStream=e},function(t,e,n){var _=n(12).Pattern;function i(t,e){_.call(this,t,e),e?this._line_regexp=this._input.get_regexp(e._line_regexp):this.__set_whitespace_patterns("",""),this.newline_count=0,this.whitespace_before_token=""}i.prototype=new _,i.prototype.__set_whitespace_patterns=function(t,e){t+="\\t ",e+="\\n\\r",this._match_pattern=this._input.get_regexp("["+t+e+"]+",!0),this._newline_regexp=this._input.get_regexp("\\r\\n|["+e+"]")},i.prototype.read=function(){this.newline_count=0,this.whitespace_before_token="";var t=this._input.read(this._match_pattern);if(" "===t)this.whitespace_before_token=" ";else if(t){var e=this.__split(this._newline_regexp,t);this.newline_count=e.length-1,this.whitespace_before_token=e[this.newline_count]}return t},i.prototype.matching=function(t,e){var n=this._create();return n.__set_whitespace_patterns(t,e),n._update(),n},i.prototype._create=function(){return new i(this._input,this)},i.prototype.__split=function(t,e){t.lastIndex=0;for(var n=0,_=[],i=t.exec(e);i;)_.push(e.substring(n,i.index)),n=i.index+i[0].length,i=t.exec(e);return n<e.length?_.push(e.substring(n,e.length)):_.push(""),_},t.exports.WhitespacePattern=i},function(t){function e(t,e){this._input=t,this._starting_pattern=null,this._match_pattern=null,this._until_pattern=null,this._until_after=!1,e&&(this._starting_pattern=this._input.get_regexp(e._starting_pattern,!0),this._match_pattern=this._input.get_regexp(e._match_pattern,!0),this._until_pattern=this._input.get_regexp(e._until_pattern),this._until_after=e._until_after)}e.prototype.read=function(){var t=this._input.read(this._starting_pattern);return this._starting_pattern&&!t||(t+=this._input.read(this._match_pattern,this._until_pattern,this._until_after)),t},e.prototype.read_match=function(){return this._input.match(this._match_pattern)},e.prototype.until_after=function(t){var e=this._create();return e._until_after=!0,e._until_pattern=this._input.get_regexp(t),e._update(),e},e.prototype.until=function(t){var e=this._create();return e._until_after=!1,e._until_pattern=this._input.get_regexp(t),e._update(),e},e.prototype.starting_with=function(t){var e=this._create();return e._starting_pattern=this._input.get_regexp(t,!0),e._update(),e},e.prototype.matching=function(t){var e=this._create();return e._match_pattern=this._input.get_regexp(t,!0),e._update(),e},e.prototype._create=function(){return new e(this._input,this)},e.prototype._update=function(){},t.exports.Pattern=e},function(t){function e(t,e){t="string"==typeof t?t:t.source,e="string"==typeof e?e:e.source,this.__directives_block_pattern=new RegExp(t+/ beautify( \w+[:]\w+)+ /.source+e,"g"),this.__directive_pattern=/ (\w+)[:](\w+)/g,this.__directives_end_ignore_pattern=new RegExp(t+/\sbeautify\signore:end\s/.source+e,"g")}e.prototype.get_directives=function(t){if(!t.match(this.__directives_block_pattern))return null;var e={};this.__directive_pattern.lastIndex=0;for(var n=this.__directive_pattern.exec(t);n;)e[n[1]]=n[2],n=this.__directive_pattern.exec(t);return e},e.prototype.readIgnored=function(t){return t.readUntilAfter(this.__directives_end_ignore_pattern)},t.exports.Directives=e},function(t,e,n){var _=n(12).Pattern,i={django:!1,erb:!1,handlebars:!1,php:!1,smarty:!1,angular:!1};function r(t,e){_.call(this,t,e),this.__template_pattern=null,this._disabled=Object.assign({},i),this._excluded=Object.assign({},i),e&&(this.__template_pattern=this._input.get_regexp(e.__template_pattern),this._excluded=Object.assign(this._excluded,e._excluded),this._disabled=Object.assign(this._disabled,e._disabled));var n=new _(t);this.__patterns={handlebars_comment:n.starting_with(/{{!--/).until_after(/--}}/),handlebars_unescaped:n.starting_with(/{{{/).until_after(/}}}/),handlebars:n.starting_with(/{{/).until_after(/}}/),php:n.starting_with(/<\?(?:[= ]|php)/).until_after(/\?>/),erb:n.starting_with(/<%[^%]/).until_after(/[^%]%>/),django:n.starting_with(/{%/).until_after(/%}/),django_value:n.starting_with(/{{/).until_after(/}}/),django_comment:n.starting_with(/{#/).until_after(/#}/),smarty:n.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),smarty_comment:n.starting_with(/{\*/).until_after(/\*}/),smarty_literal:n.starting_with(/{literal}/).until_after(/{\/literal}/)}}r.prototype=new _,r.prototype._create=function(){return new r(this._input,this)},r.prototype._update=function(){this.__set_templated_pattern()},r.prototype.disable=function(t){var e=this._create();return e._disabled[t]=!0,e._update(),e},r.prototype.read_options=function(t){var e=this._create();for(var n in i)e._disabled[n]=-1===t.templating.indexOf(n);return e._update(),e},r.prototype.exclude=function(t){var e=this._create();return e._excluded[t]=!0,e._update(),e},r.prototype.read=function(){var t="";t=this._match_pattern?this._input.read(this._starting_pattern):this._input.read(this._starting_pattern,this.__template_pattern);for(var e=this._read_template();e;)this._match_pattern?e+=this._input.read(this._match_pattern):e+=this._input.readUntil(this.__template_pattern),t+=e,e=this._read_template();return this._until_after&&(t+=this._input.readUntilAfter(this._until_pattern)),t},r.prototype.__set_templated_pattern=function(){var t=[];this._disabled.php||t.push(this.__patterns.php._starting_pattern.source),this._disabled.handlebars||t.push(this.__patterns.handlebars._starting_pattern.source),this._disabled.angular||t.push(this.__patterns.handlebars._starting_pattern.source),this._disabled.erb||t.push(this.__patterns.erb._starting_pattern.source),this._disabled.django||(t.push(this.__patterns.django._starting_pattern.source),t.push(this.__patterns.django_value._starting_pattern.source),t.push(this.__patterns.django_comment._starting_pattern.source)),this._disabled.smarty||t.push(this.__patterns.smarty._starting_pattern.source),this._until_pattern&&t.push(this._until_pattern.source),this.__template_pattern=this._input.get_regexp("(?:"+t.join("|")+")")},r.prototype._read_template=function(){var t="",e=this._input.peek();if("<"===e){var n=this._input.peek(1);this._disabled.php||this._excluded.php||"?"!==n||(t=t||this.__patterns.php.read()),this._disabled.erb||this._excluded.erb||"%"!==n||(t=t||this.__patterns.erb.read())}else"{"===e&&(this._disabled.handlebars||this._excluded.handlebars||(t=(t=(t=t||this.__patterns.handlebars_comment.read())||this.__patterns.handlebars_unescaped.read())||this.__patterns.handlebars.read()),this._disabled.django||(this._excluded.django||this._excluded.handlebars||(t=t||this.__patterns.django_value.read()),this._excluded.django||(t=(t=t||this.__patterns.django_comment.read())||this.__patterns.django.read())),this._disabled.smarty||this._disabled.django&&this._disabled.handlebars&&(t=(t=(t=t||this.__patterns.smarty_comment.read())||this.__patterns.smarty_literal.read())||this.__patterns.smarty.read()));return t},t.exports.TemplatablePattern=r},,,,function(t,e,n){var _=n(19).Beautifier,i=n(20).Options;t.exports=function(t,e,n,i){return new _(t,e,n,i).beautify()},t.exports.defaultOptions=function(){return new i}},function(t,e,n){var _=n(20).Options,i=n(2).Output,r=n(21).Tokenizer,s=n(21).TOKEN,a=/\r\n|[\r\n]/,o=/\r\n|[\r\n]/g,p=function(t,e){this.indent_level=0,this.alignment_size=0,this.max_preserve_newlines=t.max_preserve_newlines,this.preserve_newlines=t.preserve_newlines,this._output=new i(t,e)};p.prototype.current_line_has_match=function(t){return this._output.current_line.has_match(t)},p.prototype.set_space_before_token=function(t,e){this._output.space_before_token=t,this._output.non_breaking_space=e},p.prototype.set_wrap_point=function(){this._output.set_indent(this.indent_level,this.alignment_size),this._output.set_wrap_point()},p.prototype.add_raw_token=function(t){this._output.add_raw_token(t)},p.prototype.print_preserved_newlines=function(t){var e=0;t.type!==s.TEXT&&t.previous.type!==s.TEXT&&(e=t.newlines?1:0),this.preserve_newlines&&(e=t.newlines<this.max_preserve_newlines+1?t.newlines:this.max_preserve_newlines+1);for(var n=0;n<e;n++)this.print_newline(n>0);return 0!==e},p.prototype.traverse_whitespace=function(t){return!(!t.whitespace_before&&!t.newlines)&&(this.print_preserved_newlines(t)||(this._output.space_before_token=!0),!0)},p.prototype.previous_token_wrapped=function(){return this._output.previous_token_wrapped},p.prototype.print_newline=function(t){this._output.add_new_line(t)},p.prototype.print_token=function(t){t.text&&(this._output.set_indent(this.indent_level,this.alignment_size),this._output.add_token(t.text))},p.prototype.indent=function(){this.indent_level++},p.prototype.deindent=function(){this.indent_level>0&&(this.indent_level--,this._output.set_indent(this.indent_level,this.alignment_size))},p.prototype.get_full_indent=function(t){return(t=this.indent_level+(t||0))<1?"":this._output.get_indent_string(t)};var h=function(t,e){var n=null,_=null;return e.closed?("script"===t?n="text/javascript":"style"===t&&(n="text/css"),n=function(t){for(var e=null,n=t.next;n.type!==s.EOF&&t.closed!==n;){if(n.type===s.ATTRIBUTE&&"type"===n.text){n.next&&n.next.type===s.EQUALS&&n.next.next&&n.next.next.type===s.VALUE&&(e=n.next.next.text);break}n=n.next}return e}(e)||n,n.search("text/css")>-1?_="css":n.search(/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/)>-1?_="javascript":n.search(/(text|application|dojo)\/(x-)?(html)/)>-1?_="html":n.search(/test\/null/)>-1&&(_="null"),_):null};function u(t,e){return-1!==e.indexOf(t)}function l(t,e,n){this.parent=t||null,this.tag=e?e.tag_name:"",this.indent_level=n||0,this.parser_token=e||null}function c(t){this._printer=t,this._current_frame=null}function d(t,e,n,i){this._source_text=t||"",e=e||{},this._js_beautify=n,this._css_beautify=i,this._tag_stack=null;var r=new _(e,"html");this._options=r,this._is_wrap_attributes_force="force"===this._options.wrap_attributes.substr(0,5),this._is_wrap_attributes_force_expand_multiline="force-expand-multiline"===this._options.wrap_attributes,this._is_wrap_attributes_force_aligned="force-aligned"===this._options.wrap_attributes,this._is_wrap_attributes_aligned_multiple="aligned-multiple"===this._options.wrap_attributes,this._is_wrap_attributes_preserve="preserve"===this._options.wrap_attributes.substr(0,8),this._is_wrap_attributes_preserve_aligned="preserve-aligned"===this._options.wrap_attributes}c.prototype.get_parser_token=function(){return this._current_frame?this._current_frame.parser_token:null},c.prototype.record_tag=function(t){var e=new l(this._current_frame,t,this._printer.indent_level);this._current_frame=e},c.prototype._try_pop_frame=function(t){var e=null;return t&&(e=t.parser_token,this._printer.indent_level=t.indent_level,this._current_frame=t.parent),e},c.prototype._get_frame=function(t,e){for(var n=this._current_frame;n&&-1===t.indexOf(n.tag);){if(e&&-1!==e.indexOf(n.tag)){n=null;break}n=n.parent}return n},c.prototype.try_pop=function(t,e){var n=this._get_frame([t],e);return this._try_pop_frame(n)},c.prototype.indent_to_tag=function(t){var e=this._get_frame(t);e&&(this._printer.indent_level=e.indent_level)},d.prototype.beautify=function(){if(this._options.disabled)return this._source_text;var t=this._source_text,e=this._options.eol;"auto"===this._options.eol&&(e="\n",t&&a.test(t)&&(e=t.match(a)[0]));var n=(t=t.replace(o,"\n")).match(/^[\t ]*/)[0],_={text:"",type:""},i=new f(this._options),h=new p(this._options,n),u=new r(t,this._options).tokenize();this._tag_stack=new c(h);for(var l=null,d=u.next();d.type!==s.EOF;)d.type===s.TAG_OPEN||d.type===s.COMMENT?i=l=this._handle_tag_open(h,d,i,_,u):d.type===s.ATTRIBUTE||d.type===s.EQUALS||d.type===s.VALUE||d.type===s.TEXT&&!i.tag_complete?l=this._handle_inside_tag(h,d,i,_):d.type===s.TAG_CLOSE?l=this._handle_tag_close(h,d,i):d.type===s.TEXT?l=this._handle_text(h,d,i):d.type===s.CONTROL_FLOW_OPEN?l=this._handle_control_flow_open(h,d):d.type===s.CONTROL_FLOW_CLOSE?l=this._handle_control_flow_close(h,d):h.add_raw_token(d),_=l,d=u.next();return h._output.get_code(e)},d.prototype._handle_control_flow_open=function(t,e){var n={text:e.text,type:e.type};return t.set_space_before_token(e.newlines||""!==e.whitespace_before,!0),e.newlines?t.print_preserved_newlines(e):t.set_space_before_token(e.newlines||""!==e.whitespace_before,!0),t.print_token(e),t.indent(),n},d.prototype._handle_control_flow_close=function(t,e){var n={text:e.text,type:e.type};return t.deindent(),e.newlines?t.print_preserved_newlines(e):t.set_space_before_token(e.newlines||""!==e.whitespace_before,!0),t.print_token(e),n},d.prototype._handle_tag_close=function(t,e,n){var _={text:e.text,type:e.type};return t.alignment_size=0,n.tag_complete=!0,t.set_space_before_token(e.newlines||""!==e.whitespace_before,!0),n.is_unformatted?t.add_raw_token(e):("<"===n.tag_start_char&&(t.set_space_before_token("/"===e.text[0],!0),this._is_wrap_attributes_force_expand_multiline&&n.has_wrapped_attrs&&t.print_newline(!1)),t.print_token(e)),!n.indent_content||n.is_unformatted||n.is_content_unformatted||(t.indent(),n.indent_content=!1),n.is_inline_element||n.is_unformatted||n.is_content_unformatted||t.set_wrap_point(),_},d.prototype._handle_inside_tag=function(t,e,n,_){var i=n.has_wrapped_attrs,r={text:e.text,type:e.type};return t.set_space_before_token(e.newlines||""!==e.whitespace_before,!0),n.is_unformatted?t.add_raw_token(e):"{"===n.tag_start_char&&e.type===s.TEXT?t.print_preserved_newlines(e)?(e.newlines=0,t.add_raw_token(e)):t.print_token(e):(e.type===s.ATTRIBUTE?t.set_space_before_token(!0):(e.type===s.EQUALS||e.type===s.VALUE&&e.previous.type===s.EQUALS)&&t.set_space_before_token(!1),e.type===s.ATTRIBUTE&&"<"===n.tag_start_char&&((this._is_wrap_attributes_preserve||this._is_wrap_attributes_preserve_aligned)&&(t.traverse_whitespace(e),i=i||0!==e.newlines),this._is_wrap_attributes_force&&n.attr_count>=this._options.wrap_attributes_min_attrs&&(_.type!==s.TAG_OPEN||this._is_wrap_attributes_force_expand_multiline)&&(t.print_newline(!1),i=!0)),t.print_token(e),i=i||t.previous_token_wrapped(),n.has_wrapped_attrs=i),r},d.prototype._handle_text=function(t,e,n){var _={text:e.text,type:"TK_CONTENT"};return n.custom_beautifier_name?this._print_custom_beatifier_text(t,e,n):n.is_unformatted||n.is_content_unformatted?t.add_raw_token(e):(t.traverse_whitespace(e),t.print_token(e)),_},d.prototype._print_custom_beatifier_text=function(t,e,n){var _=this;if(""!==e.text){var i,r=e.text,s=1,a="",o="";"javascript"===n.custom_beautifier_name&&"function"==typeof this._js_beautify?i=this._js_beautify:"css"===n.custom_beautifier_name&&"function"==typeof this._css_beautify?i=this._css_beautify:"html"===n.custom_beautifier_name&&(i=function(t,e){return new d(t,e,_._js_beautify,_._css_beautify).beautify()}),"keep"===this._options.indent_scripts?s=0:"separate"===this._options.indent_scripts&&(s=-t.indent_level);var p=t.get_full_indent(s);if(r=r.replace(/\n[ \t]*$/,""),"html"!==n.custom_beautifier_name&&"<"===r[0]&&r.match(/^(<!--|<!\[CDATA\[)/)){var h=/^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(r);if(!h)return void t.add_raw_token(e);a=p+h[1]+"\n",r=h[4],h[5]&&(o=p+h[5]),r=r.replace(/\n[ \t]*$/,""),(h[2]||-1!==h[3].indexOf("\n"))&&(h=h[3].match(/[ \t]+$/))&&(e.whitespace_before=h[0])}if(r)if(i){var u=function(){this.eol="\n"};u.prototype=this._options.raw_options,r=i(p+r,new u)}else{var l=e.whitespace_before;l&&(r=r.replace(new RegExp("\n("+l+")?","g"),"\n")),r=p+r.replace(/\n/g,"\n"+p)}a&&(r=r?a+r+"\n"+o:a+o),t.print_newline(!1),r&&(e.text=r,e.whitespace_before="",e.newlines=0,t.add_raw_token(e),t.print_newline(!0))}},d.prototype._handle_tag_open=function(t,e,n,_,i){var r=this._get_tag_open_token(e);if(!n.is_unformatted&&!n.is_content_unformatted||n.is_empty_element||e.type!==s.TAG_OPEN||r.is_start_tag?(t.traverse_whitespace(e),this._set_tag_position(t,e,r,n,_),r.is_inline_element||t.set_wrap_point(),t.print_token(e)):(t.add_raw_token(e),r.start_tag_token=this._tag_stack.try_pop(r.tag_name)),r.is_start_tag&&this._is_wrap_attributes_force){var a,o=0;do{(a=i.peek(o)).type===s.ATTRIBUTE&&(r.attr_count+=1),o+=1}while(a.type!==s.EOF&&a.type!==s.TAG_CLOSE)}return(this._is_wrap_attributes_force_aligned||this._is_wrap_attributes_aligned_multiple||this._is_wrap_attributes_preserve_aligned)&&(r.alignment_size=e.text.length+1),r.tag_complete||r.is_unformatted||(t.alignment_size=r.alignment_size),r};var f=function(t,e,n){if(this.parent=e||null,this.text="",this.type="TK_TAG_OPEN",this.tag_name="",this.is_inline_element=!1,this.is_unformatted=!1,this.is_content_unformatted=!1,this.is_empty_element=!1,this.is_start_tag=!1,this.is_end_tag=!1,this.indent_content=!1,this.multiline_content=!1,this.custom_beautifier_name=null,this.start_tag_token=null,this.attr_count=0,this.has_wrapped_attrs=!1,this.alignment_size=0,this.tag_complete=!1,this.tag_start_char="",this.tag_check="",n){var _;this.tag_start_char=n.text[0],this.text=n.text,"<"===this.tag_start_char?(_=n.text.match(/^<([^\s>]*)/),this.tag_check=_?_[1]:""):(_=n.text.match(/^{{~?(?:[\^]|#\*?)?([^\s}]+)/),this.tag_check=_?_[1]:"",(n.text.startsWith("{{#>")||n.text.startsWith("{{~#>"))&&">"===this.tag_check[0]&&(">"===this.tag_check&&null!==n.next?this.tag_check=n.next.text.split(" ")[0]:this.tag_check=n.text.split(">")[1])),this.tag_check=this.tag_check.toLowerCase(),n.type===s.COMMENT&&(this.tag_complete=!0),this.is_start_tag="/"!==this.tag_check.charAt(0),this.tag_name=this.is_start_tag?this.tag_check:this.tag_check.substr(1),this.is_end_tag=!this.is_start_tag||n.closed&&"/>"===n.closed.text;var i=2;"{"===this.tag_start_char&&this.text.length>=3&&"~"===this.text.charAt(2)&&(i=3),this.is_end_tag=this.is_end_tag||"{"===this.tag_start_char&&(!t.indent_handlebars||this.text.length<3||/[^#\^]/.test(this.text.charAt(i)))}else this.tag_complete=!0};d.prototype._get_tag_open_token=function(t){var e=new f(this._options,this._tag_stack.get_parser_token(),t);return e.alignment_size=this._options.wrap_attributes_indent_size,e.is_end_tag=e.is_end_tag||u(e.tag_check,this._options.void_elements),e.is_empty_element=e.tag_complete||e.is_start_tag&&e.is_end_tag,e.is_unformatted=!e.tag_complete&&u(e.tag_check,this._options.unformatted),e.is_content_unformatted=!e.is_empty_element&&u(e.tag_check,this._options.content_unformatted),e.is_inline_element=u(e.tag_name,this._options.inline)||this._options.inline_custom_elements&&e.tag_name.includes("-")||"{"===e.tag_start_char,e},d.prototype._set_tag_position=function(t,e,n,_,i){if(n.is_empty_element||(n.is_end_tag?n.start_tag_token=this._tag_stack.try_pop(n.tag_name):(this._do_optional_end_element(n)&&(n.is_inline_element||t.print_newline(!1)),this._tag_stack.record_tag(n),"script"!==n.tag_name&&"style"!==n.tag_name||n.is_unformatted||n.is_content_unformatted||(n.custom_beautifier_name=h(n.tag_check,e)))),u(n.tag_check,this._options.extra_liners)&&(t.print_newline(!1),t._output.just_added_blankline()||t.print_newline(!0)),n.is_empty_element){if("{"===n.tag_start_char&&"else"===n.tag_check)this._tag_stack.indent_to_tag(["if","unless","each"]),n.indent_content=!0,t.current_line_has_match(/{{#if/)||t.print_newline(!1);"!--"===n.tag_name&&i.type===s.TAG_CLOSE&&_.is_end_tag&&-1===n.text.indexOf("\n")||(n.is_inline_element||n.is_unformatted||t.print_newline(!1),this._calcluate_parent_multiline(t,n))}else if(n.is_end_tag){var r=!1;r=(r=n.start_tag_token&&n.start_tag_token.multiline_content)||!n.is_inline_element&&!(_.is_inline_element||_.is_unformatted)&&!(i.type===s.TAG_CLOSE&&n.start_tag_token===_)&&"TK_CONTENT"!==i.type,(n.is_content_unformatted||n.is_unformatted)&&(r=!1),r&&t.print_newline(!1)}else n.indent_content=!n.custom_beautifier_name,"<"===n.tag_start_char&&("html"===n.tag_name?n.indent_content=this._options.indent_inner_html:"head"===n.tag_name?n.indent_content=this._options.indent_head_inner_html:"body"===n.tag_name&&(n.indent_content=this._options.indent_body_inner_html)),n.is_inline_element||n.is_unformatted||"TK_CONTENT"===i.type&&!n.is_content_unformatted||t.print_newline(!1),this._calcluate_parent_multiline(t,n)},d.prototype._calcluate_parent_multiline=function(t,e){!e.parent||!t._output.just_added_newline()||(e.is_inline_element||e.is_unformatted)&&e.parent.is_inline_element||(e.parent.multiline_content=!0)};var g=["address","article","aside","blockquote","details","div","dl","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hr","main","menu","nav","ol","p","pre","section","table","ul"],m=["a","audio","del","ins","map","noscript","video"];d.prototype._do_optional_end_element=function(t){var e=null;if(!t.is_empty_element&&t.is_start_tag&&t.parent){if("body"===t.tag_name)e=e||this._tag_stack.try_pop("head");else if("li"===t.tag_name)e=e||this._tag_stack.try_pop("li",["ol","ul","menu"]);else if("dd"===t.tag_name||"dt"===t.tag_name)e=(e=e||this._tag_stack.try_pop("dt",["dl"]))||this._tag_stack.try_pop("dd",["dl"]);else if("p"===t.parent.tag_name&&-1!==g.indexOf(t.tag_name)){var n=t.parent.parent;n&&-1!==m.indexOf(n.tag_name)||(e=e||this._tag_stack.try_pop("p"))}else"rp"===t.tag_name||"rt"===t.tag_name?e=(e=e||this._tag_stack.try_pop("rt",["ruby","rtc"]))||this._tag_stack.try_pop("rp",["ruby","rtc"]):"optgroup"===t.tag_name?e=e||this._tag_stack.try_pop("optgroup",["select"]):"option"===t.tag_name?e=e||this._tag_stack.try_pop("option",["select","datalist","optgroup"]):"colgroup"===t.tag_name?e=e||this._tag_stack.try_pop("caption",["table"]):"thead"===t.tag_name?e=(e=e||this._tag_stack.try_pop("caption",["table"]))||this._tag_stack.try_pop("colgroup",["table"]):"tbody"===t.tag_name||"tfoot"===t.tag_name?e=(e=(e=(e=e||this._tag_stack.try_pop("caption",["table"]))||this._tag_stack.try_pop("colgroup",["table"]))||this._tag_stack.try_pop("thead",["table"]))||this._tag_stack.try_pop("tbody",["table"]):"tr"===t.tag_name?e=(e=(e=e||this._tag_stack.try_pop("caption",["table"]))||this._tag_stack.try_pop("colgroup",["table"]))||this._tag_stack.try_pop("tr",["table","thead","tbody","tfoot"]):"th"!==t.tag_name&&"td"!==t.tag_name||(e=(e=e||this._tag_stack.try_pop("td",["table","thead","tbody","tfoot","tr"]))||this._tag_stack.try_pop("th",["table","thead","tbody","tfoot","tr"]));return t.parent=this._tag_stack.get_parser_token(),e}},t.exports.Beautifier=d},function(t,e,n){var _=n(6).Options;function i(t){_.call(this,t,"html"),1===this.templating.length&&"auto"===this.templating[0]&&(this.templating=["django","erb","handlebars","php"]),this.indent_inner_html=this._get_boolean("indent_inner_html"),this.indent_body_inner_html=this._get_boolean("indent_body_inner_html",!0),this.indent_head_inner_html=this._get_boolean("indent_head_inner_html",!0),this.indent_handlebars=this._get_boolean("indent_handlebars",!0),this.wrap_attributes=this._get_selection("wrap_attributes",["auto","force","force-aligned","force-expand-multiline","aligned-multiple","preserve","preserve-aligned"]),this.wrap_attributes_min_attrs=this._get_number("wrap_attributes_min_attrs",2),this.wrap_attributes_indent_size=this._get_number("wrap_attributes_indent_size",this.indent_size),this.extra_liners=this._get_array("extra_liners",["head","body","/html"]),this.inline=this._get_array("inline",["a","abbr","area","audio","b","bdi","bdo","br","button","canvas","cite","code","data","datalist","del","dfn","em","embed","i","iframe","img","input","ins","kbd","keygen","label","map","mark","math","meter","noscript","object","output","progress","q","ruby","s","samp","select","small","span","strong","sub","sup","svg","template","textarea","time","u","var","video","wbr","text","acronym","big","strike","tt"]),this.inline_custom_elements=this._get_boolean("inline_custom_elements",!0),this.void_elements=this._get_array("void_elements",["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr","!doctype","?xml","basefont","isindex"]),this.unformatted=this._get_array("unformatted",[]),this.content_unformatted=this._get_array("content_unformatted",["pre","textarea"]),this.unformatted_content_delimiter=this._get_characters("unformatted_content_delimiter"),this.indent_scripts=this._get_selection("indent_scripts",["normal","keep","separate"])}i.prototype=new _,t.exports.Options=i},function(t,e,n){var _=n(9).Tokenizer,i=n(9).TOKEN,r=n(13).Directives,s=n(14).TemplatablePattern,a=n(12).Pattern,o={TAG_OPEN:"TK_TAG_OPEN",TAG_CLOSE:"TK_TAG_CLOSE",CONTROL_FLOW_OPEN:"TK_CONTROL_FLOW_OPEN",CONTROL_FLOW_CLOSE:"TK_CONTROL_FLOW_CLOSE",ATTRIBUTE:"TK_ATTRIBUTE",EQUALS:"TK_EQUALS",VALUE:"TK_VALUE",COMMENT:"TK_COMMENT",TEXT:"TK_TEXT",UNKNOWN:"TK_UNKNOWN",START:i.START,RAW:i.RAW,EOF:i.EOF},p=new r(/<\!--/,/-->/),h=function(t,e){_.call(this,t,e),this._current_tag_name="";var n=new s(this._input).read_options(this._options),i=new a(this._input);if(this.__patterns={word:n.until(/[\n\r\t <]/),word_control_flow_close_excluded:n.until(/[\n\r\t <}]/),single_quote:n.until_after(/'/),double_quote:n.until_after(/"/),attribute:n.until(/[\n\r\t =>]|\/>/),element_name:n.until(/[\n\r\t >\/]/),angular_control_flow_start:i.matching(/\@[a-zA-Z]+[^({]*[({]/),handlebars_comment:i.starting_with(/{{!--/).until_after(/--}}/),handlebars:i.starting_with(/{{/).until_after(/}}/),handlebars_open:i.until(/[\n\r\t }]/),handlebars_raw_close:i.until(/}}/),comment:i.starting_with(/<!--/).until_after(/-->/),cdata:i.starting_with(/<!\[CDATA\[/).until_after(/]]>/),conditional_comment:i.starting_with(/<!\[/).until_after(/]>/),processing:i.starting_with(/<\?/).until_after(/\?>/)},this._options.indent_handlebars&&(this.__patterns.word=this.__patterns.word.exclude("handlebars"),this.__patterns.word_control_flow_close_excluded=this.__patterns.word_control_flow_close_excluded.exclude("handlebars")),this._unformatted_content_delimiter=null,this._options.unformatted_content_delimiter){var r=this._input.get_literal_regexp(this._options.unformatted_content_delimiter);this.__patterns.unformatted_content_delimiter=i.matching(r).until_after(r)}};(h.prototype=new _)._is_comment=function(t){return!1},h.prototype._is_opening=function(t){return t.type===o.TAG_OPEN||t.type===o.CONTROL_FLOW_OPEN},h.prototype._is_closing=function(t,e){return t.type===o.TAG_CLOSE&&e&&((">"===t.text||"/>"===t.text)&&"<"===e.text[0]||"}}"===t.text&&"{"===e.text[0]&&"{"===e.text[1])||t.type===o.CONTROL_FLOW_CLOSE&&"}"===t.text&&e.text.endsWith("{")},h.prototype._reset=function(){this._current_tag_name=""},h.prototype._get_next_token=function(t,e){var n=null;this._readWhitespace();var _=this._input.peek();return null===_?this._create_token(o.EOF,""):n=(n=(n=(n=(n=(n=(n=(n=(n=(n=(n=n||this._read_open_handlebars(_,e))||this._read_attribute(_,t,e))||this._read_close(_,e))||this._read_script_and_style(_,t))||this._read_control_flows(_,e))||this._read_raw_content(_,t,e))||this._read_content_word(_,e))||this._read_comment_or_cdata(_))||this._read_processing(_))||this._read_open(_,e))||this._create_token(o.UNKNOWN,this._input.next())},h.prototype._read_comment_or_cdata=function(t){var e=null,n=null,_=null;"<"===t&&("!"===this._input.peek(1)&&((n=this.__patterns.comment.read())?(_=p.get_directives(n))&&"start"===_.ignore&&(n+=p.readIgnored(this._input)):n=this.__patterns.cdata.read()),n&&((e=this._create_token(o.COMMENT,n)).directives=_));return e},h.prototype._read_processing=function(t){var e=null,n=null;if("<"===t){var _=this._input.peek(1);"!"!==_&&"?"!==_||(n=(n=this.__patterns.conditional_comment.read())||this.__patterns.processing.read()),n&&((e=this._create_token(o.COMMENT,n)).directives=null)}return e},h.prototype._read_open=function(t,e){var n=null,_=null;return e&&e.type!==o.CONTROL_FLOW_OPEN||"<"===t&&(n=this._input.next(),"/"===this._input.peek()&&(n+=this._input.next()),n+=this.__patterns.element_name.read(),_=this._create_token(o.TAG_OPEN,n)),_},h.prototype._read_open_handlebars=function(t,e){var n=null,_=null;return e&&e.type!==o.CONTROL_FLOW_OPEN||(this._options.templating.includes("angular")||this._options.indent_handlebars)&&"{"===t&&"{"===this._input.peek(1)&&(this._options.indent_handlebars&&"!"===this._input.peek(2)?(n=(n=this.__patterns.handlebars_comment.read())||this.__patterns.handlebars.read(),_=this._create_token(o.COMMENT,n)):(n=this.__patterns.handlebars_open.read(),_=this._create_token(o.TAG_OPEN,n))),_},h.prototype._read_control_flows=function(t,e){var n="",_=null;if(!this._options.templating.includes("angular"))return _;if("@"===t){if(""===(n=this.__patterns.angular_control_flow_start.read()))return _;for(var i=n.endsWith("(")?1:0,r=0;!n.endsWith("{")||i!==r;){var s=this._input.next();if(null===s)break;"("===s?i++:")"===s&&r++,n+=s}_=this._create_token(o.CONTROL_FLOW_OPEN,n)}else"}"===t&&e&&e.type===o.CONTROL_FLOW_OPEN&&(n=this._input.next(),_=this._create_token(o.CONTROL_FLOW_CLOSE,n));return _},h.prototype._read_close=function(t,e){var n=null,_=null;return e&&e.type===o.TAG_OPEN&&("<"===e.text[0]&&(">"===t||"/"===t&&">"===this._input.peek(1))?(n=this._input.next(),"/"===t&&(n+=this._input.next()),_=this._create_token(o.TAG_CLOSE,n)):"{"===e.text[0]&&"}"===t&&"}"===this._input.peek(1)&&(this._input.next(),this._input.next(),_=this._create_token(o.TAG_CLOSE,"}}"))),_},h.prototype._read_attribute=function(t,e,n){var _=null,i="";if(n&&"<"===n.text[0])if("="===t)_=this._create_token(o.EQUALS,this._input.next());else if('"'===t||"'"===t){var r=this._input.next();r+='"'===t?this.__patterns.double_quote.read():this.__patterns.single_quote.read(),_=this._create_token(o.VALUE,r)}else(i=this.__patterns.attribute.read())&&(_=e.type===o.EQUALS?this._create_token(o.VALUE,i):this._create_token(o.ATTRIBUTE,i));return _},h.prototype._is_content_unformatted=function(t){return-1===this._options.void_elements.indexOf(t)&&(-1!==this._options.content_unformatted.indexOf(t)||-1!==this._options.unformatted.indexOf(t))},h.prototype._read_raw_content=function(t,e,n){var _="";if(n&&"{"===n.text[0])_=this.__patterns.handlebars_raw_close.read();else if(e.type===o.TAG_CLOSE&&"<"===e.opened.text[0]&&"/"!==e.text[0]){var i=e.opened.text.substr(1).toLowerCase();this._is_content_unformatted(i)&&(_=this._input.readUntil(new RegExp("</"+i+"[\\n\\r\\t ]*?>","ig")))}return _?this._create_token(o.TEXT,_):null},h.prototype._read_script_and_style=function(t,e){if(e.type===o.TAG_CLOSE&&"<"===e.opened.text[0]&&"/"!==e.text[0]){var n=e.opened.text.substr(1).toLowerCase();if("script"===n||"style"===n){var _=this._read_comment_or_cdata(t);if(_)return _.type=o.TEXT,_;var i=this._input.readUntil(new RegExp("</"+n+"[\\n\\r\\t ]*?>","ig"));if(i)return this._create_token(o.TEXT,i)}}return null},h.prototype._read_content_word=function(t,e){var n="";return this._options.unformatted_content_delimiter&&t===this._options.unformatted_content_delimiter[0]&&(n=this.__patterns.unformatted_content_delimiter.read()),n||(n=e&&e.type===o.CONTROL_FLOW_OPEN?this.__patterns.word_control_flow_close_excluded.read():this.__patterns.word.read()),n?this._create_token(o.TEXT,n):null},t.exports.Tokenizer=h,t.exports.TOKEN=o}],n={};var _=function t(_){var i=n[_];if(void 0!==i)return i.exports;var r=n[_]={exports:{}};return e[_](r,r.exports,t),r.exports}(18);t=_}();var e=t;if("function"==typeof define&&define.amd)define(["require","./beautify","./beautify-css"],(function(t){var n=t("./beautify"),_=t("./beautify-css");return{html_beautify:function(t,i){return e(t,i,n.js_beautify,_.css_beautify)}}}));else if("undefined"!=typeof exports){var n=require("./beautify.js"),_=require("./beautify-css.js");exports.html_beautify=function(t,i){return e(t,i,n.js_beautify,_.css_beautify)}}else"undefined"!=typeof window?window.html_beautify=function(t,n){return e(t,n,window.js_beautify,window.css_beautify)}:"undefined"!=typeof global&&(global.html_beautify=function(t,n){return e(t,n,global.js_beautify,global.css_beautify)})}();

/*!****************************
* data.js
******************************/
const defaultHtmls={name:"Built-in HTMLs",page:{content:'<html lang="en">\n<head>\n<meta charset="utf-8" />\n<link rel="icon" type="image/png" href="static/favicon.png">\n<link rel="stylesheet" href="static/main.css">\n<script src="static/main.js"><\/script>\n</head>\n<body>\n<header class="top-nav"> </header>\n<div class="search-form">\n<form class="search" action="../$search.html" method="get">\n<input id="q" type="text" required placeholder="Search ..." />\n<input class="submit" type="submit" />\n</form>\n</div>\n<div id="wrapper" lang="en">\n<div class="nav-wrap">\n<nav class="sidebar">\n<form class="nav-filter">\n<span class="filter-img"></span>\n<input id="fq" type="text" placeholder=". filter ... " />\n</form>\n<h4>Toc header</h4>\n<div class="toc">\n<ul>\n<li><a href="url1.html">Item 1</a></li>\n<li><a href="url2.html">Item 2</a></li>\n<li><a href="url3.html">Item 3</a></li>\n<li><a href="url4.html">Item 4</a></li>\n</ul>\n</div>\n</nav>\n</div>\n<div class="content-wrap">\n<div class="content main">\n<form class="search-bar"></form>\n<section title="Section one">\n<article>\n<h1>Header</h1>\n<p class="p1">Paragraph one.</p>\n<p class="p2">Paragraph two.</p>\n<p>Test content.</p>\n<div dir="rtl">\n<span>test rtl</span>\n<div dir="ltr">\n<span>test1 ltr</span>\n<div dir="rtl">עִבְרִית rtl rtl<span>test2 rtl</span></div>\n<span>test3 ltr</span>\n<div dir="rtl"><span>test6 rtl</span></div>\n<div><span>test7 ltr</span></div>\n</div>\n<span>test8 rtl</span>\n</div>            </article>\n</section>\n<section title="Section two">\n<div>\n<label><input type="checkbox" checked value="">checkbox</label>\n<label><input type="radio" value="" checked> radio 1</label>\n<label><input type="radio" value=""> radio 2</label>\n</div>\n<div>\n<p lang=\'nl\'>Dit is een Nederlandse paragraaf.</p>\n<p lang=\'de\'>Dies ist ein deutscher Satz.</p> \n<p lang=\'en\'>This is an English sentence.</p> \n<p lang=\'en-GB\'>Matching the language range of English.</p> \n<p lang=\'fr\'>Ceci est un paragraphe français.</p>\n<p lang=\'fr-Latn-FR\'>Ceci est un paragraphe français en latin.</p>\n</div>\n</section>\n</div>\n<footer>\n<span>Footer</span>\n<a href="https://#">link</a>\n</footer>\n</div>\n</div>\n</body>\n</html>'},table:{content:'<div>\n<table class="t1">\n<tbody><tr>\n<td>1.1</td>\n<td>1.2</td>\n<td>1.3</td>\n</tr>\n<tr>\n<td>2.1</td>\n<td>2.2</td>\n<td>2.3</td>\n</tr>\n<tr>\n<td>3.1</td>\n<td>3.2</td>\n<td>3.3</td>\n</tr>\n<tr>\n<td>4.1</td>\n<td>4.2</td>\n<td>4.3</td>\n</tr>\n</tbody></table>\n</div>'},descriptionList:{content:"<div>\n<dl>\n<dt>First definition term</dt>\n<dd>First definition</dd>\n<dt>Second definition term</dt>\n<dd>Second definition</dd>\n<dt>Third definition term</dt>\n<dd>Third definition</dd>\n<dt>Fourth definition term</dt>\n<dd>Fourth definition</dd>\n<dt>Fifth definition term</dt>\n<dd>Fifth definition</dd>\n<dt>Sixth definition term</dt>\n<dd>Sixth definition</dd>\n</dl>\n</div>"},unorderedList:{content:'<ul>\n<li class="noted">Diego</li>\n<li>Shilpa</li>\n<li class="noted">Caterina</li>\n<li>Jayla</li>\n<li>Tyrone</li>\n<li>Ricardo</li>\n<li class="noted">Gila</li>\n<li>Sienna</li>\n<li>Titilayo</li>\n<li class="noted">Lexi</li>\n<li>Aylin</li>\n<li>Leo</li>\n<li>Leyla</li>\n<li class="noted">Bruce</li>\n<li>Aisha</li>\n<li>Veronica</li>\n<li class="noted">Kyouko</li>\n<li>Shireen</li>\n<li>Tanya</li>\n<li class="noted">Marlene</li>\n</ul>'},toc:{content:'<ul>\n<li>\n<div class="collapsed"></div>\n<span>Header</span>\n<ul style="display:none;">\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li>\n<div class="collapsed"></div>\n<span>Subheader</span>\n<ul style="display:none;">\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n</ul>\n</li>\n</ul>\n</li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n<li><a href="#">Item </a></li>\n</ul>'},nth:{content:"<div>\n\t<p class='c1'>1.</p>\n\t<h2>h2.</h2>\n\t<p class='c2'>2.</p>\n\t<p class='c3'>3.</p>\n\t<h2>h2.</h2>\n\t<p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<div id=div1>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t\x3c!-- <p>The tenth p.</p> --\x3e\n</div>\n<hr>\n\n<div id=first>\n\t<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p class=nth>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p class=nth>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n<p class='c4'>4</p>\n\t<p class='c5'>5</p>\n\t<p class='c6'>6</p>\n</div>\n\n<hr>\n\n<div id=second>\n<p>The first p.</p>\n\t<p>The second p.</p>\n\t<p>The third p.</p>\n\t<p>The fourth p.</p>\n\n\t<p>The first p.</p>\n\t<p>The sixth p.</p>\n\t<p>The seventh p.</p>\n\t<p>The eighth p.</p>\n\t<b>The B element.</b>\n\n\t<p>The ninth p.</p>\n\t<p>The tenth p.</p>\n\t<p>The eleventh p.</p>\n\t<p>The twelfth p.</p>\n\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>\n\n<div id=third>\n\t<p>The 1 p.</p>\n\t<b>The B element.</b>\n\t<p>The 2 p.</p>\n\t<p>The 3 p.</p>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n\t<b>The B element.</b>\n</div>"}},exampleSelectors=[["$$Combinators",""],["ul > li","child"],["li !> ul","parent","0"],["h1 + p","adjacent following sibling"],["div !+ p","adjacent preceding sibling","0"],["div ^ p","first child"],["div !^ p","last child","0"],["div ~ p","following sibling"],["div !~ p","preceding sibling","0"],["p ! div","ancestors","0"],["$$Class, id",""],["div.content","contains class"],["#wrapper","id"],["$$Class attribute non-standard","Non-standard XPath behavior","It deals with individual classes instead of the whole className string"],["div[class='content']","contains class","","N"],["div[class!='content']","not contains class","","N"],["div[class='content' i]","contains class ignore case","1 2","N"],["div[class^='cont']","class starts with","","N"],["div[class$='tent']","class ends with","","N"],["div[class~='content']","contains class","","N"],["div[class*='ten']","contains class containing substring","","N"],["div[class|='content']","contains exactly or followed by a hyphen","","N"],["$$Attributes",""],["section[title='Section one']","equal"],["section[title!='Section one']","not equals"],["section[title^='Sect']","starts with"],["section[title$='two']","ends with"],["section[title*='on on']","contains within"],["*[lang|=EN]","exactly or followed by a hyphen"],["$$Attributes ignore case",""],["section[title='section one' i]","","1 2"],["section[title^='sect' i]","","1 2"],["section[title$='TWO' i]","","1 2"],["section[title~='One' i]","","1 2"],["section[title*='on On' i]","","1 2"],["$$Pseudo-classes",""],["div:not(.toc)",""],["div:not(:has(nav))",""],["div:has(h1, h2)",""],["div:has(.main)",""],["a:is([name], [href])",""],[":is(ol, ul) :is(ol, ul) ol",""],["li:after(div)","","0"],["p:after-sibling(h1)","","0"],["a:before(h1)","","0"],["p:before-sibling(p.p2)","","0"],["div:has-sibling(footer)","","0"],["form:has-parent(nav)","","0"],["input:has-ancestor(nav)","","0"],["p:contains('Test')","contains text","0"],["p:icontains('content')","","0 2"],["p:starts-with(Test)","","0"],["p:istarts-with('TEST')","","0 2"],["p:ends-with('tent.')","","0"],["p:iends-with('TENT.')","","0 2"],["ul>li:first","the first element","0"],["ul>li:first(2)","the first n elements","0"],["ul>li:last","the last element","0"],["ul>li:last(2)","the last n elements","0"],["li:nth(5)","element equal to n","0"],["li:eq(4)","element equal to n","0"],["li:gt(3)","elements greater than n","0"],["li:lt(4)","elements lesser than n","0"],["li:skip(4)","skip elements lesser than n","0"],["li:skip-first","skips the first element","0"],["li:skip-first(2)","skips the first n elements","0"],["li:skip-last","skips the last element","0"],["li:skip-last(2)","skips the last n elements","0"],["li:limit(5)","from to n inclusive","0"],["li:range(2, 5)","from n1 to n2 inclusive","0"],[":dir(ltr)","not handle auto"],["p:lang(en)","support wildcard (limited)"],["a:external",""],["*:empty","empty elements"],[":checked",""],[":enabled",""],[":disabled",""],[":target",""],[":text",""],["$$'-child'",""],["li:first-child",""],["li:last-child",""],["p:only-child",""],["li:nth-child(3)",""],["li:nth-child(3n+2)",""],["li:nth-last-child(even)",""],["li:nth-last-child(3n+2 of .noted)",""],["$$'-of-type'","","Not works with universal selector '*'"],["div p:first-of-type",""],["div>p:last-of-type",""],["div p:only-of-type",""],["li:nth-of-type(3)",""],["li:nth-of-type(-3n+2)",""],["li:nth-last-of-type(odd)",""],["li:nth-last-of-type(3n+2)",""],["$$Spaces, comments",""],["ul   >   li:not (  .c1  )",""],["li:nth-child  (  -3n  +  4  )   ",""],["li !> ul:first /*parent*/\n!^   li      /*last child*/\n!+   li  /*previous siblings*/","A comments demo"],["$$namespaces","Not works in browsers",""],["|*","all elements without a namespace"],["*|*","all elements"],["ns|*","all elements in namespace ns"],["ns|p",""],["div ns|p",""],["div |*",""],["div *|*",""],["div ns|*",""],["div ns|p",""],["*:not(ns|p)",""],["a[xlink|href='...']","attributes with namespace"]],classAttributes=[["$$Class attribute","Standard XPath behavior","It deals with the whole className string"],["div[class='content']","className is equal"],["div[class='content' i]","className is equal ignore case"],["div[class^='cont']","className starts with"],["div[class$='tent']","className ends with"],["div[class~='content']","contains class; the same as 'div.content'"],["div[class*='ten']","className contains within"],["div[class|='content']","className is equal or followed by a hyphen"]],autocompleteCSS=[":after()",":after-sibling()",":any-link",":before()",":before-sibling()",":checked",":contains()",":dir()",":disabled",":empty",":enabled",":ends-with()",":eq()",":external",":first",":first()",":first-child",":first-of-type",":gt()",":has()",":has-ancestor()",":has-parent()",":has-sibling()",":icontains()",":iends-with()",":is()",":istarts-with()",":lang()",":last",":last()",":last-child",":last-of-type",":limit()",":lt()",":matches()",":not()",":nth()",":nth-child()",":nth-last-child()",":nth-last-of-type()",":nth-of-type()",":only-child",":only-of-type",":range()",":root",":selected",":skip()",":skip-first",":skip-first()",":skip-last",":skip-last()",":starts-with()",":target",":text","even","odd","ltr","rtl"],autocompleteXPath=["ancestor::","ancestor-or-self::","attribute::","child::","descendant::","descendant-or-self::","namespace::","following::","following-sibling::","parent::","preceding::","preceding-sibling::","self::","and","boolean()","ceiling()","concat()","contains()","count()","false()","floor()","id()","lang()","last()","local-name()","mod","name()","namespace-uri()","node()","normalize-space()","not()","or","position()","processing-instruction()","round()","starts-with()","string()","string-length()","substring()","substring-after()","substring-before()","sum()","text()","translate()","true()"],htmlAttributes=["@abbr","@accept","@accesskey","@action","@actuate","@align","@alink","@allowfullscreen","@allowpaymentrequest","@alt","@arcrole","@aria-","@async","@autocomplete","@autofocus","@autoplay","@axis","@background","@bgcolor","@body","@border","@cellpadding","@cellspacing","@challenge","@charset","@checked","@cite","@class","@clear","@codetype","@color","@cols","@colspan","@command","@compact","@content","@contenteditable","@contextmenu","@controls","@coords","@crossorigin","@data-","@datetime","@declare","@default","@defer","@dir","@direction","@dirname","@disabled","@download","@draggable","@dropzone","@encoding","@enctype","@event","@face","@for","@form","@formaction","@formenctype","@formmethod","@formnovalidate","@formtarget","@frame","@frameborder","@headers","@height","@hidden","@high","@href","@hreflang","@icon","@id","@integrity","@ismap","@keytype","@kind","@label","@lang","@language","@link","@list","@longdesc","@loop","@low","@manifest","@marginheight","@marginwidth","@max","@maxlength","@media","@mediagroup","@method","@min","@minlength","@multiple","@muted","@name","@nohref","@nonce","@noresize","@noshade","@novalidate","@nowrap","@open","@optimum","@pattern","@ping","@placeholder","@poster","@preload","@prompt","@radiogroup","@readonly","@referrerpolicy","@rel","@required","@rev","@reversed","@role","@rows","@rowspan","@rules","@sandbox","@scheme","@scope","@scoped","@scrolling","@seamless","@selected","@shape","@show","@size","@sizes","@slot","@space","@span","@spellcheck","@src","@srcdoc","@srclang","@srcset","@standalone","@start","@step","@style","@summary","@tabindex","@target","@text","@title","@translate","@type","@typemustmatch","@usemap","@valign","@value","@valuetype","@version","@vlink","@width","@window","@wrap"],htmlTags=["abbr","acronym","address","applet","area","article","aside","audio","base","basefont","bdi","bdo","bgsound","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","command","comment","content","data","datalist","dd","del","details","dfn","dialog","dir","div","dl","dt","em","embed","fencedframe","fieldset","figcaption","figure","font","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","iframe","image","img","input","ins","isindex","kbd","keygen","label","legend","li","link","listing","main","map","mark","marquee","math","menu","menuitem","meta","meter","multicol","nobr","noembed","noframes","noscript","object","ol","optgroup","option","output","p","param","picture","plaintext","pre","progress","rb","rp","rt","rtc","ruby","samp","script","search","section","select","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","svg","table","tbody","td","template","textarea","tfoot","th","thead","time","title","tr","track","tt","u","ul","var","video","wbr","xmp"];

/*!****************************
* playground.js
******************************/
!function(e,t){"function"==typeof define&&define.amd?define([],t(e)):"object"==typeof exports?module.exports=t(e):e.initConverter=t(e)}("undefined"!=typeof global?global:this.window||this.global,(function(e){"use strict";const t={selectors:[],standard:!1,lowercase:"",uppercase:"",html:"",showHtmlBox:!1,save:function(){this.saveValue("selectors",JSON.stringify(t))},load:function(){const e=this.loadValue("selectors");if(e){const t=JSON.parse(e);t&&(this.selectors=t.selectors,this.html=t.html,this.showHtmlBox=t.showHtmlBox)}},loadValue:function(e){try{return localStorage.getItem(e)}catch(e){}return null},saveValue:function(e,t){try{t!==localStorage.getItem(e)&&localStorage.setItem(e,t)}catch(e){}}},n=document.getElementById("debug"),o=document.getElementById("up-btn"),c=document.getElementById("down-btn"),s=document.getElementById("css-box"),r=(document.getElementsByTagName("body")[0],document.getElementById("convert")),l=document.getElementById("clear-css"),a=document.getElementById("axis"),i=document.getElementById("translate"),d=document.getElementById("selector-history"),u=document.getElementById("lowercase"),m=document.getElementById("to-lowercase"),h=document.getElementById("uppercase"),f=document.getElementById("to-uppercase"),p=document.getElementById("console-use"),g=document.getElementById("xpath-box"),y=document.getElementById("copy-code"),E=document.getElementById("message-box"),v=document.querySelector("details.html"),b=document.getElementById("html-box"),x=document.getElementById("run-xpath"),w=document.getElementById("run-css"),I=document.getElementById("html-list"),L=document.getElementById("clear-html");new autoComplete(s,{suggestions:[autocompleteCSS,htmlTags,htmlAttributes.map((e=>e.replace("@","[")))],regex:/(^|[\s"'*./:=>+~^!@()[\]\\|]|[a-z](?=:)|[\s\w](?=\[))([:[@]?\w+[\w-]+)$/u,threshold:2,startsWith:!0,listItem:(e,t)=>{M(e)},debug:!n.checked}),new autoComplete(g,{suggestions:[autocompleteXPath,htmlTags,htmlAttributes],regex:/(?<trigger>^|[\s"'*./:=([\\|]|[/[](?=@))(?<query>[@]?[\w-]+)$/u,threshold:2,startsWith:!0,highlight:!0,listItem:(e,t)=>{M(e)},debug:!n.checked});const C=CodeJar(s,null,{tab:"  "}),k=CodeJar(g,null,{tab:"  "}),B=CodeJar(b,null,{tab:"  "}),S={axis:".//",standard:!1,uppercaseLetters:"",lowercaseLetters:"",printError:e=>g.innerHTML='<span class="errors">'+e+"</span>"};let H=!1,T=!1,A="",N=0;function M(e){const t=(e=e.querySelector("mark")||e).textContent;/^[@:[]/.test(t)&&(e.textContent=t.substr(1))}function O(e){try{return html_beautify(e)}catch(t){return e}}function P(){try{const e=JSON.parse(d.value);e&&(C.updateCode(e.selector),a.value=e.axis||".//",h.value=e.uppercase||"",u.value=e.lowercase||"")}catch(e){}}function R(e){g.focus(),k.recordHistory(),k.updateCode(""),e&&g.blur()}function q(e){g.focus(),k.recordHistory(),k.updateCode(e),g.blur()}function X(){E.innerHTML="",E.className="hide",new Mark(b).unmark()}function $(){X();const e=A||s.textContent.trim();if(!e)return;A="",q("");const o=a.value;S.axis=o,S.standard=p.checked,S.consoleUse=p.checked,S.translate=i.checked,S.postprocess=!!n.className||n.checked,S.uppercaseLetters=h.value.trim(),S.lowercaseLetters=u.value.trim(),S.debug=!n.checked;const{xpath:c,css:r,warning:l,error:d}=toXPath(e,S);var m;if(l&&(m=l,E.style.color="red",E.innerHTML=m.trim(),E.className=""),c&&q(p.checked?'$x("'+c+'")':c),v.hasAttribute("open")&&c){const t=function(e,t){let n,o="",c=!0,s=[],r=[];const{doc:l}=_();if(!l)return"";try{s=l.querySelectorAll(e)}catch(e){o+="Selector is not valid; ",c=!1}c&&(o+="Selector: count = "+s.length+"; ");c=!0;try{const e=l.evaluate(t,l,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);for(;n=e.iterateNext();)r.push(n)}catch(e){o+="XPath is not valid; ",c=!1}c&&(o+="XPath: count = "+r.length+";");if(s.length&&r.length){let e=0,t=0;for(let n=0;n<s.length;n++)s[n]===r[n]?e++:t++;t&&(o+=" Elements are <b>not reference equals</b>:<br>equals = "+e+"; not equals = "+t)}c&&(0===r.length&&s.length>0||s.length!==r.length)&&!S.translate&&/translate\(/.test(t)&&(o+="\n<b>Note</b> that <b>translate</b> checkbox is unchecked.");return o.replaceAll("; ",";<br>")}(e,c);J(c),t&&(E.innerHTML=t)}return d?void 0:(j(e,o),H&&(t.save(),H=!1),Y(),c)}function D(e){const t=window.getSelection();return t&&e.contains(t.anchorNode)?t.toString().trim():""}function J(e,n){X();const{doc:o,htmlString:c,indexes:s}=_();if(!o)return;let r,l;try{l=o.evaluate(e,o,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null)}catch(e){return void z(e)}const a=[];for(;r=l.iterateNext();)for(let e=0;e<s.length;e++)if(r===s[e].node){a.push(s[e].startIndex);break}B.updateCode(c),V(a,"XPath: "),t.html=c}function _(){let e=b.textContent;if(!e.trim())return{};const t=(new DOMParser).parseFromString(e,"text/html"),n=t.documentElement.outerHTML,o=function(e,t){const n=e.querySelectorAll("*"),o=[];let c=0;return n.forEach((e=>{const n=e.outerHTML,s=t.indexOf(n,c);-1!==s&&(o.push({node:e,startIndex:s}),c=s+3)})),o}(t,n);return{doc:t,htmlString:n,indexes:o}}function V(e,t){const o=e.length;if(U(t+"count = "+o),!o)return;const c=new Mark(b),s=/<[A-Za-z][\w:-]*(?:[^>"']+|"[^"]*"|'[^']*')*>/y;let r=0;if(s.lastIndex=e[r],c.unmark().markRegExp(s,{acrossElements:!0,each:()=>{++r<o?s.lastIndex=e[r]:s.lastIndex=1/0},done:(e,t)=>{t!==o&&U("main.js: Indexes count "+o+" !== "+t+" number of highlighted elements")}}),!n.checked)return;const l=b.querySelector("mark");l&&(l.scrollIntoView({block:"center"}),document.getElementById("demo")?.scrollIntoView(),scrollBy(0,-10))}function z(e){E.style.color="red",E.innerHTML=e.message||"Error",E.className="",console.error(e)}function U(e){E.style.color="black ",E.innerHTML=e,E.className=""}function j(e,n){e=e.replace(/'/g,"&#39;");const o=t.selectors.length;t.selectors=t.selectors.filter((t=>t.selector&&t.selector!==e)),o===t.selectors.length&&(H=!0);const c=h.value.trim(),s=u.value.trim();t.selectors.unshift({selector:e,axis:n,lowercase:s,uppercase:c}),t.selectors.length>30&&t.selectors.pop()}function Y(){let e="";t.selectors.forEach((t=>{if(!t.selector)return!0;e+="<option value='"+JSON.stringify(t)+"'>"+t.selector+"</option>"})),d.innerHTML=e}function W(e,t){const n=['<a href="#info-1">[1]</a> ','<a href="#info-2">[2]</a> ','<a href="#info-3">[3]</a> '],o=[];return o.push('<table><thead><tr><th>Description</th><th>CSS</th><th class="thead-xpath">XPath</th></tr></thead><tbody>'),e.forEach((e=>{if(/^\$\$/.test(e[0])){let t=e[0].substring(2);const n=t.replace(/\W+/g,"_").toLowerCase();t=t.replace(" non-standard",""),o.push('<tr class="group"><td id="',n,'">',t,"</td><td>"+(e[1]||"")+'</td><td><span class="example-info">'+(e[2]||"")+"</span></td></tr>")}else{const c=e[2]?e[2].split(" ").map((e=>n[e])).join(""):"";S.standard=void 0===e[3];let{xpath:s,css:r,warning:l,error:a}=toXPath(e[0],S);if(s){s=s.replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g,"ABC...").replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g,"abc...");const n=e[1]?e[1].replace(/ (n\d?)(?= |$)/g," <i>$1</i>"):" - ";o.push('<tr><td class="name">',c,n,"</td>"),t?o.push('<td class="css"><code class="css" data-selector="',e[0],'">',e[0].replace(/ +/g,"&nbsp;"),"</code></td>"):o.push('<td class="css"><code>',e[0].replace(/ +/g,"&nbsp;"),"</code></td>"),o.push('<td><code class="xpath">',s,"</code></td></tr>")}a&&console.log(e[0],a)}})),o.push("</tbody></table>"),o.join("")}"file:"===location.protocol&&(n.className=""),async function(){await async function(){return new Promise((e=>{const t=document.getElementById("examples");t.innerHTML=W(exampleSelectors,!0),t.querySelectorAll("code.css").forEach((e=>{e.addEventListener("click",(function(e){!function(e){l.click();const t=e.getAttribute("data-selector");var n;n=t,s.focus(),C.recordHistory(),C.updateCode(n),s.blur(),e.classList.add("visited"),scrollBy(0,-90)}(this)})),e.addEventListener("mouseover",(function(e){!function(e){N=e.getBoundingClientRect().top+window.scrollY}(this)}))})),document.getElementById("attribute-table").innerHTML=W(classAttributes),e()}))}()}(),function(){let e='<option value="">'+defaultHtmls.name+"</option>";for(const e in defaultHtmls)t(e,defaultHtmls);function t(t,n){if("name"!==t){let n=t.replace(/^[a-z]/,(e=>e.toUpperCase())).replace(/[a-z](?=[A-Z])/g,"$& ");n=n.replace(/( [A-Z])([a-z]+)/g,((e,t,n)=>t.toLowerCase()+n)),e+=`<option value="${t}">${n}</option>`}}I.innerHTML=e}(),t.load(),t.selectors&&t.selectors.length&&(Y(),P(d.value)),t.html&&t.html.length&&(B.updateCode(t.html),t.showHtmlBox&&v.setAttribute("open",!0)),C.onUpdate((()=>{H=!0})),B.onUpdate(((e,t)=>{H=!0,T&&t&&("paste"===t.type||"drop"===t.type)&&B.updateCode(O(e)),T=!1})),window.addEventListener("beforeunload",(function(e){if(H){const e=s.innerText.trim();e&&j(e,a.value);const n=b.textContent;n.trim()&&(t.html=n),t.save()}})),I.addEventListener("change",(function(e){const t=defaultHtmls[this.value]?.content;t&&(b.focus(),B.updateCode(O(t)),B.recordHistory(),b.blur())})),d.addEventListener("change",(function(e){P(this.value),setTimeout((function(){$()}),100)})),s.addEventListener("paste",(function(e){setTimeout((function(){$()}),100)})),n.addEventListener("click",(function(){$()})),i.addEventListener("click",(function(){$()})),p.addEventListener("click",(function(){$()})),y.addEventListener("click",(function(){document.getSelection().selectAllChildren(this.parentNode),document.execCommand("copy"),document.getSelection().removeAllRanges()})),a.addEventListener("change",(function(e){$()})),m.addEventListener("click",(function(){const e=h.value.trim();e&&(u.value=e.toLowerCase())})),f.addEventListener("click",(function(){const e=u.value.trim();e&&(h.value=e.toUpperCase())})),o.addEventListener("click",(function(){window.scrollTo(0,0)})),c.addEventListener("click",(function(){const e=window.pageYOffset,t=e+screen.height-150,n=screen.height/7;0===N||N<t&&N>e?window.scrollTo(0,1e4):(window.scrollTo(0,N),window.scrollBy(0,-n))})),r.addEventListener("click",(function(){A=D(s),X(),R(!0),setTimeout((function(){$()}),10)})),v.addEventListener("toggle",(function(){const e=this.hasAttribute("open");t.showHtmlBox=e,H=!0,X(),e&&(b.focus(),B.recordHistory(),b.textContent.trim()||B.updateCode(defaultHtmls.page.content),b.blur())})),x.addEventListener("click",(function(){let e=D(g)||g.textContent.trim();if(e)J(e);else{if(!s.textContent.trim())return;$()}})),w.addEventListener("click",(function(){!function(){X();const e=D(s)||s.innerText.trim();if(!e)return;const{doc:n,htmlString:o,indexes:c}=_();if(!n)return;let r;try{r=n.querySelectorAll(e)}catch(e){return void z(e)}const l=[];for(let e=0;e<r.length;e++)for(let t=0;t<c.length;t++)if(r[e]===c[t].node){l.push(c[t].startIndex);break}B.updateCode(o),V(l,"CSS: "),t.html=o}()})),l.addEventListener("click",(function(){var e;s.focus(),C.recordHistory(),C.updateCode(""),e&&s.blur(),R(!0),X(),s.focus(),H=!0})),L.addEventListener("click",(function(){b.focus(),B.recordHistory(),B.updateCode(""),T=H=!0}))}));

