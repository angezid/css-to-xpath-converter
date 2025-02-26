
/**
* A JavaScript version of C# converter. Author is angezid.
*/

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));

	} else if (typeof exports === 'object') {
		module.exports = factory(root);

	} else {
		root.toXPath = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {
	'use strict';

	const tagNameReg = /(?:[a-zA-Z]+\|)?(?:[a-zA-Z][^ -,.\/:-@[-^`{-~]*)|(?:[a-zA-Z]+\|*)/y;

	const idReg = /[^ ='",*@#.()[\]|:+>~!^$]+/y;

	const classReg = /(?![0-9])[^ -,.\/:-@[-^`{-~]+/y;

	const pseudoClassReg = /((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))/y;

	const nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;

	const attributeReg = /(?:(?:\*|[a-zA-Z]+)\|)?(?:\*|[^ -,.\/:-@[-^`{-~]+)/y;

	const attrNameReg = /(?:[a-zA-Z]+\|)?[^ -,.\/:-@[-^`{-~]+(?=(?:[~^|$!*]?=)|\])/y;    // \*| is unnecessary

	const attrValueReg = /(?:"([^"]+)"|'([^']+)'|([^ "'\]]+))(?: +([siSI]))?(?=\])/y;

	const State = Object.freeze({ "Text" : 0, "PseudoClass" : 1, "AttributeName" : 2, "AttributeValue" : 3 });

	const leftChars = ",>+=~^!:([";
	const rightChars = ",>+=~^!$]()";
	const pseudo = "Pseudo-class ':";
	const navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";

	let opt, warning, error, uppercase, lowercase, stack, code, position, length;

	function xNode(node) {
		this.axis = '';
		this.separator = '';
		this.owner = '';
		this.isClone = false;
		this.prevNode = null;
		this.parentNode = node;
		this.childNodes = [];
		this.content = [];

		this.add = function() {
			let str = '';
			for (let i = 0; i < arguments.length; i++) {
				str += arguments[i];
			}
			this.content.push(str);
		}

		this.hasOr = function() {
			if (this.content.some(str => str === ' or ')) return true;

			for (let i = 0; i < this.childNodes.length; i++) {
				return this.childNodes[i].hasOr();
			}
			return false;
		}

		this.clone = function() {
			const node = new xNode();
			node.owner = this.owner;
			node.isClone = true;
			return node;
		}

		this.toString = function(text = "") {
			if ( !this.isClone) {
				text = this.separator + this.axis + this.owner;

				if (this.content.length) {
					text += this.content.join('');
				}
			}

			this.childNodes.forEach((node) => {
				text += node.toString(text);
			});
			return text;
		}
	}

	function toXPath(selector, options) {
		opt = Object.assign({}, {
			axis : './/',
			consoleUse : false,    // to suppress XPathNavigator warning message
			standard : false,
			removeXPathSpaces : false,
			uppercaseLetters : '',
			lowercaseLetters : '',
			printError : () => {},
			debug : false
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

			if (uppercase.length != lowercase.length) {
				argumentException("Custom upper and lower case letters have different length");
			}

			normalized = normalizeWhiteSpaces(selector);
			xpath = parse(node, normalized, opt.axis, null);
			xpath = postprocess(xpath);

		} catch (e) {
			if (e.parser) {
				if (opt.debug) {
					console.log(e.message, e.code, e.column);
				}

			} else {
				console.log(e);
			}
			return { xpath, css : normalized, warning, error : e.message };
		}

		return { xpath, css : normalized, warning, error : error };
	}

	function parseNested(node, name, selector, axis = "", owner, obj) {
		if ( !selector) {
			argumentException("The pseudo-selector \':" + name + '()\' have missing argument.');
		}

		stack.push(code);

		const result = parse(node, selector, axis, owner, obj || {});

		code = stack.pop();
		length = code.length;

		return result;
	}

	function postprocess(xpath) {
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
		// removes curly braces; they were added to prevent joining predicates by ' and '
		xpath = xpath.replace(/((?:[^'"{}]|"[^"]*"|'[^']*')+)|[{}]/g, (m, gr) => gr || '');
		return xpath;
	}

	function parse(parNode, selector, axis, owner, nested = null) {
		if ( !selector) {
			argumentException("selector is empty or white space");
		}

		let node = new xNode(parNode);
		parNode.childNodes.push(node);

		const predicate = nested && nested.predicate;

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
				if (check && !/[.#*:|[@a-zA-Z]/.test(ch) || !check && !/[ >+~^!,.#*:|[@a-zA-Z]/.test(ch)) {
					characterException(i, ch, "State." + getState(state) + ", check=" + check, code);
				}

				switch (ch) {
					case '.' :
						if (first) addAxes(axis, node);
						addOwner(owner, node);
						let str = '[';
						do {
							[i, value] = getClassValue(i + 1, classReg, node);
							str += getClass('@class', normalizeQuotes(' ' + value + ' '));

							classReg.lastIndex = i + 2;
							if (nextChar(i, '.') && classReg.test(code)) {
								str += " and ";

							} else break;
						} while (++i < length);
						node.add(str + "]");
						check = false;
						break;

					case '#' :
						if (first) addAxes(axis, node);
						addOwner(owner, node);
						[i, value] = getClassValue(i + 1, idReg, node);
						node.add("[@id='", value, "']");
						check = false;
						break;

					case '>' :
						node = newNode(parNode, node, nested ? "child::" : "", true);
						check = true;
						break;

					case '+' :
						node = addTwoNodes(parNode, node, "following-sibling::", "*", "[1]", "self::");
						check = true;
						break;

					case '~' :
						node = newNode(parNode, node, "following-sibling::", true);
						check = true;
						break;

					case '^' :    // first child
						node = addTwoNodes(parNode, node, "child::", "*", "[1]", "self::");
						check = true;
						break;

					case '!' :
						if (nextChar(i, '^')) {    // last child
							node = addTwoNodes(parNode, node, "child::", "*", "[last()]", "self::");
							i++;

						} else if (nextChar(i, '+')) {    // adjacent preceding sibling
							node = addTwoNodes(parNode, node, "preceding-sibling::", "*", "[1]", "self::");
							i++;

						} else if (nextChar(i, '>')) {    // direct parent
							node = newNode(parNode, node, "parent::", true);
							i++;

						} else if (nextChar(i, '~')) {    // preceding sibling
							node = newNode(parNode, node, "preceding-sibling::", true);
							i++;

						} else {
							node = newNode(parNode, node, "ancestor-or-self::", true);    // ancestors
						}
						check = true;
						break;

					case '[' :
						if (first) addAxes(axis, node);
						addOwner(owner, node);
						attrName = '';
						attrValue = null;
						modifier = null;
						operation = null;
						state = State.AttributeName;
						break;

					case ':' :
						if (first) addAxes(axis, node);
						addOwner(owner, node);
						if (nextChar(i, ':')) i++;
						state = State.PseudoClass;
						break;

					case ',' :
						if (i + 1 >= length) characterException(i, ch, "State." + getState(state), code);

						node = newNode(parNode, node, "");
						node.add(predicate ? " or " : " | ");

						node = newNode(parNode, node, nested ? "" : axis);
						check = true;
						break;

					case '@' :
						[i, node] = parseAttribute(i, axis, nested, parNode, node);
						check = false;
						break;

					case '*' :
						if (first) addAxes(axis, node);
						node.owner = "*";
						check = false;
						break;

					case ' ' :
						node = newNode(parNode, node, "//");
						node.isNew = true;
						check = true;
						break;

					case '|' :
						if (nextChar(i, '|')) {
							characterException(i + 1, ch, "State." + getState(state), code);

						} else {
							[i, node] = handleNamespace(i, axis, first, parNode, node);
						}
						check = false;
						break;

					case '\\' :    //??
						i++;
						break;

					default :
						if (/[a-zA-Z]/.test(ch)) {
							if (first || nested) addAxes(axis, node, nested);
							i = getTagName(i, node);

						} else {
							characterException(i, ch, "State." + getState(state), code);
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
							characterException(i, ch, "State." + getState(state), code);
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
						if ( !attrValue) parseException("attrValue is null or empty.'");

						processAttribute(attrName, attrValue, operation, modifier, node);

						state = State.Text;
						check = false;
						break;

					case '=' :
						characterException(i, ch, "State." + getState(state), code);
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
				let pseudoName = '',
					argument = '';

				[i, pseudoName, argument] = getPseudoClass(i);

				if (pseudoName === "root") {
					node.owner = node.separator = '';
					node.axis = '//';

					node = newNode(parNode, node, "ancestor-or-self::", true);
					node.owner = "*";
					node.add("[last()]");

				} else {
					addOwner(owner, node);
					if (pseudoName.startsWith("nth-")) node = processNth(pseudoName, argument, nested, parNode, node);
					else processPseudoClass(pseudoName, argument, node);
				}

				state = State.Text;
				check = false;
			}
		}

		let result = parNode.toString();

		if (check && /(?:\/|::)$/.test(result)) {
			return result + '*';
		}

		if (check || state != State.Text) {
			parseException("Something is wrong: state='" + getState(state) + "' xpath='" + result + "' in: " + code);
		}

		return result;
	}

	function getState(state) {
		return Object.keys(State)[state];
	}

	function newNode(parNode, node, axis, addSeparator) {
		const nd = new xNode(parNode);
		parNode.childNodes.push(nd);
		nd.prevNode = node;
		nd.axis = axis;

		if (addSeparator && node.owner) nd.separator = "/";

		return nd;
	}

	function addTwoNodes(parNode, node, axis, owner, content, axis2) {
		const nd = newNode(parNode, node, axis, true);
		nd.owner = owner;
		nd.add(content);

		return newNode(parNode, nd, axis2, true);
	}

	function addAxes(axis, node, nested) {
		if ( !axis || node.axis || axis === "self::" && !nested) return;

		const text = node.parentNode.toString().trim(),
			len = text.length;

		if (len == 0 || / (?:or|\|)$/.test(text)) {
			node.axis = axis;

		} else {
			const ch = text[len - 1];

			if (ch == ':' || ch == '/' || ch == '|') {
				node.axis = axis;
			}
		}
	}

	function addOwner(owner, node) {
		if (node.owner) return;

		let result = '';
		const prev = node.prevNode;

		if ( !prev) {
			result = owner || "*";

		} else if (/^(?:or|\|)$/.test(prev.toString().trim())) {
			result = owner || "*";

		} else {
			const text = node.parentNode.toString().trim();

			if (text.length) {
				const ch = text[text.length - 1];

				if (owner) {
					if (ch == '|') result = owner;
					else if (ch === ':') result = "*";

				} else if (ch === ':' || ch === '/' || ch === '|') result = "*";
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
				let nd = newNode(parNode, node, "self::", true);
				nd.owner = "*";
				return [i, nd];

			} else {
				node.owner = "*:";
				addWarning(navWarning);
			}
		}
		return [i, node];
	}

	function parseAttribute(i, axis, nested, parNode, node) {
		const text = node.parentNode.toString().trim();

		if (text.length === 0) {
			if (nested) axis = "";

		} else if (/ (?:or|\|)$/.test(text)) {
			axis = "";

		} else {
			const ch = text[text.length - 1];
			if (ch != ':' && ch != '/') axis = "/";
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
		const ignoreCase = modifier === "i" || attrName === 'lang' || attrName === 'type' && getOwner(node) == "input";

		if ( !opt.standard && attrName === "class") {
			processClass(attrValue, operation, ignoreCase, node);
			return;
		}
		const lowerCaseValue = ignoreCase ? toLowerCase("@" + attrName, false) : null;
		const value = normalizeQuotes(attrValue);

		switch (operation) {
			case "=" :
				if (ignoreCase) {    // equals
					node.add("[", lowerCaseValue, " = ", toLowerCase(attrValue), "]");

				} else {
					node.add("[@", attrName, "=", value, "]");
				}
				break;

			case "!=" :
				if (ignoreCase) {    // not have or not equals
					node.add("[(not(@", attrName, ") or ", lowerCaseValue, "!=", toLowerCase(attrValue), ")]");

				} else {
					node.add("[(not(@", attrName, ") or @", attrName, "!=", value, ")]");
				}
				break;

			case "~=" :    // exactly contains
				if (ignoreCase) {
					node.add("[contains(concat(' ', normalize-space(", lowerCaseValue, "), ' '), concat(' ', ", toLowerCase(attrValue), ", ' '))]");

				} else {
					node.add("[contains(concat(' ', normalize-space(@", attrName, "), ' '), ' ", attrValue, " ')]");
				}
				break;

			case "|=" :    // equals or starts with immediately followed by a hyphen
				if (ignoreCase) {
					node.add("[(", lowerCaseValue, " = ", toLowerCase(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLowerCase(attrValue), ", '-')))]");

				} else {
					node.add("[(@", attrName, " = ", value, " or starts-with(@", attrName, ", ", normalizeQuotes(attrValue + '-'), "))]");
				}
				break;

			case "^=" :    //starts with
				if (ignoreCase) {
					node.add("[starts-with(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					node.add("[starts-with(@", attrName, ", ", value, ")]");
				}
				break;

			case "$=" :    //ends with
				if (ignoreCase) {
					node.add("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", toLowerCase(attrValue), "]");

				} else {
					node.add("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length(", value, ") - 1)) = ", value, "]");
				}
				break;

			case "*=" :    // contains within the string.
				if (ignoreCase) {
					node.add("[contains(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					node.add("[contains(@", attrName, ", ", value, ")]");
				}
				break;

			default : break;
		}
	}

	function processClass(attrValue, operation, ignoreCase, node) {
		const attrName = ignoreCase ? toLowerCase("@class", false) : "@class";
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
			attributeValue = toLowerCase(attributeValue);

		} else {
			attributeValue = normalizeQuotes(attributeValue);
		}

		if (operation === "!=") {
			node.add("[(not(", attrName, ") or not(", getClass(attrName, attributeValue), "))]");

		} else if (operation === "*=") {
			node.add("[contains(", attrName, ", ", attributeValue, ")]");

		} else if (operation === "|=") {
			const attrValue1 = ignoreCase ? toLowerCase(' ' + attrValue + ' ') : normalizeQuotes(' ' + attrValue + ' ');
			const attrValue2 = ignoreCase ? toLowerCase(' ' + attrValue + '-') : normalizeQuotes(' ' + attrValue + '-');

			node.add("[(", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), ")]");

		} else {
			node.add("[", getClass(attrName, attributeValue), "]");
		}
	}

	function getClass(attrName, attributeValue) {
		return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;
	}

	function processPseudoClass(name, arg, node) {
		let nd, result, owner, str2, str = '';

		switch (name) {
			case "any-link" :
				node.add("[(local-name() = 'a' or local-name() = 'area') and @href]");
				break;

			case "external" :
				node.add("[((local-name() = 'a' or local-name() = 'area') and (starts-with(@href, 'https://') or starts-with(@href, 'http://')))]");
				break;

			case "contains" :
				node.add("[contains(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "icontains" :
				node.add("[contains(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
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
				node.add("[count(preceding-sibling::", owner, ") = 0 and count(following-sibling::", owner, ") = 0]");
				break;

			case "text" :
				str = "[@type='text']";
				break;

			case "starts-with" :
				node.add("[starts-with(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "istarts-with" :
				node.add("[starts-with(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
				break;

			case "ends-with" :
				str2 = normalizeArg(name, arg);
				node.add("[substring(normalize-space(), string-length(normalize-space()) - string-length(", str2, ") + 1) = ", str2, "]");
				break;

			case "iends-with" :
				str2 = normalizeArg(name, arg);
				node.add("[substring(", toLowerCase(), ", string-length(normalize-space()) - string-length(", str2, ") + 1) = ", toLowerCase(str2, false), "]");
				break;

			case "not" :
				const axis = node.owner == "*" ? "self::" : "";
				nd = node.clone();
				result = parseNested(nd, name, arg, axis, "self::node()", { name : 'not' });

				if (result !== "self::node()") {
					node.add("[not(", result, ")]");
				}
				break;

			case "is" :
				nd = node.clone();
				result = parseNested(nd, name, arg, "self::", "self::node()", { predicate : true });

				if (nd.hasOr()) node.add("[(", result, ")]");    // in the case of joining predicates by ' and ' in postprocess()
				else node.add("[", result, "]");
				break;

			case "has" :
				nd = node.clone();
				node.add("[count(", parseNested(nd, name, arg, ".//"), ") > 0]");
				break;

			case "has-sibling" :
				nd = node.clone();
				result = parseNested(nd, name, arg);
				node.add("[(count(preceding-sibling::", result, ") > 0 or count(following-sibling::", result, ") > 0)]");
				break;

			case "has-parent" :
				nd = node.clone();
				node.add("[count(parent::", parseNested(nd, name, arg), ") > 0]");
				break;

			case "has-ancestor" :
				nd = node.clone();
				node.add("[count(ancestor::", parseNested(nd, name, arg), ") > 0]");
				break;

			case "after" :
				nd = node.clone();
				node.add("[count(preceding::", parseNested(nd, name, arg), ") > 0]");
				break;

			case "after-sibling" :
				nd = node.clone();
				node.add("[count(preceding-sibling::", parseNested(nd, name, arg), ") > 0]");
				break;

			case "before" :
				nd = node.clone();
				node.add("[count(following::", parseNested(nd, name, arg), ") > 0]");
				break;

			case "before-sibling" :
				nd = node.clone();
				node.add("[count(following-sibling::", parseNested(nd, name, arg), ") > 0]");
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

				if (splits.length != 2) argumentException(pseudo + name + "(,)' requires two numbers");

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
				node.add("[local-name() = 'option' and @selected]");
				break;

			case "checked" :
				node.add("[(local-name() = 'input' and (@type='checkbox' or @type='radio') or local-name() = 'option') and @checked]");
				break;

			default :
				parseException(pseudo + name + "' is not implemented");
				break;
		}

		if (str) node.add(str);
	}

	function processNth(name, arg, nested, parNode, node) {
		if (isNullOrWhiteSpace(arg)) argumentException("argument is empty or white space");

		const not = nested && nested.name === 'not';
		const childUsePosition = !not && name === 'nth-child';
		let ofResult = '',
			owner = '*';

		if (name === "nth-child" || name === "nth-last-child") {
			const ofReg = / +of +(.+)$/,
				rm = ofReg.exec(arg);

			if (rm !== null) {
				const nd = node.clone();
				ofResult =  parseNested(nd, name, rm[1], '', "self::node()", { predicate : true });

				if (nd.childNodes.length === 1) {
					const firstChild = nd.childNodes[0],
						selfNode = firstChild.owner === "self::node()";

					firstChild.owner = '';
					const result = "{" + nd.toString() + "}";

					if (selfNode) {
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
				arg = arg.replace(ofReg, '');
			}
		}

		arg = arg.replace(/\s+/g, '');

		if ( !checkValidity(name, arg, not)) {
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

		if ( !str) return node;

		if (usePosition && child) {
			const newNodeOwner = node.owner && node.owner != "self::node()" ? node.owner : "*";
			node.owner = owner;
			node.add(str);

			node = newNode(parNode, node, "self::", true);
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
			str = addPosition(sibling, owner, { valueB : num, count : num - 1, comparison : " = " }, usePosition);

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
					if ( !isPresent(rm[2]) || absA >= valueB) comparison = " <= ";
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

			return { valueA : absA, valueB, count, comparison, type };
		}
		regexException(0, "parseFnNotation", nthEquationReg, arg);
	}

	function addModulo(sibling, owner, num, mod, eq) {
		return `[(count(${sibling}-sibling::${owner})${num}) mod ${mod} = ${eq}]`;
	}

	function addPosition(sibling, owner, obj, usePosition) {
		if (usePosition) {
			return `[position()${obj.comparison}${obj.valueB}]`;

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
		return isPresent(num) ? +(minus + num) : defaultVal;
	}

	function checkValidity(name, arg, not) {
		if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg)) {
			if (not) return false;

			argumentException(pseudo + name + '\' with these arguments yield no matches');
		}

		if (not && /^1?n(?:\+[01]|-\d+)?$/.test(arg)) {
			argumentException(pseudo + name + '\' with these arguments in \':not()\' yield no matches');
		}
		return true;
	}

	function normalizeArg(name, arg, isString = true) {
		if ( !arg) {
			argumentException(pseudo + name + " has an empty argument.");
		}

		if (isString) {
			arg = normalizeQuotes(arg, name);
		}
		return arg;
	}

	function normalizeQuotes(text, name) {
		if (text.includes("'")) {
			if ( !text.includes("\"")) return '"' + text + '"';

			argumentException((name ? pseudo + name + "' string argument" : 'string') + " contains both '\"' and '\'' quotes"); // ???
		}
		return '\'' + text + '\'';
	}

	function parseNumber(str) {
		const num = parseInt(str);
		if (Number.isInteger(num)) return num;

		argumentException("argument is not an integer");
	}

	function toLowerCase(str = null, quote = true) {
		str = str === null ? "normalize-space()" : quote ? normalizeQuotes(str) : str;

		return "translate(" + str + ", 'ABCDEFGHJIKLMNOPQRSTUVWXYZ" + uppercase + "', 'abcdefghjiklmnopqrstuvwxyz" + lowercase + "')";
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

	function getClassValue(i, reg, node) {
		reg.lastIndex = i;
		const rm = reg.exec(code);

		if (rm !== null) {
			return [i + rm[0].length - 1, rm[0]];
		}
		regexException(i, 'getClassValue', reg);
	}

	function getPseudoClass(i) {
		pseudoClassReg.lastIndex = i;
		const rm = pseudoClassReg.exec(code); // /((?:[a-z]+-)*[a-z]+)(?:([(])|(?=[ ,:+>~!^]|$))/y;

		if (rm !== null) {
			const name = rm[1];

			if (isPresent(rm[2])) {
				const obj = getBracesContent(i + rm[0].length - 1, code, '(', ')');
				if (obj) {
					return [obj.index, name, obj.content];
				}
			}
			return [i + rm[0].length - 1, name, ''];
		}
		regexException(i, 'getPseudoClass', pseudoClassReg);
	}

	function getOwner(node, name) {
		const owner = node.owner !== "self::node()" ? node.owner : node.parentNode.owner;

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

			if (isPresent(rm[1])) value = rm[1];
			else if (isPresent(rm[2])) value = rm[2];
			else value = rm[3];

			if (isPresent(rm[4])) modifier = rm[4].toLowerCase();

			return [i + rm[0].length - 1, value, modifier];
		}
		regexException(i, "getAttributeValue", attrValueReg);
	}

	function isPresent(arg) {
		return typeof arg !== 'undefined';
	}

	// Normalizes white spaces of the CSS selector by removing unnecessarily ones;
	// it also removes comments
	function normalizeWhiteSpaces(text) {
		code = text;
		length = code.length;

		let addSpace = false, unresolved = false;
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

					//} else sb.push(ch);

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
		return sb.join('');
	}

	function getBracesContent(i, text, open, close) {
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

				if (i >= text.length) characterException(i, ch, "function getBracesContent()", text);

			} else {
				if (ch === open) n++;
				else if (ch === close && --n === 0) {
					return { index : i, content : text.substring(start, i) };
				}
			}
		}
		return null;
	}

	function findEnd(i, ch, comment) {
		while (++i < length) {
			if (code[i] === ch) {
				if (comment && code[i - 1] != '*') continue;
				return i;
			}
		}
		return -1;
	}

	function nextChar(i, ch) {
		return i + 1 < length && code[i + 1] === ch;
	}

	function isNullOrWhiteSpace(arg) {
		return !isPresent(arg) || arg === null || arg.trim() === '';
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

	return toXPath;
});























