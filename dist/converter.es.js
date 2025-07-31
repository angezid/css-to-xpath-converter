/*!*******************************************
* css-to-xpath-converter 1.0.0
* https://github.com/angezid/css-to-xpath-converter
* MIT licensed
* Copyright (c) 2024–2025, angezid
*********************************************/
function hasOr(xpath, union) {
	const reg = union ? /(?:[^'" |]|"[^"]*"|'[^']*')+|( or |\|)/g : /(?:[^'" ]|'[^']*'|"[^"]*")+|( or )/g;
	let rm;
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
	this.addChild = function(nd) {
		if ( !this.childNodes) this.childNodes = [];
		this.childNodes.push(nd);
	};
	this.add = function() {
		let str = '',
			arg = arguments,
			forbid = false;
		for (let i = 0; i < arg.length; i++) {
			if (i === arg.length - 1 && typeof arg[i] === 'boolean') forbid = true;
			else if(hasOr(arg[i], true)) {
				str += arg[i];
				forbid = true;
			} else str += arg[i];
		}
		if ( !this.content) this.content = [];
		this.content.push({ str, forbid });
	};
	this.hasAxis = function(axis) {
		if (this.axis === axis) return true;
		if (this.childNodes) {
			for (let i = 0; i < this.childNodes.length; i++) {
				if (this.childNodes[i].hasAxis(axis)) return true;
			}
		}
		return false;
	};
	this.clone = function() {
		const node = new xNode();
		node.owner = this.owner;
		node.isClone = true;
		return node;
	};
	this.toString = function(text = "") {
		if ( !this.isClone) {
			text = this.separator + this.axis + this.owner;
			const array = this.content;
			if (array) {
				const len = array.length;
				if (len === 1) {
					text += this.or ? array[0].str : '[' + removeBrackets(array[0].str) + ']';
				} else {
					let join = false;
					for (let i = 0; i < len; i++) {
						const obj = array[i],
							str = removeBrackets(obj.str),
							last = i + 1 === len;
						if ( !obj.forbid) {
							text += (join ? ' and ' : '[') + str;
							if (i + 1 < len && !array[i + 1].forbid) {
								text += (last ? ']' : '');
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
			this.childNodes.forEach((node) => {
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
	const instance = new Error(message, fileName, lineNumber);
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
	constructor : {
		value : Error,
		enumerable : false,
		writable : true,
		configurable : true
	}
});
if (Object.setPrototypeOf) {
	Object.setPrototypeOf(ParserError, Error);
} else {
	ParserError.__proto__ = Error;
}

const tagNameReg = /(?:[a-zA-Z]+\|)?(?:[a-zA-Z][^ -,.\/:-@[-^`{-~]*)|(?:[a-zA-Z]+\|*)/y;
const classIdReg = /(?:^\\00003\d+)?(?:\\[^ ]|[^\t-,.\/:-@[-^`{-~])+/y;
const pseudoClassReg = /((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))/y;
const nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;
const attributeReg = /(?:(?:\*|[a-zA-Z]+)\|)?(?:\*|[^ -,.\/:-@[-^`{-~]+)/y;
const attrNameReg = /(?:[a-zA-Z]+\|)?[^ -,.\/:-@[-^`{-~]+(?=(?:[~^|$!*]?=)|\])/y;
const attrValueReg = /(?:"([^"]*)"|'([^']*)'|((?:\\[^ ]|[^ "'\]])+))(?: +([siSI]))?(?=\])/y;
const State = Object.freeze({ "Text" : 0, "PseudoClass": 1, "AttributeName": 2, "AttributeValue": 3 });
const pseudo = "Pseudo-class ':";
const precedingSibling = "preceding-sibling::";
const followingSibling = "following-sibling::";
const ancestor = "ancestor::";
const navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";
let opt, warning, error, uppercase, lowercase, stack, code, position, length;
function toXPath(selector, options) {
	checkSelector(selector);
	opt = Object.assign({}, {
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
	const node = new xNode();
	let xpath;
	let normalized;
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
		return { xpath, css: normalized, warning, error: e.message };
	}
	return { xpath, css: normalized, warning, error: error };
}
function convertArgument(node, selector, axis, owner, argInfo) {
	if ( !selector) {
		argumentException("\':" + argInfo.name + '()\' has missing argument');
	}
	stack.push(code);
	const result = convert(node, selector, axis, owner, argInfo);
	code = stack.pop();
	length = code.length;
	return result;
}
function postprocess(xpath) {
	if (opt.postprocess) {
		if (opt.removeXPathSpaces) {
			xpath = xpath.replace(/("[^"]+"|'[^']+')|([,<=>|+-]) +| +(?=[<=>|+-])/g, (m, gr, gr2) => gr || gr2 || '');
		}
		const array = xpath.split(/(?<!\| *)(\bself::node\(\)\[)/g);
		xpath = '';
		for (let i = 0; i < array.length; i++) {
			if (array[i] === "self::node()[") {
				const str = array[i+1],
					obj = parseArgument(0, "[" + str, true, "[", "]");
				if (obj) {
					const content = obj.content,
						end = str.substr(obj.index);
					if ( !hasOr(content) && !(/^(?:\[| *\|)/.test(end) && !content.endsWith("]"))) {
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
		xpath = xpath.replace(/([/:])\*\[self::(\w+)(\[(?:[^"'[\]]|'[^']*'|"[^"]*")+\])?\]/g,  "$1$2$3");
		xpath = xpath.replace(/\/child::/g, '/');
	}
	xpath = xpath.replace(/(?:[^'"{}]|'[^']*'|"[^"]*")+|([{}])/g, (m, gr) => gr ? (gr === "{" ? "(" : ")") : m);
	return xpath;
}
function convert(rootNode, selector, axis, owner, argumentInfo) {
	checkSelector(selector);
	let unitNode = newNode(rootNode, null);
	let node = newNode(unitNode, null);
	const name = argumentInfo ? argumentInfo.name : '';
	const predicate = argumentInfo && argumentInfo.predicate;
	const not = name === 'not';
	let attrName = null,
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
		ch = code[length-1];
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
				case '.' :
					let str = '';
					do {
						[i, value] = parseClassValue(i + 1);
						str += getClass('@class', normalizeQuotes(' ' + value + ' '));
						classIdReg.lastIndex = i + 2;
						if (nextChar(i, '.') && classIdReg.test(code)) {
							str += " and ";
						} else break;
					} while (++i < length);
					node.add(str);
					check = false;
					break;
				case '#' :
					[i, value] = parseClassValue(i + 1);
					node.add("@id=", normalizeQuotes(value));
					check = false;
					break;
				case '>' :
					if (not) node = addNode(unitNode, node, "parent::");
					else node = newNode(unitNode, node, "child::", "/");
					check = true;
					break;
				case '+' :
					if (not) node = addTwoNodes(unitNode, node, precedingSibling, "*", "1");
					else node = addTwoNodes(unitNode, node, followingSibling, "*", "1");
					check = true;
					break;
				case '~' :
					if (not) node = addNode(unitNode, node, precedingSibling);
					else node = newNode(unitNode, node, followingSibling, "/");
					check = true;
					break;
				case '^' :
					if (not) node = addNode(unitNode, node, "parent::", notSibling(precedingSibling));
					else node = addTwoNodes(unitNode, node, "child::", "*", "1");
					check = true;
					break;
				case '!' :
					if (nextChar(i, '^')) {
						if (not) node = addNode(unitNode, node, "parent::", notSibling(followingSibling));
						else node = addTwoNodes(unitNode, node, "child::", "*", "last()");
						i++;
					} else if (nextChar(i, '+')) {
						if (not) node = addTwoNodes(unitNode, node, followingSibling, "*", "1");
						else node = addTwoNodes(unitNode, node, precedingSibling, "*", "1");
						i++;
					} else if (nextChar(i, '>')) {
						if (not) node = addNode(unitNode, node, "child::");
						else node = newNode(unitNode, node, "parent::", "/");
						i++;
					} else if (nextChar(i, '~')) {
						if (not) node = addNode(unitNode, node, followingSibling);
						else node = newNode(unitNode, node, precedingSibling, "/");
						i++;
					} else {
						if (not) node = addNode(unitNode, node, "descendant-or-self::");
						else node = newNode(unitNode, node, "ancestor-or-self::", "/");
					}
					check = true;
					break;
				case '[' :
					attrName = '';
					attrValue = null;
					modifier = null;
					operation = null;
					state = State.AttributeName;
					break;
				case ':' :
					if (nextChar(i, ':')) exception(1);
					state = State.PseudoClass;
					break;
				case ',' :
					if (i + 1 >= length) exception();
					unitNode = newNode(rootNode, unitNode);
					unitNode.or = true;
					unitNode.add(predicate ? " or " : " | ");
					unitNode = newNode(rootNode, unitNode);
					node = newNode(unitNode, null, argumentInfo ? "" : axis);
					check = true;
					break;
				case '@' :
					[i, node] = parseAttribute(i, axis, argumentInfo, unitNode, node);
					check = false;
					break;
				case '*' :
					addAxes(axis, node, argumentInfo);
					node.owner = "*";
					check = false;
					break;
				case ' ' :
					if (argumentInfo) {
						if (name === 'has-ancestor') {
							node = newNode(unitNode, node, ancestor, " and ");
						} else if (['has-parent', 'before', 'after'].includes(name) || name.endsWith('-sibling')) {
							if ( !node.previousNode) {
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
				case '|' :
					if (nextChar(i, '|')) {
						exception(1);
					} else {
						[i, node] = parseNamespace(i, axis, first, unitNode, node);
					}
					check = false;
					break;
				case '\\' :
					i++;
					break;
				default :
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
				case '=' :
					operation = "=";
					attrValue = null;
					state = State.AttributeValue;
					break;
				case '!' :
				case '~' :
				case '^' :
				case '$' :
				case '*' :
				case '|' :
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
				case ']' :
					if ( !attrName) parseException("attrName is null or empty.'");
					node.add("@" + attrName);
					state = State.Text;
					check = false;
					break;
				case ' ' : break;
				default :
					[i, value] = parseAttributeName(i);
					attrName += value;
					break;
			}
		} else if (state === State.AttributeValue) {
			switch (ch) {
				case ']' :
					if (attrValue === null) parseException("attrValue is null.");
					processAttribute(attrName, attrValue, operation, modifier, node);
					state = State.Text;
					check = false;
					break;
				case '=' :
					exception();
					break;
				case ' ' : break;
				default :
					if (attrValue) {
						parseException("attrValue '" + attrValue + "' is already parse: " + code.substr(i));
					}
					[i, attrValue, modifier] = parseAttributeValue(i);
					break;
			}
		} else if (state === State.PseudoClass) {
			let name = '',
				arg = '';
			[i, name, arg] = parsePseudoClass(i);
			if (name === "root") {
				node.owner = node.separator = '';
				node.axis = '//';
				node = newNode(unitNode, node, "ancestor-or-self::");
				node.owner = "*";
				node.add("last()");
			} else {
				addOwner(owner, node);
				if (name.startsWith("nth-")) {
					processNth(name, arg, argumentInfo, node);
				} else {
					processPseudoClass(name, arg, not, node);
				}
			}
			state = State.Text;
			check = false;
		}
	}
	let result = rootNode.toString();
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
	const nd = new xNode(unitNode);
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
	const nd = newNode(unitNode, node, axis, "/");
	nd.owner = owner;
	nd.add(content, true);
	return newNode(unitNode, nd, "self::", "/");
}
function addAxes(axis, node, argumentInfo) {
	if ( !axis || node.axis || axis === "self::" && !argumentInfo) return;
	const text = node.parentNode.toString().trim(),
		len = text.length;
	if (len == 0 || endByOr(text)) {
		node.axis = axis;
	}
}
function addOwner(owner, node) {
	if (node.owner) return;
	let result = '';
	if ( !node.previousNode) {
		result = owner || "*";
	} else {
		const text = node.parentNode.toString().trim();
		if (text.length) {
			if (endByOr(text)) {
				result = owner || "*";
			} else {
				const ch = text[text.length - 1];
				if (owner) {
					if (ch === ':') result = "*";
					else if (ch === '/') result = owner;
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
			if ( !node.owner) {
				node.owner = "*";
				node.add("not(contains(name(), ':'))");
			} else {
				node.owner += ":*";
			}
			i++;
		} else if (i + 1 < length && /[a-zA-Z]/.test(code[i + 1])) {
			let nd = newNode(unitNode, node, "self::", "/");
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
	const text = node.parentNode.toString().trim();
	if (text.length === 0) {
		if (argumentInfo) axis = "";
	} else if (endByOr(text)) {
		axis = "";
	} else {
		const ch = text[text.length - 1];
		if (ch !== ':' && ch !== '/') axis = "/";
		else axis = "";
	}
	attributeReg.lastIndex = i + 1;
	const rm = attributeReg.exec(code);
	if (rm !== null) {
		const nd = newNode(unitNode, node, axis);
		nd.add("@", rm[0].replace('|', ':').toLowerCase());
		return [i + rm[0].length, nd];
	}
	regexException(i, 'parseAttribute', attributeReg);
}
function processAttribute(attrName, attrValue, operation, modifier, node) {
	if ( !attrValue.trim()) {
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
	const ignoreCase = modifier === "i" || attrName === 'lang' || attrName === 'type' && getOwner(node) == "input";
	if ( !opt.standard && attrName === "class") {
		processClass(attrValue, operation, ignoreCase, node);
		return;
	}
	const attr = ignoreCase ? translateToLower("@" + attrName) : "@" + attrName;
	const value = ignoreCase ? toLower(attrValue) : normalizeQuotes(attrValue);
	switch (operation) {
		case "=" :
			node.add(attr, " = ", value);
			break;
		case "!=" :
			node.add("{not(@", attrName, ") or ", attr, "!=", value, "}");
			break;
		case "~=" :
			node.add("contains(concat(' ', normalize-space(", attr, "), ' '), concat(' ', normalize-space(", value, "), ' '))");
			break;
		case "|=" :
			const value2 = ignoreCase ? "concat(" + value+ ", '-')" : normalizeQuotes(attrValue + '-');
			node.add("{", attr, " = ", value, " or starts-with(", attr, ", ", value2, ")}");
			break;
		case "^=" :
			node.add("starts-with(", attr, ", ", value, ")");
			break;
		case "$=" :
			node.add(endsWith(attr, "@" + attrName, normalizeQuotes(attrValue), value));
			break;
		case "*=" :
			node.add("contains(", attr, ", ", value, ")");
			break;
	}
}
function processClass(attrValue, operation, ignoreCase, node) {
	const attrName = ignoreCase ? translateToLower("@class") : "@class";
	let attributeValue = attrValue.trim();
	switch (operation) {
		case "=" :
		case "~=" :
		case "!=" :
			attributeValue = " " + attributeValue + " ";
			break;
		case "^=" :
			attributeValue = " " + attributeValue;
			break;
		case "$=" :
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
		const attrValue1 = ignoreCase ? toLower(' ' + attrValue + ' ') : normalizeQuotes(' ' + attrValue + ' ');
		const attrValue2 = ignoreCase ? toLower(' ' + attrValue + '-') : normalizeQuotes(' ' + attrValue + '-');
		node.add("{", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "}");
	} else {
		node.add(getClass(attrName, attributeValue));
	}
}
function getClass(attrName, attributeValue) {
	return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;
}
function processPseudoClass(name, arg, not, node) {
	let nd, result, owner, str = '', val, localName = 'local-name()';
	switch (name) {
		case "any-link" :
			node.add("(", localName, " = 'a' or ", localName, " = 'area') and @href");
			break;
		case "external" :
			node.add("(", localName, " = 'a' or ", localName, " = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://'))");
			break;
		case "contains" :
			node.add("contains(normalize-space(), ", normalizeString(arg, name), ")");
			break;
		case "icontains" :
			node.add("contains(", toLower(), ", ", normalizeArg(arg), ")");
			break;
		case "empty" :
			node.add("not(*) and not(text())");
			break;
		case "dir" :
			val = normalizeQuotes(arg);
			const dft = /ltr/.test(val);
			node.add(dft ? "{not(ancestor-or-self::*[@dir]) or " : "", "ancestor-or-self::*[@dir][1][@dir = ", val, "]", dft ? "}" : "");
			break;
		case "first-child" :
			node.add(notSibling(precedingSibling));
			break;
		case "first" :
			if (not) node.add(arg ? getNot(precedingSibling, " <= ") : notSibling(precedingSibling));
			else node.add(arg ? "position() <= " + parseNumber(arg, name) : "1", !arg);
			break;
		case "first-of-type" :
			owner = getOwner(node, name);
			node.add(notSibling(precedingSibling, owner));
			break;
		case "gt" :
			if (not) node.add(getNot(precedingSibling, " > "));
			else node.add("position() > ", parseNumber(arg, name));
			break;
		case "lt" :
			if (not) node.add(getNot(precedingSibling, " <= "));
			else node.add("position() < ", parseNumber(arg, name));
			break;
		case "eq" :
		case "nth" :
			if (not) node.add(getNot(precedingSibling, " = "));
			else node.add(parseNumber(arg, name), true);
			break;
		case "last-child" :
			node.add(notSibling(followingSibling));
			break;
		case "only-child" :
			node.add("not(", precedingSibling, "*) and not(", followingSibling, "*)");
			break;
		case "only-of-type" :
			owner = getOwner(node, name);
			node.add("not(", precedingSibling, owner, ") and not(", followingSibling, owner, ")");
			break;
		case "text" :
			node.add("@type='text'");
			break;
		case "starts-with" :
			node.add("starts-with(normalize-space(), ", normalizeString(arg, name), ")");
			break;
		case "istarts-with" :
			node.add("starts-with(", toLower(), ", ", normalizeArg(arg), ")");
			break;
		case "ends-with" :
			str = normalizeString(arg, name);
			node.add(endsWith("normalize-space()", "normalize-space()", str, str));
			break;
		case "iends-with" :
			str = normalizeArg(arg);
			node.add(endsWith(toLower(), "normalize-space()", normalizeString(arg, name), str));
			break;
		case "is" :
		case "matches" :
			nd = node.clone();
			result = convertArgument(nd, arg, "self::", "node()", { predicate: true, name: name });
			node.add(result);
			break;
		case "not" :
			nd = node.clone();
			result = convertArgument(nd, arg, "self::", "node()", { name: name });
			if (result !== "self::node()") {
				result = transformNot(nd);
				node.add("not(" + result + ")");
			}
			break;
		case "has" :
			nd = node.clone();
			result = convertArgument(nd, arg, ".//", null, { name: name });
			node.add(result);
			break;
		case "has-sibling" :
			nd = node.clone();
			let precedings = convertArgument(nd, arg, precedingSibling, null, { name: name });
			if (nd.hasAxis(ancestor)) {
				precedings = transform(nd, precedingSibling);
			}
			nd = node.clone();
			let followings = convertArgument(nd, arg, followingSibling, null, { name: name });
			if (nd.hasAxis(ancestor)) {
				followings = transform(nd, followingSibling);
			}
			node.add("{(", precedings, ") or (", followings, ")}");
			break;
		case "has-parent" :
			process("parent::");
			break;
		case "has-ancestor" :
			nd = node.clone();
			result = convertArgument(nd, arg, ancestor, null, { name: name });
			node.add(result);
			break;
		case "after" :
			process("preceding::");
			break;
		case "after-sibling" :
			process(precedingSibling);
			break;
		case "before" :
			process("following::");
			break;
		case "before-sibling" :
			process(followingSibling);
			break;
		case "last" :
			if (not) node.add(arg ? getNot(followingSibling, " <= ") : notSibling(followingSibling));
			else node.add(arg ? "position() > last() - " + parseNumber(arg, name) + "" : "last()", !arg);
			break;
		case "last-of-type" :
			owner = getOwner(node, name);
			node.add(notSibling(followingSibling, owner));
			break;
		case "skip" :
			if (not) node.add(getNot(precedingSibling, " > "));
			else node.add("position() > ", parseNumber(arg, name));
			break;
		case "skip-first" :
			if (not) node.add(arg ? getNot(precedingSibling, " > ") : notSibling(precedingSibling));
			else node.add("position() > ", arg ? parseNumber(arg, name) : "1", !arg);
			break;
		case "skip-last" :
			if (not) node.add(arg ? getNot(followingSibling, " > ") : notSibling(followingSibling));
			else node.add("position() < last()", arg ? " - " + (parseNumber(arg, name) - 1) : "");
			break;
		case "limit" :
			if (not) node.add(getNot(precedingSibling, " <= "));
			else node.add("position() <= ", parseNumber(arg, name));
			break;
		case "lang":
			str = processLang(name, arg);
			if (str) node.add("{", str, "}");
			break;
		case "range" :
			const splits = arg.split(',');
			if (splits.length !== 2) argumentException(pseudo + name + "(,)' is required two numbers");
			const start = parseNumber(splits[0], name);
			const end = parseNumber(splits[1], name);
			if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");
			if (not) {
				str = addCount(precedingSibling, "*", { count: start - 1, comparison: " >= " }) + " and ";
				str += addCount(precedingSibling, "*", { count: end - 1, comparison: " <= " });
				node.add(str);
			} else {
				node.add("position() >= ", start, " and position() <= ", end);
			}
			break;
		case "target" :
			node.add("starts-with(@href, '#')");
			break;
		case "disabled" :
			node.add("@disabled");
			break;
		case "enabled" :
			node.add("not(@disabled)");
			break;
		case "selected" :
			node.add(localName, " = 'option' and @selected");
			break;
		case "checked" :
			node.add("(", localName, " = 'input' and (@type='checkbox' or @type='radio') or ", localName, " = 'option') and @checked");
			break;
		default :
			parseException(pseudo + name + "' is not implemented");
			break;
	}
	function process(axis) {
		const nd = node.clone();
		let result = convertArgument(nd, arg, axis, null, { name: name });
		if (nd.hasAxis(ancestor)) {
			result = transform(nd, axis);
		}
		node.add(result);
	}
	function getNot(sibling, comparison) {
		return addCount(sibling, "*", { count: parseNumber(arg, name) - 1, comparison });
	}
	function normalizeArg(arg) {
		const text = normalizeString(arg, name);
		return opt.translate ? translateToLower(text) : text;
	}
}
function processLang(name, arg) {
	const lang = translateToLower("@lang", true),
		array = arg.split(',');
	let result = "";
	for (let i = 0; i <array.length; i++) {
		if (i > 0) result += " or ";
		result += "ancestor-or-self::*[@lang][1][";
		const rm = /^([a-z]+\b|\*)(?:-([a-z]+\b|\*))?(?:-([^-]+))?/i.exec(getStringContent(array[i].trim()));
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
				const val = normalize(rm[1] + "-");
				if(isText(rm[3])) {
					result += "starts-with(" + lang + ", " + val + ") and (" + containOrEnd(rm[3]) + ")";
				} else {
					result += equalOrStart(rm[1]);
				}
			} else {
				const text = rm[1] + (rm[2] ? "-" + rm[2] : "") + (isText(rm[3]) ? "-" + rm[3] : "");
				result += equalOrStart(text);
			}
			result +=  "]";
		} else {
			argumentException(pseudo + name + "()' has wrong argument(s)");
		}
	}
	function isText(gr) {
		return gr && gr !== "*";
	}
	function equalOrStart(text) {
		const val = normalize(text);
		return lang + " = " + val + " or starts-with(" + lang + ", concat(" + val + ", '-'))";
	}
	function containOrEnd(text) {
		const val = normalize("-" + text + "-");
		const val2 = normalize("-" + text);
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
	let result = '';
	node.childNodes.forEach(unitNode => {
		if (unitNode.childNodes) {
			let str = '',
				end = '',
				hit = false;
			for (let r = unitNode.childNodes.length - 1; r >= 0; r--) {
				const nd = unitNode.childNodes[r];
				if ( !hit) {
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
	let result = '';
	node.childNodes.forEach(unitNode => {
		if (unitNode.hasAxis(ancestor)) {
			let str = '';
			const last = unitNode.childNodes.length - 1;
			unitNode.childNodes.forEach((nd, i) => {
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
	let ofResult,
		owner = '*',
		str = '';
	if (name === "nth-child" || name === "nth-last-child") {
		const obj = checkOfSelector(name, arg, node);
		if (obj) {
			arg = obj.arg;
			owner = obj.owner;
			ofResult = obj.ofResult;
			if ( !ofResult) node.owner = owner;
		}
	}
	arg = arg.replace(/\s+/g, '');
	if ( !checkValidity(arg, info, name)) {
		return;
	}
	switch (name) {
		case "nth-child" :
			str = addNthToXpath(name, arg, precedingSibling, owner, false);
			break;
		case "nth-last-child" :
			str = addNthToXpath(name, arg, followingSibling, owner, true);
			break;
		case "nth-of-type" :
			owner = getOwner(node, name);
			str = addNthToXpath(name, arg, precedingSibling, owner, false);
			break;
		case "nth-last-of-type" :
			owner = getOwner(node, name);
			str = addNthToXpath(name, arg, followingSibling, owner, true);
			break;
		default :
			parseException(pseudo + name + "' is not implemented");
			break;
	}
	if (ofResult) node.add(ofResult, true);
	if (str) node.add(str);
}
function addNthToXpath(name, arg, sibling, owner, last) {
	let str = '';
	if (/^\d+$/.test(arg)) {
		const num = parseInt(arg);
		str = addCount(sibling, owner, { count: num - 1, comparison: " = " });
	} else if (arg === "odd") {
		str = addModulo(sibling, owner, ' + 1', 2, 1);
	} else if (arg === "even") {
		str = addModulo(sibling, owner, ' + 1', 2, 0);
	} else {
		const obj = parseFnNotation(arg, last);
		if (obj.valueA) {
			const num = getNumber(obj.valueB);
			if (obj.type === 'mod') str = addModulo(sibling, owner, num, obj.valueA, 0);
			else if (obj.type === 'cnt') str = addCount(sibling, owner, obj);
			else if (obj.type === 'both') {
				str = addCount(sibling, owner, obj) + " and " + addModulo(sibling, owner, num, obj.valueA, 0);
			}
		} else {
			str = addCount(sibling, owner, obj);
		}
	}
	return str;
}
function parseFnNotation(arg, last) {
	const rm = nthEquationReg.exec(arg);
	if (rm !== null) {
		const minus = rm[1] === '-',
			valueA = getValue(rm[1], rm[2], 1),
			valueB = getValue(rm[3], rm[4], 0),
			absA = Math.abs(valueA);
		let count = valueB - 1,
			comparison = last ? ' = ' : (absA === 0 ? " = " : minus ? " <= " : " >= "),
			type = 'none';
		if (last) {
			if (minus) {
				if (rm[2] == null || absA >= valueB) comparison = " <= ";
				else if (absA !== 0 || valueB < 2) {
					comparison = " < ";
					count++;
				}
			} else if (absA !== 0) comparison = " >= ";
		}
		if (valueA === 0) type = 'cnt';
		else if ( !minus && valueB === 1) {
			if (absA > 1) type = 'mod';
		} else if (valueB > 0) {
			if (absA > 1) type = 'both';
			else type = 'cnt';
		} else if (absA > 1) {
			type = 'mod';
		}
		return { valueA: absA, valueB, count, comparison, type };
	}
	regexException(0, "parseFnNotation", nthEquationReg, arg);
}
function addModulo(sibling, owner, num, mod, eq) {
	return `(count(${sibling}${owner})${num}) mod ${mod} = ${eq}`;
}
function addCount(sibling, owner, obj) {
	if (obj.count === 0 && /^<?=$/.test(obj.comparison.trim())) {
		return notSibling(sibling, owner);
	} else {
		return `count(${sibling}${owner})${obj.comparison}${obj.count}`;
	}
}
function notSibling(sibling, owner) {
	return `not(${sibling}${owner || "*"})`;
}
function getNumber(val) {
	const num = 1 - val;
	return num === 0 ? '' : (num < 0 ? ' - ' : ' + ') + Math.abs(num);
}
function getValue(sign, num, defaultVal) {
	const minus = sign && sign === '-' ? '-' : '';
	return num != null ? +(minus + num) : defaultVal;
}
function checkValidity(arg, info, name) {
	const not = info && info.name === 'not',
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
	let ofResult,
		owner = '*';
	const ofReg = / +of +(.+)$/,
		rm = ofReg.exec(arg);
	if (rm !== null) {
		const nd = node.clone();
		ofResult = convertArgument(nd, rm[1], "self::", "node()", { predicate: true, name: name });
		let result = '';
		nd.childNodes.forEach((unitNode) => {
			const str = unitNode.toString();
			if (unitNode.childNodes) {
				const firstChild = unitNode.childNodes[0];
				if (firstChild.owner === "node()") {
					firstChild.axis = '';
					firstChild.owner = '';
					result += "\x01" +unitNode.toString() + "\x02";
				} else {
					result +=str;
				}
			} else {
				result +=str;
			}
		});
		if (result !== ofResult) ofResult = result;
		owner += "[" + ofResult + "]";
		return { arg: arg.replace(ofReg, ''), owner, ofResult };
	}
	return null;
}
function toLower(str) {
	str = str ? normalizeQuotes(str) : "normalize-space()";
	return opt.translate ? translateToLower(str) : str;
}
function translateToLower(str, asii) {
	const letters = 'abcdefghjiklmnopqrstuvwxyz';
	return "translate(" + str + ", '" + letters.toUpperCase() + (asii ? "" : uppercase) + "', '" + letters + (asii ? "" : lowercase) + "')";
}
function normalizeString(str, name) {
	if ( !str) {
		argumentException(pseudo + name + "' has missing argument");
	}
	str = normalizeQuotes(str, name);
	return "normalize-space(" + str + ")";
}
function normalizeQuotes(text, name) {
	text = text.replace(/\\(?=.)/g, '');
	if (text.includes("'")) {
		if ( !text.includes("\"")) return '"' + text + '"';
		argumentException((name ? pseudo + name + "' string argument" : 'string') + " contains both '\"' and '\'' quotes");
	}
	return '\'' + text + '\'';
}
function parseNumber(str, name) {
	const num = parseInt(str);
	if (Number.isInteger(num)) return num;
	const msg = !str ? "' has missing argument" : "' argument '" + str + "' is not an integer";
	argumentException(pseudo + name + msg);
}
function parseTagName(i, node) {
	tagNameReg.lastIndex = i;
	const rm = tagNameReg.exec(code);
	if (rm !== null) {
		const owner = rm[0].replace("|", ":").toLowerCase();
		if (node.owner === "*:") node.owner += owner;
		else node.owner = owner;
		return i + rm[0].length - 1;
	}
	regexException(i, 'parseTagName', tagNameReg);
}
function parseClassValue(i) {
	classIdReg.lastIndex = i;
	const rm = classIdReg.exec(code);
	if (rm !== null) {
		return [i + rm[0].length - 1, rm[0].replace(/^\\00003(?=\d+)/, '')];
	}
	regexException(i, 'parseClassValue', classIdReg);
}
function parsePseudoClass(i) {
	pseudoClassReg.lastIndex = i;
	const rm = pseudoClassReg.exec(code);
	if (rm !== null) {
		const name = rm[1];
		if (rm[2] != null) {
			const obj = parseArgument(i + rm[0].length - 1, code, name === "lang", "(", ")");
			if (obj) {
				return [obj.index, name, obj.content];
			}
		}
		return [i + rm[0].length - 1, name, ''];
	}
	regexException(i, 'parsePseudoClass', pseudoClassReg);
}
function getOwner(node, name) {
	const owner = node.owner !== "node()" ? node.owner : node.parentNode.parentNode.owner;
	if (name && owner == "*") parseException(pseudo + name + "' is required an element name; '*' is not implemented.");
	return owner;
}
function parseAttributeName(i) {
	attrNameReg.lastIndex = i;
	const rm = attrNameReg.exec(code);
	if (rm !== null) {
		const name = rm[0].toLowerCase();
		return [i + rm[0].length - 1, name];
	}
	regexException(i, 'parseAttributeName', attrNameReg);
}
function parseAttributeValue(i) {
	attrValueReg.lastIndex = i;
	const rm = attrValueReg.exec(code);
	if (rm !== null) {
		let value, modifier;
		if (rm[1] != null) value = rm[1];
		else if (rm[2] != null) value = rm[2];
		else value = rm[3];
		if (rm[4] != null) modifier = rm[4].toLowerCase();
		return [i + rm[0].length - 1, value, modifier];
	}
	regexException(i, "parseAttributeValue", attrValueReg);
}
function normalizeWhiteSpaces(text) {
	const leftChars = ",>+=~^!:([";
	const rightChars = ",>+=~^!$]()";
	code = text;
	length = code.length;
	let addSpace = false,
		unresolved = false;
	let prev_ch = '\0';
	const sb = [];
	for (let i = 0; i < length; i++) {
		const ch = code[i];
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
			const k = findEnd(i, ch, true);
			if (k === -1) sb.push("/*");
			else i = k;
		} else if (ch === '"' || ch === '\'') {
			const k = findEnd(i, ch, false);
			if (k !== -1) {
				sb.push(code.substring(i, k + 1));
				i = k;
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
	let first = true, start = i, n = 0;
	for (; i < text.length; i++) {
		const ch = text[i];
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
			if (ch === open) n++;
			else if (ch === close && --n === 0) {
				const str = text.substring(start, i);
				return { index: i, content: original ? str : getStringContent(str) };
			}
		}
	}
	return null;
}
function getStringContent(text) {
	let len = text.length;
	if (len > 1) {
		const start = text[0], end = text[len - 1];
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
	if ( !opt.consoleUse && !warning.includes(text)) {
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
	throw new ParserError(code, (position + 1), message);
}
function argumentException(message) {
	printError(message);
	throw new ParserError(code, "?", message);
}
function characterException(i, ch, message, code) {
	const str = "Unexpected character '",
		text = (opt.debug ? message + ". " : "") + str + "<b>" + ch + "</b>'\nposition <b>" + (i + 1) + "</b>\nstring - '<b>" + code + "</b>'";
	printError(text);
	throw new ParserError(code, (i + 1), message + str + ch + "'");
}
function regexException(i, fn, reg, arg) {
	const str = arg || code.substr(i),
		msg = " failed to match the string: ";
	let text = '';
	if (opt.debug) {
		text = `function - <b>${fn}()</b>\nRegExp${msg}'<b>${str}</b>'\nRegExp - '<b>${reg}</b>'`;
	} else {
		text = `Error of ${fn.replace(/\B([A-Z])/g, (m, gr) => ' ' + gr.toLowerCase()).replace('parse', 'parsing')}\nString: '<b>${str}</b>'`;
	}
	printError(text);
	const message = `function ${fn}() - RegExp '${reg}'${msg}'${str}'`;
	throw new ParserError(code, (i + 1), message);
}

export { toXPath as default };
