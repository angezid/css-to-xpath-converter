
import xNode from "../src/xnode";
import ParserError from "../src/parser-error";

'use strict';

const tagNameReg = /(?:[a-zA-Z]+\|)?(?:[a-zA-Z][^ -,.\/:-@[-^`{-~]*)|(?:[a-zA-Z]+\|*)/y;

const classIdReg = /(?:^\\00003\d+)?(?:\\[^ ]|[^\t-,.\/:-@[-^`{-~])+/y;

const pseudoClassReg = /((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))/y;

const nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;

const attributeReg = /(?:(?:\*|[a-zA-Z]+)\|)?(?:\*|[^ -,.\/:-@[-^`{-~]+)/y;

const attrNameReg = /(?:[a-zA-Z]+\|)?[^ -,.\/:-@[-^`{-~]+(?=(?:[~^|$!*]?=)|\])/y;    // \*| is unnecessary

const attrValueReg = /(?:"([^"]*)"|'([^']*)'|((?:\\[^ ]|[^ "'\]])+))(?: +([siSI]))?(?=\])/y;

const State = Object.freeze({ "Text" : 0, "PseudoClass": 1, "AttributeName": 2, "AttributeValue": 3 });

const pseudo = "Pseudo-class ':";
const navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";

let opt, warning, error, uppercase, lowercase, stack, code, position, length;

export default function toXPath(selector, options) {
	opt = Object.assign({}, {
		axis: './/',
		consoleUse: false,    // to suppress warning message ???
		standard: false,
		removeXPathSpaces: false,
		uppercaseLetters: '',
		lowercaseLetters: '',
		//printError : () => {},
		postprocess: true,    // for debugging purpose
		debug: false
	}, options);

	warning = '';
	error = '';
	stack = [];
	const node = new xNode();
	let xpath;
	let normalized;

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
		return { xpath, css: normalized, warning, error: e.message };
	}

	return { xpath, css: normalized, warning, error: error };
}

function convertArgument(node, selector, axis, owner, argInfo) {
	if ( !selector) {
		argumentException("The pseudo-selector \':" + argInfo.name + '()\' have missing argument.');
	}

	stack.push(code);

	const result = convert(node, selector, axis, owner, argInfo);

	code = stack.pop();
	length = code.length;

	return result;
}

function postprocess(xpath) {
	if (opt.postprocess) {
		// removes unnecessary spaces
		if (opt.removeXPathSpaces) {
			xpath = xpath.replace(/("[^"]+"|'[^']+')|([,<=>|+-]) +| +(?=[<=>|+-])/g, (m, gr, gr2) => gr || gr2 || '');
		}
		// simplifies self::node()[] predicates
		xpath = xpath.replace(/([([]| or )self::node\(\)\[((?:[^'"[\]]|"[^"]*"|'[^']*')+)\](?!\[| *\|)/g, '$1$2');
		// joins predicates by ' and '
		xpath = xpath.replace(/((?:[^'"[\]]|"[^"]*"|'[^']*')+)|\]\[(?![[(])/g, (m, gr) => gr || ' and ');
		// removes unnecessary parentheses
		xpath = xpath.replace(/\[\(((?:[^'"()]|"[^"]*"|'[^']*')+)\)]/g, (m, gr) => '[' + gr + ']');
		// removes unnecessary child:: axis
		xpath = xpath.replace(/\/child::/g, '/');
	}

	// removes curly braces; they were added to prevent joining predicates by ' and '
	xpath = xpath.replace(/((?:[^'"{}]|"[^"]*"|'[^']*')+)|[{}]/g, (m, gr) => gr || '');
	return xpath;
}

function convert(rootNode, selector, axis, owner, argumentInfo) {
	if ( !selector) {
		argumentException("selector is empty or white space");
	}

	let classNode = newNode(rootNode, null);
	let node = newNode(classNode, null);

	const name = argumentInfo ? argumentInfo.name : '';
	const predicate = argumentInfo && argumentInfo.predicate;

	let attrName = null,
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
				case '.' :
					let str = '[';
					do {
						[i, value] = getClassValue(i + 1);
						str += getClass('@class', normalizeQuotes(' ' + value + ' '));

						classIdReg.lastIndex = i + 2;
						if (nextChar(i, '.') && classIdReg.test(code)) {
							str += " and ";

						} else break;
					} while (++i < length);
					node.add(str + "]");
					check = false;
					break;

				case '#' :
					[i, value] = getClassValue(i + 1);
					node.add("[@id=", normalizeQuotes(value), "]");
					check = false;
					break;

				case '>' :
					node = newNode(classNode, node, "child::", "/");
					check = true;
					break;

				case '+' :
					node = addTwoNodes(classNode, node, "following-sibling::", "*", "[1]", "self::");
					check = true;
					break;

				case '~' :
					node = newNode(classNode, node, "following-sibling::", "/");
					check = true;
					break;

				case '^' :    // first child
					node = addTwoNodes(classNode, node, "child::", "*", "[1]", "self::");
					check = true;
					break;
				case '!' :
					if (nextChar(i, '^')) {    // last child
						node = addTwoNodes(classNode, node, "child::", "*", "[last()]", "self::");
						i++;

					} else if (nextChar(i, '+')) {    // adjacent preceding sibling
						node = addTwoNodes(classNode, node, "preceding-sibling::", "*", "[1]", "self::");
						i++;

					} else if (nextChar(i, '>')) {    // direct parent
						node = newNode(classNode, node, "parent::", "/");
						i++;

					} else if (nextChar(i, '~')) {    // preceding sibling
						node = newNode(classNode, node, "preceding-sibling::", "/");
						i++;

					} else {
						node = newNode(classNode, node, "ancestor-or-self::", "/");    // ancestors
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
					if (nextChar(i, ':')) i++;
					state = State.PseudoClass;
					break;

				case ',' :
					if (i + 1 >= length) characterException(i, ch, getState(state), code);

					classNode = newNode(rootNode, classNode);
					classNode.add(predicate ? " or " : " | ");

					classNode = newNode(rootNode, classNode);
					node = newNode(classNode, null, argumentInfo ? "" : axis);
					check = true;
					break;

				case '@' :
					[i, node] = parseAttribute(i, axis, argumentInfo, classNode, node);
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
							node = newNode(classNode, node, 'ancestor::', " and ");

						} else if (name === 'has-parent' || name === 'before' || name === 'after' || name.endsWith('-sibling')) {
							if ( !node.previousNode) {
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

				case '|' :
					if (nextChar(i, '|')) {
						characterException(i + 1, ch, getState(state), code);

					} else {
						[i, node] = handleNamespace(i, axis, first, classNode, node);
					}
					check = false;
					break;

				case '\\' :    //??
					i++;
					break;

				default :
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
						characterException(i, ch, getState(state), code);
					}
					break;

				case ']' :
					if ( !attrName) parseException("attrName is null or empty.'");

					node.add("[@" + attrName + "]");
					state = State.Text;
					check = false;
					break;

				case ' ' : break;

				default :
					[i, value] = getAttributeName(i);
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
					characterException(i, ch, getState(state), code);
					break;

				case ' ' : break;

				default :
					if (attrValue) {
						parseException("attrValue '" + attrValue + "' is already parse: " + code.substring(i));
					}

					[i, attrValue, modifier] = getAttributeValue(i);
					break;
			}

		} else if (state === State.PseudoClass) {
			let name = '',
				arg = '';

			[i, name, arg] = getPseudoClass(i);

			if (name === "root") {
				node.owner = node.separator = '';
				node.axis = '//';

				node = newNode(classNode, node, "ancestor-or-self::");
				node.owner = "*";
				node.add("[last()]");

			} else {
				addOwner(owner, node);

				if (name.startsWith("nth-")) {
					const not = argumentInfo && argumentInfo.name === 'not';
					node = processNth(name, arg, not, classNode, node);

				} else {
					processPseudoClass(name, arg, node);
				}
			}

			state = State.Text;
			check = false;
		}
	}

	let result = rootNode.toString();

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
	const nd = new xNode(parNode);
	parNode.addChild(nd);
	nd.previousNode = node;
	nd.axis = axis || '';

	if (separator && node.owner) nd.separator = separator;

	return nd;
}

function addTwoNodes(parNode, node, axis, owner, content, axis2) {
	const nd = newNode(parNode, node, axis, "/");
	nd.owner = owner;
	nd.add(content);

	return newNode(parNode, nd, axis2, "/");
}

function addAxes(axis, node, argumentInfo) {
	if ( !axis || node.axis || axis === "self::" && !argumentInfo) return;

	const text = node.parentNode.toString().trim(),
		len = text.length;

	if (len == 0 || / (?:or|\|)$/.test(text)) {
		node.axis = axis;

	} else {
		const ch = text[len - 1];

		if (ch == ':' || ch == '|') {
			node.axis = axis;
		}
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
			if (/(?: or|\|)$/.test(text)) {
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

function handleNamespace(i, axis, first, parNode, node) {
	if (node.owner == "*") {
		if (nextChar(i, '*')) {
			node.owner = "*:*"
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
				node.add("[not(contains(name(), ':'))]");

			} else {
				node.owner += ":*";
			}
			i++;

		} else if (i + 1 < length && /[a-zA-Z]/.test(code[i + 1])) {
			let nd = newNode(parNode, node, "self::", "/");
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
	const text = node.parentNode.toString().trim();

	if (text.length === 0) {
		if (argumentInfo) axis = "";

	} else if (/ (?:or|\|)$/.test(text)) {
		axis = "";

	} else {
		const ch = text[text.length - 1];
		if (ch !== ':' && ch !== '/') axis = "/";
		else axis = "";
	}

	attributeReg.lastIndex = i + 1;
	const rm = attributeReg.exec(code);

	if (rm !== null) {
		const nd = newNode(parNode, node, axis);
		nd.add("@", rm[0].replace('|', ':').toLowerCase());
		return [i + rm[0].length, nd];
	}
	regexException(i, 'parseAttribute', attributeReg);
}

function processAttribute(attrName, attrValue, operation, modifier, node) {
	if ( !attrValue.trim()) {
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

	const ignoreCase = modifier === "i" || attrName === 'lang' || attrName === 'type' && getOwner(node) == "input";

	if ( !opt.standard && attrName === "class") {
		processClass(attrValue, operation, ignoreCase, node);
		return;
	}

	const lowerCaseValue = ignoreCase ? translateToLower("@" + attrName) : null;
	const value = normalizeQuotes(attrValue);

	switch (operation) {
		case "=" :
			if (ignoreCase) {    // equals
				node.add("[", lowerCaseValue, " = ", toLower(attrValue), "]");

			} else {
				node.add("[@", attrName, "=", value, "]");
			}
			break;

		case "!=" :
			if (ignoreCase) {    // not have or not equals
				node.add("{[not(@", attrName, ") or ", lowerCaseValue, "!=", toLower(attrValue), "]}");

			} else {
				node.add("{[not(@", attrName, ") or @", attrName, "!=", value, "]}");
			}
			break;

		case "~=" :    // exactly contains
			if (ignoreCase) {
				node.add("[contains(concat(' ', normalize-space(", lowerCaseValue, "), ' '), concat(' ', normalize-space(", toLower(attrValue), "), ' '))]");

			} else {
				node.add("[contains(concat(' ', normalize-space(@", attrName, "), ' '), concat(' ', normalize-space(", value, "), ' '))]");
			}
			break;

		case "|=" :    // equals or starts with immediately followed by a hyphen
			if (ignoreCase) {
				node.add("{[", lowerCaseValue, " = ", toLower(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLower(attrValue), ", '-'))]}");

			} else {
				node.add("{[@", attrName, " = ", value, " or starts-with(@", attrName, ", ", normalizeQuotes(attrValue + '-'), ")]}");
			}
			break;

		case "^=" :    //starts with
			if (ignoreCase) {
				node.add("[starts-with(", lowerCaseValue, ", ", toLower(attrValue), ")]");

			} else {
				node.add("[starts-with(@", attrName, ", ", value, ")]");
			}
			break;

		case "$=" :    //ends with
			if (ignoreCase) {
				node.add("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", toLower(attrValue), "]");

			} else {
				node.add("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", value, "]");
			}
			break;

		case "*=" :    // contains within the string.
			if (ignoreCase) {
				node.add("[contains(", lowerCaseValue, ", ", toLower(attrValue), ")]");

			} else {
				node.add("[contains(@", attrName, ", ", value, ")]");
			}
			break;

		default : break;
	}
}

function processClass(attrValue, operation, ignoreCase, node) {
	const attrName = ignoreCase ? translateToLower("@class") : "@class";
	let attributeValue = attrValue.trim();

	switch (operation) {
		case "=" :    // equals
		case "~=" :    // exactly contains
		case "!=" :    //not equals
			attributeValue = " " + attributeValue + " ";
			break;

		case "^=" :    //starts with
			attributeValue = " " + attributeValue;
			break;

		case "$=" :    //ends with
			attributeValue += " ";
			break;

		default : break;
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
		const attrValue1 = ignoreCase ? toLower(' ' + attrValue + ' ') : normalizeQuotes(' ' + attrValue + ' ');
		const attrValue2 = ignoreCase ? toLower(' ' + attrValue + '-') : normalizeQuotes(' ' + attrValue + '-');

		node.add("{[", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "]}");

	} else {
		node.add("[", getClass(attrName, attributeValue), "]");
	}
}

function getClass(attrName, attributeValue) {
	return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;
}

function processPseudoClass(name, arg, node) {
	let nd, result, owner, str2, str = '', localName = 'local-name()';

	switch (name) {
		case "any-link" :
			node.add("[(", localName, " = 'a' or ", localName, " = 'area') and @href]");
			break;

		case "external" :
			node.add("{[(", localName, " = 'a' or ", localName, " = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://'))]}");
			break;

		case "contains" :
			node.add("[contains(normalize-space(), ", normalizeArg(arg, name), ")]");
			break;

		case "icontains" :
			node.add("[contains(", toLower(), ", ", translateToLower(normalizeArg(arg, name)), ")]");
			break;

		case "empty" :
			str = "[not(*) and not(text())]";
			break;

		case "first-child" :
			str = "[not(preceding-sibling::*)]";
			break;

		case "first" :
			str = arg ? "[position() <= " + parseNumber(arg) + "]" : "[1]";
			break;

		case "first-of-type" :
			owner = getOwner(node, name);
			node.add("[not(preceding-sibling::", owner, ")]");
			break;

		case "gt" :
			node.add("[position() > ", parseNumber(arg), "]");
			break;

		case "lt" :
			node.add("[position() < ", parseNumber(arg), "]");
			break;

		case "eq" :
		case "nth" :
			node.add("[", parseNumber(arg), "]");
			break;

		case "last-child" :
			str = "[not(following-sibling::*)]";
			break;

		case "only-child" :
			str = "[not(preceding-sibling::*) and not(following-sibling::*)]";
			break;

		case "only-of-type" :
			owner = getOwner(node, name);
			node.add("[not(preceding-sibling::", owner, ") and not(following-sibling::", owner, ")]");
			break;

		case "text" :
			str = "[@type='text']";
			break;

		case "starts-with" :
			node.add("[starts-with(normalize-space(), ", normalizeArg(arg, name), ")]");
			break;

		case "istarts-with" :
			node.add("[starts-with(", toLower(), ", ", translateToLower(normalizeArg(arg, name)), ")]");
			break;

		case "ends-with" :
			str2 = normalizeArg(arg, name);
			node.add("[substring(normalize-space(), string-length(normalize-space()) - string-length(", str2, ") + 1) = ", str2, "]");
			break;

		case "iends-with" :
			str2 = normalizeArg(arg, name);
			node.add("[substring(", toLower(), ", string-length(normalize-space()) - string-length(", str2, ") + 1) = ", translateToLower(str2), "]");
			break;

		case "is" :
		case "matches" :
			nd = node.clone();
			result = convertArgument(nd, arg, "self::", "self::node()", { predicate: true, name: name });
			addToNode(nd, "[" + result + "]");
			break;

		case "not" :
			nd = node.clone();
			result = convertArgument(nd, arg, "self::", "self::node()", { name: name });

			if (result !== "self::node()") {    // processNth() can return 'self::node()'
				if (nd.hasAxis('ancestor::')) {
					result = transform(nd);
				}
				addToNode(nd, "[not(" + result + ")]");
			}
			break;

		case "has" :
			nd = node.clone();
			result = convertArgument(nd, arg, ".//", "", { name: name });
			addToNode(nd, "[" + result + "]");
			break;

		case "has-sibling" :
			nd = node.clone();
			let precedings = convertArgument(nd, arg, "preceding-sibling::", "", { name: name });
			if (nd.hasAxis('ancestor::')) {
				precedings = transform(nd, "preceding-sibling::");
			}

			nd = node.clone();
			let followings = convertArgument(nd, arg, "following-sibling::", "", { name: name });
			if (nd.hasAxis('ancestor::')) {
				followings = transform(nd, "following-sibling::");
			}
			node.add("{[(", precedings, ") or (", followings, ")]}");
			break;

		case "has-parent" :
			process("parent::");
			break;

		case "has-ancestor" :
			nd = node.clone();
			result = convertArgument(nd, arg, "ancestor::", "", { name: name });
			addToNode(nd, "[" + result + "]");
			break;

		case "after" :
			process("preceding::");
			break;

		case "after-sibling" :
			process("preceding-sibling::");
			break;

		case "before" :
			process("following::");
			break;

		case "before-sibling" :
			process("following-sibling::");
			break;

		case "last" :
			str = arg ? "[position() > last() - " + parseNumber(arg) + "]" : "[last()]";
			break;

		case "last-of-type" :
			owner = getOwner(node, name);
			node.add("[not(following-sibling::", owner, ")]");
			break;

		case "skip" :
			node.add("[position() > ", parseNumber(arg), "]");
			break;

		case "skip-first" :
			node.add("[position() > ", arg ? parseNumber(arg) : "1", "]");
			break;

		case "skip-last" :
			node.add("[position() < last()", arg ? " - (" + parseNumber(arg) + " - 1)" : "", "]");
			break;

		case "limit" :
			node.add("[position() <= ", parseNumber(arg), "]");
			break;

		case "range" :
			const splits = arg.split(',');

			if (splits.length !== 2) argumentException(pseudo + name + "(,)' requires two numbers");

			const start = parseNumber(splits[0]);
			const end = parseNumber(splits[1]);

			if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");

			node.add("[position() >= ", start, " and position() <= ", end, "]");
			break;

		case "target" :
			str = "[starts-with(@href, '#')]";
			break;

		case "disabled" :
			str = "[@disabled]";
			break;

		case "enabled" :
			str = "[not(@disabled)]";
			break;

		case "selected" :
			node.add("[", localName, " = 'option' and @selected]");
			break;

		case "checked" :
			node.add("[(", localName, " = 'input' and (@type='checkbox' or @type='radio') or ", localName, " = 'option') and @checked]");
			break;

		default :
			parseException(pseudo + name + "' is not implemented");
			break;
	}

	if (str) node.add(str);

	function process(axis) {
		const nd = node.clone();
		let result = convertArgument(nd, arg, axis, "", { name: name });

		if (nd.hasAxis('ancestor::')) {
			result = transform(nd, axis);
		}
		addToNode(nd, "[" + result + "]");
	}

	function addToNode(nd, result) {
		// prevents joining predicates by ' and ' in postprocess()
		node.add(nd.hasOr() ? "{" + result + "}" : result);
	}
}

function transform(node, axis) {
	let result = '';

	node.childNodes.forEach(classNode => {
		if (classNode.hasAxis('ancestor::')) {
			let str = '';
			const last = classNode.childNodes.length - 1;

			classNode.childNodes.forEach((nd, i) => {
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

	let ofResult,
		owner = '*';

	if (name === "nth-child" || name === "nth-last-child") {
		const obj = checkOfSelector(name, arg, node);
		if (obj) {
			arg = obj.arg;
			owner = obj.owner;
			ofResult = obj.ofResult;
		}
	}

	arg = arg.replace(/\s+/g, '');

	if ( !checkValidity(arg, not, name)) {
		return node;
	}

	let str = '',
		child = false,
		usePosition = false;

	switch (name) {
		case "nth-child" :
			child = true;
			usePosition = !not;
			str = addNthToXpath(name, arg, 'preceding', owner, false, usePosition);
			break;

		case "nth-last-child" :
			str = addNthToXpath(name, arg, 'following', owner, true, usePosition);
			break;

		case "nth-of-type" :
			owner = getOwner(node, name);
			str = addNthToXpath(name, arg, 'preceding', owner, false, usePosition);
			break;

		case "nth-last-of-type" :
			owner = getOwner(node, name);
			str = addNthToXpath(name, arg, 'following', owner, true, usePosition);
			break;

		default :
			parseException(pseudo + name + "' is not implemented");
			break;
	}

	if ( !str) {
		if (ofResult) {
			node.add(ofResult);
		}
		return node;
	}

	if (usePosition && child) {
		const newNodeOwner = node.owner && node.owner !== "self::node()" ? node.owner : "*";
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
	let str = '';

	if (/^\d+$/.test(arg)) {
		const num = parseInt(arg);
		str = addPosition(sibling, owner, { valueB: num, count: num - 1, comparison: " = " }, usePosition);

	} else if (arg === "odd") {
		str = addModulo(sibling, owner, ' + 1', 2, 1);

	} else if (arg === "even") {
		str = addModulo(sibling, owner, ' + 1', 2, 0);

	} else {
		const obj = parseFnNotation(arg, last);

		if (obj.valueA) {
			const num = getNumber(obj.valueB);

			if (obj.type === 'mod') str = addModulo(sibling, owner, num, obj.valueA, 0);
			else if (obj.type === 'pos') str = addPosition(sibling, owner, obj, usePosition);
			else if (obj.type === 'both') {
				str = addPosition(sibling, owner, obj, usePosition) + addModulo(sibling, owner, num, obj.valueA, 0);
				str = str.replace('][', ' and ');
			}

		} else {
			str = addPosition(sibling, owner, obj, usePosition);
		}
	}
	return str;
}

function parseFnNotation(arg, last) {
	const rm = nthEquationReg.exec(arg);    // an+b-1  /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/
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

		if (valueA === 0) type = 'pos';
		else if ( !minus && valueB === 1) {
			if (absA > 1) type = 'mod';

		} else if (valueB > 0) {
			if (absA > 1) type = 'both';
			else type = 'pos';

		} else if (absA > 1) {
			type = 'mod';
		}

		return { valueA: absA, valueB, count, comparison, type };
	}
	regexException(0, "parseFnNotation", nthEquationReg, arg);
}

function addModulo(sibling, owner, num, mod, eq) {
	return `[(count(${sibling}-sibling::${owner})${num}) mod ${mod} = ${eq}]`;
}

function addPosition(sibling, owner, obj, usePosition) {
	if (usePosition) {
		return `[position()${obj.comparison}${obj.valueB}]`;

	} else if (obj.count === 0 && /^<?=$/.test(obj.comparison.trim())) {
		return `[not(${sibling}-sibling::${owner})]`;

	} else {
		return `[count(${sibling}-sibling::${owner})${obj.comparison}${obj.count}]`;
	}
}

function getNumber(val) {
	const num = 1 - val;
	return num === 0 ? '' : (num < 0 ? ' - ' : ' + ') + Math.abs(num);
}

function getValue(sign, num, defaultVal) {
	const minus = sign && sign === '-' ? '-' : '';
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
	let ofResult,
		owner = '*';
	const ofReg = / +of +(.+)$/,
		rm = ofReg.exec(arg);

	if (rm !== null) {
		const nd = node.clone();
		ofResult = convertArgument(nd, rm[1], '', "self::node()", { predicate: true, name: name });

		if (nd.childNodes.length === 1) {
			const classNode = nd.childNodes[0],
				firstChild = classNode.childNodes[0];

			if (firstChild.owner === "self::node()") {
				firstChild.owner = '';
				const result = "{" + classNode.toString() + "}";

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
		return { arg: arg.replace(ofReg, ''), owner, ofResult };
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
	if ( !str) {
		argumentException(pseudo + name + " has an empty argument.");
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

function parseNumber(str) {
	const num = parseInt(str);
	if (Number.isInteger(num)) return num;

	argumentException("argument '" + str + "' is not an integer");
}

function getTagName(i, node) {
	tagNameReg.lastIndex = i;
	const rm = tagNameReg.exec(code);

	if (rm !== null) {
		const owner = rm[0].replace("|", ":").toLowerCase();

		if (node.owner === "*:") node.owner += owner;    // with namespace
		else node.owner = owner;

		return i + rm[0].length - 1;
	}
	regexException(i, 'getTagName', tagNameReg);
}

function getClassValue(i) {    // (?:^\\00003\d+)?(?:\\[^ ]|[^\t-,.\/:-@[-^`{-~])+
	classIdReg.lastIndex = i;
	const rm = classIdReg.exec(code);

	if (rm !== null) {
		return [i + rm[0].length - 1, rm[0].replace(/^\\00003(?=\d+)/, '')];
	}
	regexException(i, 'getClassValue', classIdReg);
}

function getPseudoClass(i) {
	pseudoClassReg.lastIndex = i;
	const rm = pseudoClassReg.exec(code);    // /((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))/y;

	if (rm !== null) {
		const name = rm[1];

		if (rm[2] != null) {
			const obj = getArgument(i + rm[0].length - 1, code, '(', ')');
			if (obj) {
				return [obj.index, name, obj.content];
			}
		}
		return [i + rm[0].length - 1, name, ''];
	}
	regexException(i, 'getPseudoClass', pseudoClassReg);
}

function getOwner(node, name) {
	const owner = node.owner !== "self::node()" ? node.owner : node.parentNode.parentNode.owner;

	if (name && owner == "*") parseException(pseudo + name + "' is required an element name; '*' is not implemented.");
	return owner;
}

function getAttributeName(i) {
	attrNameReg.lastIndex = i;
	const rm = attrNameReg.exec(code);

	if (rm !== null) {
		const name = rm[0].toLowerCase();
		return [i + rm[0].length - 1, name];
	}
	regexException(i, 'getAttributeName', attrNameReg);
}

function getAttributeValue(i) {
	attrValueReg.lastIndex = i;
	const rm = attrValueReg.exec(code);

	if (rm !== null) {
		let value, modifier;

		if (rm[1] != null) value = rm[1];    // double quotes
		else if (rm[2] != null) value = rm[2];    // single quotes
		else value = rm[3];    // without quotes

		if (rm[4] != null) modifier = rm[4].toLowerCase();

		return [i + rm[0].length - 1, value, modifier];
	}
	regexException(i, "getAttributeValue", attrValueReg);
}

// Normalizes white spaces of the CSS selector by removing unnecessarily ones;
// it also removes comments
function normalizeWhiteSpaces(text) {
	const leftChars = ",>+=~^!:([";
	const rightChars = ",>+=~^!$]()";

	code = text;
	length = code.length;

	let addSpace = false,
		escape = false,
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

			sb.push(ch);
			sb.push(code[++i]);

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
				characterException(i, ch, "function normalizeWhiteSpaces()", code);    // non-escaped
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

			if (i >= text.length) characterException(i, ch, "function getArgument()", text);

		} else {
			if (ch === open) n++;
			else if (ch === close && --n === 0) {
				return { index: i, content: getStringContent(text.substring(start, i)) };
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

function isNullOrWhiteSpace(arg) {
	return arg == null || !arg.trim();
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
	const text = message + ". Unexpected character '<b>" + ch + "</b>'\nposition <b>" + (i + 1) + "</b>\nstring - '<b>" + code + "</b>'";
	printError(text);
	message = message + ". Unexpected character '" + ch + "'";
	throw new ParserError(code, (i + 1), message);
}

function regexException(i, fn, reg) {
	const text = "function - <b>" + fn + "()</b>\nError - RegExp failed to match the string:\nstring - '<b>" + code.substring(i) + "</b>'\nRegExp - '<b>" + reg + "</b>'";
	printError(text);
	const message = "function " + fn + "() - RegExp '" + reg + "' failed to match the string '" + code.substring(i) + "'";
	throw new ParserError(code, (i + 1), message);
}

