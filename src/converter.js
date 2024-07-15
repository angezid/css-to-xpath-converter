
/**
* A JavaScript version of C# converter. Author is angezid.
*/

(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));

	} else if (typeof exports === 'object') {
		module.exports = factory(root);

	} else {
		root.convertToXPath = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {
	'use strict';

	//const tagNameReg = /(?:[a-z]+\|)?([a-z][a-z0-9_-]*)/y;
	const tagNameReg = /(?:[a-zA-Z]+\|)?(?:[a-zA-Z][^ -/:-@[-`{-~]*)/y;

	const idReg = /[^ ='",*@#.()[\]|:+>~!^$]+/y;

	const classReg = /[^ -/:-@[-`{-~]+/y;

	const pseudoClassReg = /([a-z-]+)([(])?/y;

	const nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;

	//const attrNameReg = /(?:[a-z]+\|)?[\w]+(?=(?:[~^|$!*]?=)|\])/y;
	const attrNameReg = /(?:[a-z]+\|)?[^ -/:-@[-`{-~]+(?=(?:[~^|$!*]?=)|\])/y;

	const attrValueReg = /(?:"([^"]+)"|'([^']+)'|([^ "'\]]+))(?: +([si]))?(?=\])/y;

	//const attributeReg = /(?:(?:\*|[a-z]+)\|)?(?:\*|[\w-]+)/y;
	const attributeReg = /(?:(?:\*|[a-z]+)\|)?(?:\*|[^ -/:-@[-`{-~]+)/y;

	const State = Object.freeze({ "Text" : 0, "PseudoSelector" : 1, "AttributeName" : 2, "AttributeValue" : 3 });

	const leftChars = ",>+=~^!:([";
	const rightChars = ",>+=~^!$|]()";
	const pseudo = "Pseudo selector ':";
	const navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";

	let opt, warning, uppercase, lowercase, stack, code, length;

	function xNode(node) {
		this.axis = '';
		this.separator = '';
		this.owner = '';
		this.isClone = false;
		this.nthChild = null;
		this.prevNode = null;
		this.parentNode = node;
		this.childNodes = [];
		this.content = [];

		this.add = function() {
			this.content.push([...arguments].join(''));
		}

		this.last = function() {
			const len = this.content.length;
			return len ? this.content[len-1] : '';
		}

		this.clone = function() {
			var node = new xNode();
			node.owner = this.owner;
			node.isClone = true;
			return node;
		}

		this.toString = function(text = "") {
			if ( !this.isClone) {
				text = this.separator + this.axis + (this.nthChild ? '' : this.owner);

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

	function convertToXPath(selector, options) {
		opt = Object.assign({}, {
			axis : '//',
			browserUse : false,    // to suppress XPathNavigator warning message
			normalizeClassSpaces : true,    // do not use this property
			uppercaseLetters : '',
			lowercaseLetters : '',
			printError : () => {},
		}, options);

		warning = '';

		if (isNullOrWhiteSpace(selector)) {
			argumentException("selector is null or white space");
		}

		uppercase = opt.uppercaseLetters ? opt.uppercaseLetters.trim() : '';
		lowercase = opt.lowercaseLetters ? opt.lowercaseLetters.trim() : '';

		if (uppercase.length != lowercase.length) {
			argumentException("Custom upper and lower case letters have different length");
		}

		stack = [];

		const node = new xNode();
		const normalized = normalizeWhiteSpaces(selector);
		let xpath = parse(node, normalized, opt.axis, null);
		xpath = postprocess(xpath);

		return { xpath, css : normalized, warning };
	}

	function parseNested(node, selector, axis = "", owner = null, predicate) {
		stack.push(code);

		const result = parse(node, selector, axis, owner, true, predicate);

		code = stack.pop();
		length = code.length;

		return result;
	}

	function postprocess(xpath) {
		xpath = xpath.replace(/self::node\(\)\[([^\]]+)\]/g, '$1');
		return xpath;
	}

	function parse(parNode, selector, axis, owner, nested = false, predicate) {
		if ( !selector) {
			argumentException("selector is empty or white space");
		}

		let node = new xNode(parNode);
		parNode.childNodes.push(node);

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

		if (/^[,|(]/.test(code)) {
			characterException(code[0], 0, "State.Text");
		}

		while (++i < length) {
			ch = code[i];

			if (state === State.Text) {
				if (check && !/[.#*:[@a-zA-Z]/.test(ch) || !check && !/[ >+~^!,.#*:[@a-zA-Z]/.test(ch)) {
					characterException(ch, i, "parser State." + getState(state) + ", check=" + check);
				}

				switch (ch) {
					case '.' :
						if (first) addAxes(axis, node);
						addOwner(owner, predicate, node);
						let attr = '[';
						do {
							attr += opt.normalizeClassSpaces ? "contains(concat(' ', normalize-space(@class), ' '), ' " : "contains(@class, ' ";
							[i, value] = getClassValue(i + 1, classReg, node);
							attr += value;

							tagNameReg.lastIndex = i + 2;
							if (nextChar(i, '.') && tagNameReg.test(code)) {
								attr += " ') and ";

							} else break;
						} while (++i < length);
						node.add(attr, " ')]");
						check = false;
						break;

					case '#' :
						if (first) addAxes(axis, node);
						addOwner(owner, predicate, node);

						[i, value] = getClassValue(i + 1, idReg, node);
						node.add("[@id='", value, "']");
						check = false;
						break;

					case '>' :
						node = newNode(parNode, node,  "", true);
						check = true;
						break;

					case '+' :
						node = newNode(parNode, node, "following-sibling::*[1]/self::", true);
						check = true;
						break;

					case '~' :
						node = newNode(parNode, node, "following-sibling::", true);
						check = true;
						break;

					case '^' :    // first child
						node = newNode(parNode, node, "child::*[1]/self::", true);
						check = true;
						break;

					case '!' :
						if (nextChar(i, '^')) {    // last child
							node = newNode(parNode, node, "child::*[last()]/self::", true);
							i++;

						} else if (nextChar(i, '+')) {    // adjacent preceding sibling
							node = newNode(parNode, node, "preceding-sibling::*[1]/self::", true);
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
						addOwner(owner, predicate, node);
						attrName = '';
						attrValue = null;
						modifier = null;
						operation = null;
						state = State.AttributeName;
						break;

					case ':' :
						if (first) addAxes(axis, node);
						addOwner(owner, predicate, node);
						if (nextChar(i, ':')) i++;
						state = State.PseudoSelector;
						break;

					case ',' :
						if (i + 1 >= length) parseException('Unexpected comma');

						node.add(predicate ? " or " : " | ");
						node = newNode(parNode, node, predicate ? "" : axis);
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
						if (node.owner == "*") {
							addWarning(navWarning);

						} else if (nextChar(i, '|')) {
							parseException("Column combinator is not implemented");
						}

						if ( !node.parentNode) {
							if (first) addAxes(axis, node);
							node.add("*[name() = local-name()]/self::");

						} else {
							node.add(":");
						}
						check = false;
						break;

					case '\\' : //??
						i++;
						break;

					default :
						if (/[a-zA-Z]/.test(ch)) {
							if (first || predicate) addAxes(axis, node, nested);
							i = getTagName(i, node);

						} else {
							characterException(ch, i, "State." + getState(state));
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
							characterException(ch, i, "State." + getState(state));
						}
						break;

					case ']' :
						if ( !attrName) nullException("attrName");

						node.add("[@" + attrName + "]");
						state = State.Text;
						check = false;
						break;

					case ' ' : break;

					default :
						[i, attrName] = getAttributeName(i);
						break;
				}

			} else if (state === State.AttributeValue) {
				switch (ch) {
					case ']' :
						if ( !attrValue) nullException("attrValue");

						processAttribute(attrName, attrValue, operation, modifier, node);

						state = State.Text;
						check = false;
						break;

					case '=' :
						characterException(ch, i, "State." + getState(state));
						break;

					case ' ' : break;

					default :
						if (attrValue) {
							parseException("attrValue '" + attrValue + "' is already parse: " + code.substring(i));
						}
						[i, attrValue, modifier] = getAttributeValue(i);
						break;
				}

			} else if (state === State.PseudoSelector) {
				let pseudoName = '',
					argument = '';

				[i, pseudoName, argument] = getPseudoSelector(i);

				if (pseudoName === "root") {
					node.axis = node.owner = node.separator = '';
					node.add("//ancestor-or-self::*[last()]");

				} else {
					addOwner(owner, predicate, node);
					if (pseudoName.startsWith("nth-")) processNth(pseudoName, argument, predicate, node);
					else processPseudoSelector(pseudoName, argument, node);
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

	function addAxes(axis, node, nested) {
		if ( !axis || axis === "self::" && !nested) return;

		const text = node.parentNode.toString().trim(),
			len = text.length;

		if (len == 0 || nested && / or$/.test(text)) {
			node.axis = axis;

		} else {
			const ch = text[len-1];

			if (ch == ':' || ch == '/' || ch == '|') {
				node.axis = axis;
			}
		}
	}

	function addOwner(owner, predicate, node) {
		if (node.owner) return;

		let result = '';
		const prev = node.prevNode;

		if ( !prev) {
			result = owner || "*";

		} else if (predicate) {
			if (/ or$/.test(prev.toString().trim())) result = owner;

		} else {
			const text = node.parentNode.toString().trim();

			if (text.length) {
				const ch = text[text.length-1];

				if (owner) {
					if (ch == '|') result = owner;
					else if (ch === ':') result = "*";

				} else if (ch === ':' || ch === '/' || ch === '|') result = "*";
			}
		}
		node.owner = result;
	}

	function parseAttribute(i, axis, nested, parNode, node) {
		const text = node.parentNode.toString().trim();

		if (text.length === 0) {
			if (nested) axis = "";

		} else if (nested) {
			if (/ or$/.test(text)) axis = "";

		} else {
			const ch = text[text.length - 1];
			if (ch != ':' && ch != '/') axis = "/";
			else axis = "";
		}

		attributeReg.lastIndex = i + 1;
		const rm = attributeReg.exec(code);

		if (rm !== null) {
			const nd = newNode(parNode, node, axis);
			nd.add("@", rm[0].replace('|', ':'));
			return [i + rm[0].length, nd];
		}
		regexException(i, 'parseAttribute', attributeReg, code);
	}

	function processAttribute(attrName, attrValue, operation, modifier, node) {
		const ignoreCase = modifier === "i" || attrName === 'type' && getOwner(node) == "input",
			lowerCaseValue = ignoreCase ? toLowerCase("@" + attrName, false) : null;

		if (attrName === "class") {
			processClass(attrName, attrValue, operation, ignoreCase, node);
			return;
		}

		switch (operation) {
			case "=" :
				if (ignoreCase) {    // equals
					node.add("[", lowerCaseValue, " = ", toLowerCase(attrValue), "]");

				} else {
					node.add("[@", attrName, " = '", attrValue, "']");
				}
				break;

			case "!=" :
				if (ignoreCase) {    // not have or not equals
					node.add("[not(@", attrName, ") or ", lowerCaseValue, " != ", toLowerCase(attrValue), "]");

				} else {
					node.add("[not(@", attrName, ") or @", attrName, " != '", attrValue, "']");
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
					node.add("[", lowerCaseValue, " = ", toLowerCase(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLowerCase(attrValue), ", '-'))]");

				} else {
					node.add("[@", attrName, " = '", attrValue, "' or starts-with(@", attrName, ", '", attrValue, "-')]");
				}
				break;

			case "^=" :    //starts with
				if (ignoreCase) {
					node.add("[starts-with(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					node.add("[starts-with(@", attrName, ", '", attrValue, "')]");
				}
				break;

			case "$=" :    //ends with
				if (ignoreCase) {
					node.add("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = ", toLowerCase(attrValue), "]");

				} else {
					node.add("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = '", attrValue, "']");
				}
				break;

			case "*=" :    // contains within the string.
				if (ignoreCase) {
					node.add("[contains(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					node.add("[contains(@", attrName, ", '", attrValue, "')]");
				}
				break;

			default :
				break;
		}
	}

	function processClass(attrName, attrValue, operation, ignoreCase, node) {
		attrName = ignoreCase ? toLowerCase("@class", false) : "@class";
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
			attributeValue = "'" + attributeValue + "'";
		}

		if (operation === "!=") {
			node.add("[not(", attrName, ") or not(", getClass(attrName, attributeValue), ")]");

		} else if (operation === "|=") {
			const attrValue1 = ignoreCase ? toLowerCase(' ' + attrValue + ' ') : "' " + attrValue + " '";
			const attrValue2 = ignoreCase ? toLowerCase(' ' + attrValue + '-') : "' " + attrValue + "-'";

			node.add("[", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "]");

		} else {
			node.add("[", getClass(attrName, attributeValue), "]");
		}
	}

	function getClass(attrName, attributeValue) {
		if (opt.normalizeClassSpaces) {
			return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;

		} else {
			return `contains(${attrName}, ${attributeValue})`;
		}
	}

	function processPseudoSelector(name, arg, node) {
		let nd, result, owner, str2, str = '';

		switch (name) {
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
				str = "[1]";
				break;

			case "first-of-type" :
				owner = getOwner(node, name);
				//node.add("[name(preceding-sibling::", owner, ") != name()]");
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
				//node.add("[name(preceding-sibling::", owner, ") != name() and name(following-sibling::", owner, ") != name()]");
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
				node.add("[not(", parseNested(nd, arg, axis, "self::node()", { type : 'not' }), ")]");
				break;

			case "is" :
				nd = node.clone();
				node.add("[", parseNested(nd, arg, "self::", "self::node()", { type : 'is' }), "]");
				break;

			case "has" :
				nd = node.clone();
				node.add("[count(", parseNested(nd, arg, ".//"), ") > 0]");
				break;

			case "has-sibling" :
				nd = node.clone();
				result = parseNested(nd, arg);
				node.add("[count(preceding-sibling::", result, ") > 0 or count(following-sibling::", result, ") > 0]");
				break;

			case "has-parent" :
				nd = node.clone();
				node.add("[count(parent::", parseNested(nd, arg), ") > 0]");
				break;

			case "has-ancestor" :
				nd = node.clone();
				node.add("[count(ancestor::", parseNested(nd, arg), ") > 0]");
				break;

			case "last" :
				str = "[last()]";
				break;

			case "last-of-type" :
				owner = getOwner(node, name);
				node.add("[not(following-sibling::", owner, ")]");
				break;

			case "skip" :
				node.add("[position() > ", parseNumber(arg), "]");
				break;

			case "skip-first" :
				str = "[position() > 1]";
				break;

			case "skip-last" :
				str = "[position() < last()]";
				break;

			case "limit" :
				node.add("[position() <= ", parseNumber(arg), "]");
				break;

			case "range" :
				var splits = arg.split(',');

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

			case "checked" :
				str = "[@checked]";
				break;

			default :
				parseException(pseudo + name + "' is not implemented");
		}

		if (str) node.add(str);
	}

	function processNth(name, arg, predicate, node) {
		if ( !arg) argumentException("argument is empty or white space");
		arg = arg.replace(/\s+/g, '');

		if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg)) {
			warning += pseudo + name + '\' with these arguments yield no matches';
			argumentException(warning);
		}

		let owner;
		switch (name) {
			case "nth-child" :
				addNthToXpath(name, arg, 'preceding', '*', false, true, predicate, node);
				break;

			case "nth-last-child" :
				addNthToXpath(name, arg, 'following', '*', true, true, predicate, node);
				break;

			case "nth-of-type" :
				owner = getOwner(node, name);
				addNthToXpath(name, arg, 'preceding', owner, false, false, predicate, node);
				break;

			case "nth-last-of-type" :
				owner = getOwner(node, name);
				addNthToXpath(name, arg, 'following', owner, true, false, predicate, node);
				break;

			default :
				parseException(pseudo + name + "' is not implemented");
		}
	}

	function addNthToXpath(name, arg, sibling, owner, last, child, predicate, node) {
		const not = predicate && predicate.type === 'not';

		if (not) {
			if (last) argumentException(pseudo + name + "' as an argument of ':not()' isn't implemented");

			if(/^1?n(?:\+[01]|-\d+)?$/.test(arg)) {
				warning += pseudo + name + '\' with these arguments in \':not()\' yield no matches';
			}
		}

		let str = '';

		if (isNumber(arg)) {
			node.add("[(count(", sibling, "-sibling::", owner, ") + 1) = ", arg, "]");
			return;
		}
		switch (arg) {
			case "odd" :
				node.add("[(count(", sibling, "-sibling::", owner, ") + 1) mod 2 = 1]");
				return;

			case "even" :
				node.add("[(count(", sibling, "-sibling::", owner, ") + 1) mod 2 = 0]");
				return;

			default :
				const obj = last ? parseFnNotationOfLast(arg) : parseFnNotation(arg);

				if (obj.valueA) {
					const num = getNumber(obj.valueB);

					if (obj.type === 'mod') str = addRange("[(count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");
					else if (not) {
						if (obj.type === 'pos') str = addRange("[(count(", sibling, "-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, "]");
						else if (obj.type === 'both') str = addRange("[(count(", sibling, "-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, " and (count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");

					} else {
						if (obj.type === 'pos') str = addRange("[position()", obj.comparison, obj.posValue, "]");
						else if (obj.type === 'both') str = addRange("[position()", obj.comparison, obj.posValue, " and (count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");
					}

				} else {
					if (not) {
						str = addRange("[(count(preceding-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, "]");

					} else {
						str = addRange("[position()", obj.comparison, obj.posValue, "]");
					}
				}
				break;
		}

		if ( !predicate && child && str.length > 0) {
			node.content.unshift("*" + str + (node.owner != "self::node()" ? "/self::" + node.owner : "/self::*"));
			node.nthChild = true;

		} else {
			node.add(str);
		}
	}

	function getNumber(str) {
		const num = 1 - str;
		if (num === 0) return '';
		return (num < 0 ? ' - ' : ' + ') + Math.abs(num);
	}

	function isNumber(arg) {
		return /^\d+$/.test(arg);
	}

	function parseFnNotation(argument) {
		const rm = nthEquationReg.exec(argument);    // an+b-1  @"^([+-])?([0-9]+)?n(?:\s*([+-])\s*([0-9]*))?$"
		if (rm !== null) {
			const minus = isPresent(rm[1]) && rm[1] === '-',
				valueA = getValue(rm[1], rm[2], 1),
				valueB = getValue(rm[3], rm[4], 0),
				absA = Math.abs(valueA),
				comparison = absA === 0 ? " = " : minus ? " <= " : " >= ";

			let type = 'x';
			if (valueA === 0) type = 'pos';
			else if (valueB > 0) {
				if (absA > 1) type = 'both';
				else type = 'pos';

			} else if (absA > 1) {
				type = 'mod';
			}

			return { valueA : absA, valueB, posValue : valueB, comparison, type };
		}
		regexException(0, "parseFnNotation", nthEquationReg, argument);
	}

	function parseFnNotationOfLast(argument) {
		const rm = nthEquationReg.exec(argument);    // an+b-1  @"^([+-])?([0-9]+)?n(?:\s*([+-])\s*([0-9]*))?$"
		if (rm !== null) {
			const minus = isPresent(rm[1]) && rm[1] === '-',
				valueA = getValue(rm[1], rm[2], 1),
				valueB = getValue(rm[3], rm[4], 0),
				absA = Math.abs(valueA),
				comparison = absA === 0 ? " = " : minus ? " >= " : " <= ";

			let num = valueB,
				posValue = "last()";

			if (--num > 0) {
				posValue = '(last() - ' + num + ')';
			}

			let type = 'x';
			if (absA === 0) type = 'pos';
			else if (valueB > 0) {
				if (absA > 1) type = 'both';
				else if (absA !== 0 && posValue === "last()") type = 'pos';
				else type = 'pos';

			} else if (absA > 1) {
				type = 'mod';
			}

			return { valueA : absA, valueB, posValue, comparison, type };
		}
		regexException(0, "parseFnNotationOfLast", nthEquationReg, argument);
	}

	function isPresent(arg) {
		return typeof arg !== 'undefined';
	}

	function getValue(sign, num, defaultVal) {
		const minus = sign && sign === '-' ? '-' : '';
		return typeof num !== 'undefined' ? +(minus + num) : defaultVal;
	}

	function addRange() {
		return [...arguments].join('');
	}

	function normalizeArg(name, argument, isString = true) {
		if ( !argument) {
			argumentException(pseudo + name + " has an empty argument.");
		}

		if (isString) {
			argument = normalizeQuotes(name, argument);
		}

		return argument;
	}

	function normalizeQuotes(name, text) {
		let len = text.length;

		if (len > 1) {
			const start = text[0], end = text[len - 1];

			if (start === '\'' && end === '\'') {
				if (len > 2) return text;

			} else if (start === '"' && end === '"') {
				if (len > 2) text = text.substring(1, len - 2);
			}
		}

		if (text.includes("'")) {
			if ( !text.includes("\"")) return '"' + text + '"';

			argumentException(pseudo + name + "' string argument contains both '\"' and '\'' quotes");
		}
		return '\'' + text + '\'';
	}

	function parseNumber(str) {
		var num = parseInt(str);
		if (Number.isInteger(num)) return num;

		argumentException("argument is not an integer");
	}

	function toLowerCase(str = null, quote = true) {
		str = str === null ? "normalize-space()" : quote ? '\'' + str + '\'' : str;

		return "translate(" + str + ", 'ABCDEFGHJIKLMNOPQRSTUVWXYZ" + uppercase + "', 'abcdefghjiklmnopqrstuvwxyz" + lowercase + "')";
	}

	function getTagName(i, node) {
		tagNameReg.lastIndex = i;
		const rm = tagNameReg.exec(code);

		if (rm !== null) {
			node.owner = rm[0].toLowerCase();
			return i + rm[0].length - 1;
		}
		regexException(i, 'getTagName', tagNameReg, code);
	}

	function getClassValue(i, reg, node) {
		reg.lastIndex = i;
		const rm = reg.exec(code);

		if (rm !== null) {
			return [i + rm[0].length - 1, rm[0]];
		}
		regexException(i, 'getClassValue', reg, code);
	}

	function getPseudoSelector(i) {
		pseudoClassReg.lastIndex = i;
		const rm = pseudoClassReg.exec(code);

		if (rm !== null) {
			const name = rm[1];

			if (typeof rm[2] !== 'undefined') {
				const obj = findArgument(i + rm[0].length - 1, code, '(', ')');
				if (obj) {
					return [obj.index, name, obj.argument];
				}
			}
			return [i + rm[0].length - 1, name, ''];
		}
		regexException(i, 'getPseudoSelector', pseudoClassReg, code);
	}

	function getOwner(node, name) {
		const owner = node.owner !== "self::node()" ? node.owner : node.parentNode.owner;

		if (name && owner == "*") parseException("Pseudo-class ':" + name + "' is required element name to work correctly; '*' is not implemented.");
		return owner;
	}

	function getAttributeName(i) {
		attrNameReg.lastIndex = i;
		const rm = attrNameReg.exec(code);

		if (rm !== null) {
			const name = rm[0].replace("|", ":").toLowerCase();
			return [i + rm[0].length - 1, name];
		}
		regexException(i, 'getAttributeName', attrNameReg, code);
	}

	function getAttributeValue(i) {
		attrValueReg.lastIndex = i;
		const rm = attrValueReg.exec(code);

		if (rm !== null) {
			let value;

			if (typeof rm[1] !== 'undefined') value = rm[1];
			else if (typeof rm[2] !== 'undefined') value = rm[2];
			else value = rm[3];

			return [i + rm[0].length - 1, value, rm[4]];
		}
		regexException(i, "getAttributeValue", attrValueReg, code);
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

				} else sb.push(ch);

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

	function findArgument(i, text, open, close) {
		let first = true, start = i, n = 0;

		for (; i < text.length; i++) {
			if (first) {
				if (text[i] === open) {
					n++;
					start = i + 1;
				}
				first = false;

			} else {
				if (text[i] === open) n++;
				else if (text[i] === close && --n === 0) {
					return { index : i, argument : text.substring(start, i) };
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
		return typeof arg === 'undefined' || arg === null || arg.trim() === '';
	}

	function addWarning(text) {
		if ( !opt.browserUse && !warning.includes(text)) {
			warning += text;
		}
	}

	function printError(message) {
		if (typeof opt.printError === 'function') {
			opt.printError(message);
		}
	}

	function nullException(message) {
		const text = message + ' is null or empty.';
		printError(text);
		throw new Error(text);
	}

	function parseException(message) {
		printError(message);
		throw new Error(message);
	}

	function argumentException(message) {
		printError(message);
		throw new Error(message);
	}

	function characterException(ch, i, message) {
		const text = message + ". Unexpected character '<b>" + ch + "</b>' in the substring - <b>" + code.substring(i) + "</b>";
		printError(text);
		message += ". Unexpected character '" + ch + "' in the substring - " + code.substring(i);
		throw new Error(message);
	}

	function regexException(i, message, reg, code) {
		const text = message + " function - RegExp failed to match the string:\n'<b>" + code.substring(i) + "</b>'\n" + reg;
		printError(text);
		message += " function - RegExp failed to match the string:\n'" + code.substring(i) + "'\n" + reg;
		throw new Error(message);
	}

	return convertToXPath;
});
