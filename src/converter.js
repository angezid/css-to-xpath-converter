
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

	const tagNameReg = /(?:[a-zA-Z]+\|)?([a-zA-Z][a-zA-Z0-9_-]*)(?=[ .#:,>+\[@]|[~^|](?!=)|![+>~^]?|$)/y;

	//const idReg = /[\w_-]+/y;
	const idReg = /[^ ='",*@#.()[\]|:+>~!^$]+/y;

	const classReg = /[a-zA-Z][\w_-]*/y;

	const pseudoSelectorReg = /([a-z-]+)([(])?/y;

	const nthEquationReg = /^([+-])?([0-9]+)?n(?:([+-])([0-9]+))?$/;

	const selectorOwnerReg = /(?:\b[a-zA-Z][a-zA-Z0-9_-]*|\*|(\]))$/;

	const attrNameReg = /(?:[a-zA-Z]+\|)?(?:\*(?=(?:[~^|$!]?=)|\])|[\w]+(?=(?:[~^|$!*]?=)|\]))/y;

	const attributeReg = /(\*|[\w:-]+)/y;

	const combinatornReg = /!?[+>~^]/y;

	const attrValueReg = /(?:"([^"]+)"|'([^']+)'|([^ "'\]]+))(?: +([si]))?(?=\])/y;

	const State = Object.freeze({ "Text" : 0, "PseudoSelector" : 1, "AttributeName" : 2, "AttributeValue" : 3 });

	const leftChars = ",>+=~^!:([";
	const rightChars = ",>+=~^!$|]()";
	const pseudo = "Pseudo selector ':";
	const navWarning = "\nSystem.Xml.XPath.XPathNavigator doesn't support '*' as a namespace.";

	let opt, warning, combined, uppercase, lowercase, stack, code, length;

	function convertToXPath(selector, options) {
		opt = Object.assign({}, {
			axis : '//',
			browserUse : false,    // to suppress XPathNavigator warning message
			normalizeClassSpaces : true,    // do not use this property
			uppercaseLetters : '',
			lowercaseLetters : '',
			printError : () => {},
		}, options);

		combined = '';
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

		const normalized = normalizeWhiteSpaces(selector);
		let xpath = parse(normalized, opt.axis, null);
		xpath = postprocess(xpath);

		return { xpath, css : normalized, warning };
	}

	function parseNested(selector, axis = "", owner = null, predicate) {
		stack.push(code);

		const result = parse(selector, axis, owner, true, predicate);

		code = stack.pop();
		length = code.length;

		return result;
	}

	function postprocess(xpath) {
		xpath = xpath.replace(/self::node\(\)\[@([^ \/@#.()[\]|:+>]+)\]/g, '@$1');
		return xpath;
	}

	function parse(selector, axis, owner, nested = false, predicate) {
		if ( !selector) {
			argumentException("selector is empty or white space");
		}

		let attrName = null,
			attrValue = null,
			modifier = null,
			operation = null,
			state = State.Text,
			check = false,
			first = true,
			xpath = '',
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
				if (check && !/[.#*:[@]/.test(ch) && !isLetter(ch)) {
					characterException(ch, i, "State." + getState(state) + ", check=" + check);
				}

				switch (ch) {
					case '.' :
						if (first) xpath = addAxes(axis, xpath);
						xpath = addOwner(owner, xpath, predicate);
						xpath += '[';
						do {
							xpath += opt.normalizeClassSpaces ? "contains(concat(' ', normalize-space(@class), ' '), ' " : "contains(@class, ' ";
							[i, xpath] = getName(i + 1, classReg, xpath);

							tagNameReg.lastIndex = i + 2;
							if (nextChar(i, '.') && tagNameReg.test(code)) {
								xpath += " ') and ";

							} else break;
						} while (++i < length);

						xpath += " ')]";
						check = false;
						break;

					case '#' :
						if (first) xpath = addAxes(axis, xpath);
						xpath = addOwner(owner, xpath, predicate);
						xpath += "[@id='";
						[i, xpath] = getName(i + 1, idReg, xpath);
						xpath += "']";
						check = false;
						break;

					case '>' :
						xpath = addSlash(xpath);
						check = true;
						break;

					case '+' :
						xpath = addSlash(xpath);
						xpath += "following-sibling::*[1]/self::";
						check = true;
						break;

					case '~' :
						xpath = addSlash(xpath);
						xpath += "following-sibling::";
						check = true;
						break;

					case '^' :    // first child
						xpath = addSlash(xpath);
						xpath += "child::*[1]/self::";
						check = true;
						break;

					case '!' :
						if (nextChar(i, '^')) {    // last child
							xpath = addSlash(xpath);
							xpath += "child::*[last()]/self::";
							i++;

						} else if (nextChar(i, '+')) {    // adjacent preceding sibling
							xpath = addSlash(xpath);
							xpath += "preceding-sibling::*[1]/self::";
							i++;

						} else if (nextChar(i, '>')) {    // direct parent
							xpath = addSlash(xpath);
							xpath += "parent::";
							i++;

						} else if (nextChar(i, '~')) {    // preceding sibling
							xpath = addSlash(xpath);
							xpath += "preceding-sibling::";
							i++;

						} else {
							xpath = addSlash(xpath);
							xpath += "ancestor-or-self::";    // ancestors
						}
						check = true;
						break;

					case '[' :
						if (first) xpath = addAxes(axis, xpath);
						xpath = addOwner(owner, xpath, predicate);
						attrName = '';
						attrValue = null;
						modifier = null;
						operation = null;
						state = State.AttributeName;
						break;

					case ':' :
						if (first) xpath = addAxes(axis, xpath);
						xpath = addOwner(owner, xpath, predicate);
						if (nextChar(i, ':')) i++;
						state = State.PseudoSelector;
						break;

					case ',' :
						if (i + 1 >= length) parseException('Unexpected comma');

						xpath += predicate ? " or " : " | " + axis;
						check = true;
						break;

					case '@' :
						[i, xpath] = parseAttribute(i, axis, nested, xpath);
						check = false;
						break;

					case '*' :
						if (first) xpath = addAxes(axis, xpath);
						xpath += "*";
						check = false;
						break;

					case ' ' :
						xpath += "//";
						check = true;
						break;

					case '|' :
						if (xpath[xpath.length - 1] === '*') {
							addWarning(navWarning);

						} else if (nextChar(i, '|')) {
							parseException("Column combinator is not implemented");
						}

						if ( !xpath.length) {
							if (first) xpath = addAxes(axis, xpath);
							//xpath += "*[not(contains(name(), ':'))]/self::";
							xpath += "*[name() = local-name()]/self::";

						} else {
							xpath += ":";
						}
						check = false;
						break;

					case '\\' :
						if (nextCharIsNotWhiteSpace(i)) i++;
						break;

					default :
						if (isLetter(ch)) {
							if (first || predicate) xpath = addAxes(axis, xpath, nested);
							[i, xpath] = getTagName(i, xpath);

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

						xpath += "[@" + attrName + "]";
						state = State.Text;
						check = false;
						break;

					case ' ' : break;

					default :
						let obj = getAttributeName(i);
						i = obj.index;
						attrName += obj.attrName;
						break;
				}

			} else if (state === State.AttributeValue) {
				switch (ch) {
					case ']' :
						if ( !attrName) nullException("attrName");
						if ( !attrValue) nullException("attrValue");

						xpath = processAttribute(attrName, attrValue, operation, modifier, xpath);

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
						let obj = getAttributeValue(i);
						i = obj.index;
						attrValue = obj.attrValue;
						modifier = obj.modifier;
						break;
				}

			} else if (state === State.PseudoSelector) {
				let pseudoName = '',
					argument = '';

				let obj = getPseudoSelector(i);
				i = obj.index;
				pseudoName = obj.pseudoName;
				argument = obj.argument;

				if (pseudoName === "root") {
					xpath = "//ancestor-or-self::*[last()]";

				} else {
					xpath = addOwner(owner, xpath, predicate);
					if (pseudoName.startsWith("nth-")) xpath = processNth(pseudoName, argument, xpath, predicate);
					else xpath = processPseudoSelector(pseudoName, argument, xpath);
				}

				state = State.Text;
				check = false;
			}
		}

		if (check && /(?:\/|::)$/.test(xpath)) {
			return xpath + '*';
		}

		if (check || state != State.Text) {
			parseException("Something is wrong: state='" + getState(state) + "' xpath='" + xpath + "' in: " + code);
		}

		return xpath;
	}

	function getState(state) {
		return Object.keys(State)[state];
	}

	function addSlash(xpath) {
		if (getOwner(xpath)) {
			xpath += '/';
		}
		return xpath;
	}

	function addAxes(axis, xpath, nested) {
		if ( !axis || axis === "self::" && !nested) return xpath;

		const len = xpath.length;

		if (len > 0 && notAllow(xpath) || len == 0 && notAllow(combined)) return xpath;

		function notAllow(str) {
			str = str.trim();

			if ( !str.length || nested && / or$/.test(str)) return false;

			const ch = str[str.length - 1];
			return ch == ':' || ch == '/' || ch == '|';
		}

		return xpath += axis;
	}

	function addOwner(owner, xpath, predicate) {
		const str = xpath.trim(),
			len = str.length;
		let result = '';

		if (len == 0) {
			result = owner || "*";

		} else if (predicate) {
			if (/ or$/.test(str)) result = owner;

		} else {
			const ch = str[len - 1];

			if (owner != null) {
				if (ch == '|') result = owner;
				else if (ch == ':') result = "*";

			} else if (ch == ':' || ch == '/' || ch == '|') result = "*";
		}
		return xpath += result;
	}

	function parseAttribute(i, axis, nested, xpath) {
		if (xpath.length === 0) {
			if ( !nested) xpath += axis;

		} else {
			const ch = xpath[xpath.length - 1];
			if (ch != ':' && ch != '/') xpath += "/";
		}
		xpath += '@';

		const rm = attributeReg.exec(code.substring(i + 1));
		if (rm !== null) {
			xpath += rm[0];
			return [i + rm[0].length, xpath];
		}

		regexException(i, 'parseAttribute', attributeReg, code);
	}

	function processAttribute(attrName, attrValue, operation, modifier, xpath) {
		const ignoreCase = modifier === "i" || attrName === 'type' && getOwner(xpath) == "input",
			lowerCaseValue = ignoreCase ? toLowerCase("@" + attrName, false) : null;

		if (attrName === "class") {
			xpath = processClass(attrName, attrValue, operation, ignoreCase, xpath);
			return xpath;
		}

		switch (operation) {
			case "=" :
				if (ignoreCase) {    // equals
					xpath += addRange("[", lowerCaseValue, " = ", toLowerCase(attrValue), "]");

				} else {
					xpath += addRange("[@", attrName, " = '", attrValue, "']");
				}
				break;

			case "!=" :
				if (ignoreCase) {    // not have or not equals
					xpath += addRange("[not(@", attrName, ") or ", lowerCaseValue, " != ", toLowerCase(attrValue), "]");

				} else {
					xpath += addRange("[not(@", attrName, ") or @", attrName, " != '", attrValue, "']");
				}
				break;

			case "~=" :    // exactly contains
				if (ignoreCase) {
					xpath += addRange("[contains(concat(' ', normalize-space(", lowerCaseValue, "), ' '), concat(' ', ", toLowerCase(attrValue), ", ' '))]");

				} else {
					xpath += addRange("[contains(concat(' ', normalize-space(@", attrName, "), ' '), ' ", attrValue, " ')]");
				}
				break;

			case "|=" :    // equals or starts with immediately followed by a hyphen
				if (ignoreCase) {
					xpath += addRange("[", lowerCaseValue, " = ", toLowerCase(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLowerCase(attrValue), ", '-'))]");

				} else {
					xpath += addRange("[@", attrName, " = '", attrValue, "' or starts-with(@", attrName, ", '", attrValue, "-')]");
				}
				break;

			case "^=" :    //starts with
				if (ignoreCase) {
					xpath += addRange("[starts-with(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					xpath += addRange("[starts-with(@", attrName, ", '", attrValue, "')]");
				}
				break;

			case "$=" :    //ends with
				if (ignoreCase) {
					xpath += addRange("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = ", toLowerCase(attrValue), "]");

				} else {
					xpath += addRange("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = '", attrValue, "']");
				}
				break;

			case "*=" :    // contains within the string.
				if (ignoreCase) {
					xpath += addRange("[contains(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					xpath += addRange("[contains(@", attrName, ", '", attrValue, "')]");
				}
				break;

			default :
				break;
		}
		return xpath;
	}

	function processClass(attrName, attrValue, operation, ignoreCase, xpath) {
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
			xpath += addRange("[not(", attrName, ") or not(", getClass(attrName, attributeValue), ")]");

		} else if (operation === "|=") {
			const attrValue1 = ignoreCase ? toLowerCase(' ' + attrValue + ' ') : "' " + attrValue + " '";
			const attrValue2 = ignoreCase ? toLowerCase(' ' + attrValue + '-') : "' " + attrValue + "-'";

			xpath += addRange("[", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "]");

		} else {
			xpath += addRange("[", getClass(attrName, attributeValue), "]");
		}
		return xpath;
	}

	function addRange() {
		let str = '';
		for (let i = 0; i < arguments.length; i++) {
			str += arguments[i];
		}
		return str;
	}

	function getClass(attrName, attributeValue) {
		if (opt.normalizeClassSpaces) {
			return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;

		} else {
			return `contains(${attrName}, ${attributeValue})`;
		}
	}

	function processPseudoSelector(name, arg, xpath) {
		let result, owner, str2;

		switch (name) {
			case "contains" :
				xpath += addRange("[contains(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "icontains" :
				xpath += addRange("[contains(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
				break;

			case "empty" :
				xpath += "[not(*) and not(text())]";
				break;

			case "first-child" :
				xpath += "[not(preceding-sibling::*)]";
				break;

			case "first" :
				xpath += "[1]";
				break;

			case "first-of-type" :
				owner = getOwner(xpath, name);
				//xpath += addRange("[name(preceding-sibling::", owner, ") != name()]");
				xpath += addRange("[not(preceding-sibling::", owner, ")]");
				break;

			case "gt" :
				xpath += addRange("[position() > ", parseNumber(arg), "]");
				break;

			case "lt" :
				xpath += addRange("[position() < ", parseNumber(arg), "]");
				break;

			case "eq" :
			case "nth" :
				xpath += addRange("[", parseNumber(arg), "]");
				break;

			case "last-child" :
				xpath += "[not(following-sibling::*)]";
				break;

			case "only-child" :
				xpath += "[not(preceding-sibling::*) and not(following-sibling::*)]";
				break;

			case "only-of-type" :
				owner = getOwner(xpath, name);
				xpath += addRange("[count(preceding-sibling::", owner, ") = 0 and count(following-sibling::", owner, ") = 0]");
				//xpath += addRange("[name(preceding-sibling::", owner, ") != name() and name(following-sibling::", owner, ") != name()]");
				break;

			case "text" :
				xpath += "[@type='text']";
				break;

			case "starts-with" :
				xpath += addRange("[starts-with(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "istarts-with" :
				xpath += addRange("[starts-with(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
				break;

			case "ends-with" :
				str2 = normalizeArg(name, arg);
				xpath += addRange("[substring(normalize-space(), string-length(normalize-space()) - string-length(", str2, ") + 1) = ", str2, "]");
				break;

			case "iends-with" :
				str2 = normalizeArg(name, arg);
				xpath += addRange("[substring(", toLowerCase(), ", string-length(normalize-space()) - string-length(", str2, ") + 1) = ", toLowerCase(str2, false), "]");
				break;

			case "not" :
				const axis = isOwnerUniversalSelector(xpath) ? "self::" : "";
				combined += xpath;
				xpath += addRange("[not(", parseNested(normalizeArg(name, arg, false), axis, "self::node()", { type : 'not' }), ")]");
				break;

			case "is" :
				combined += xpath;
				result = parseNested(normalizeArg(name, arg, false), "self::", "self::node()", { type : 'is' });
				xpath += addRange("[", result, "]");
				break;

			case "has" :
				combined += xpath;
				result = parseNested(normalizeArg(name, arg, false), ".//");
				xpath += addRange("[count(", result, ") > 0]");
				break;

			case "has-sibling" :
				result = parseNested(normalizeArg(name, arg, false));
				xpath += addRange("[count(preceding-sibling::", result, ") > 0 or count(following-sibling::", result, ") > 0]");
				break;

			case "has-parent" :
				combined += xpath;
				xpath += addRange("[count(parent::", parseNested(normalizeArg(name, arg, false)), ") > 0]");
				break;

			case "has-ancestor" :
				combined += xpath;
				xpath += addRange("[count(ancestor::", parseNested(normalizeArg(name, arg, false)), ") > 0]");
				break;

			case "last" :
				xpath += "[last()]";
				break;

			case "last-of-type" :
				owner = getOwner(xpath, name);
				//xpath += addRange("[name(following-sibling::", owner, ") != name()]");
				xpath += addRange("[not(following-sibling::", owner, ")]");
				break;

			case "skip" :
				xpath += addRange("[position() > ", parseNumber(arg), "]");
				break;

			case "skip-first" :
				xpath += "[position() > 1]";
				break;

			case "skip-last" :
				xpath += "[position() < last()]";
				break;

			case "limit" :
				xpath += addRange("[position() <= ", parseNumber(arg), "]");
				break;

			case "range" :
				var splits = arg.split(',');

				if (splits.length != 2) argumentException(pseudo + name + "(,)' requires two numbers");

				const start = parseNumber(splits[0]);
				const end = parseNumber(splits[1]);

				if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");

				xpath += addRange("[position() >= ", start, " and position() <= ", end, "]");
				break;

			case "target" :
				xpath += "[starts-with(@href, '#')]";
				break;

			case "disabled" :
				xpath += "[@disabled]";
				break;

			case "enabled" :
				xpath += "[not(@disabled)]";
				break;

			case "checked" :
				xpath += "[@checked]";
				break;

			default :
				parseException(pseudo + name + "' is not implemented");
		}
		return xpath;
	}

	function processNth(name, arg, xpath, predicate) {
		if ( !arg) argumentException("argument is empty or white space");
		arg = arg.replace(/\s+/g, '');

		if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg.replace(/^\+/, ''))) {
			warning += pseudo + name + '\' with these parameters yield no matches';
			argumentException(warning);
		}

		let owner;
		switch (name) {
			case "nth-child" :
				xpath = addNthXpath(name, arg, xpath, 'preceding', '*', { child : 'nth' }, predicate);
				return xpath;

			case "nth-last-child" :
				xpath = addNthXpath(name, arg, xpath, 'following', '*', { child: 'nth-last', last : true }, predicate);
				return xpath;

			case "nth-of-type" :
				owner = getOwner(xpath, name);
				xpath = addNthXpath(name, arg, xpath, 'preceding', owner, { type: 'nth-of' }, predicate);
				return xpath;

			case "nth-last-of-type" :
				owner = getOwner(xpath, name);
				xpath = addNthXpath(name, arg, xpath, 'following', owner, { type: 'nth-last-of', last : true }, predicate);
				return xpath;

			default :
				parseException(pseudo + name + "' is not implemented");
		}
		return xpath;
	}

	function processNth(name, arg, xpath, predicate) {
		if ( !arg) argumentException("argument is empty or white space");
		arg = arg.replace(/\s+/g, '');

		if (/^(?:-?0n?|-n(?:[+-]0|-\d+)?|(?:0|-\d+)n(?:-\d+)?|(?:0|-\d+)n\+0)$/.test(arg.replace(/^\+/, ''))) {
			warning += pseudo + name + '\' with these parameters yield no matches';
			argumentException(warning);
		}

		let owner;
		switch (name) {
			case "nth-child" :
				xpath = addNthXpath(name, arg, xpath, 'preceding', '*', { child : 'nth' }, predicate);
				return xpath;

			case "nth-last-child" :
				xpath = addNthXpath(name, arg, xpath, 'following', '*', { child: 'nth-last', last : true }, predicate);
				return xpath;

			case "nth-of-type" :
				owner = getOwner(xpath, name);
				xpath = addNthXpath(name, arg, xpath, 'preceding', owner, { type: 'nth-of' }, predicate);
				return xpath;

			case "nth-last-of-type" :
				owner = getOwner(xpath, name);
				xpath = addNthXpath(name, arg, xpath, 'following', owner, { type: 'nth-last-of', last : true }, predicate);
				return xpath;

			default : break;
		}
		return xpath;
	}

	function addNthXpath(name, arg, xpath, sibling, owner, pseudo, predicate) {
		let str = '';

		if (isNumber(arg)) {
			return xpath += addRange("[(count(", sibling, "-sibling::", owner, ") + 1) = ", arg, "]");
		}
		switch (arg) {
			case "odd" :
				return xpath += addRange("[(count(", sibling, "-sibling::", owner, ") + 1) mod 2 = 1]");

			case "even" :
				return xpath += addRange("[(count(", sibling, "-sibling::", owner, ") + 1) mod 2 = 0]");

			default :
				const obj = pseudo.last ? parseFnNotationOfLast(arg) : parseFnNotation(arg);

				if (obj.valueA) {
					const num = getNumber(obj.valueB);

					if (obj.type === 'mod') str += addRange("[(count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");
					else if (predicate) {
						if (obj.type === 'pos') str += addRange("[(count(", sibling, "-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, "]");
						else if (obj.type === 'both') str += addRange("[(count(", sibling, "-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, " and (count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");

					} else {
						if (obj.type === 'pos') str += addRange("[position()", obj.comparison, obj.posValue, "]");
						else if (obj.type === 'both') str += addRange("[position()", obj.comparison, obj.posValue, " and (count(", sibling, "-sibling::", owner, ")", num, ") mod ", obj.valueA, " = 0]");
					}

				} else {
					if (predicate) {
						str += addRange("[(count(preceding-sibling::", owner, ") + 1)", obj.comparison, obj.posValue, "]");

					} else {
						str += addRange("[position()", obj.comparison, obj.posValue, "]");
					}
				}
		}

		if ( !predicate && str.length > 0 && pseudo.child) {
			return addChild(name, str, xpath);
		}
		return xpath += str;
	}

	function addChild(name, str, xpath) {
		const owner = getFullOwner(xpath, name);

		if (owner) {
			xpath = xpath.replace(/[^/]+$/, '');
		}
		xpath += '*' + str + (owner !== 'self::node()' ? "/self::" + owner : '/self::*');
		return xpath;
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
				valueA = GetValue(rm[1], rm[2], 1),
				valueB = GetValue(rm[3], rm[4], 0),
				comparison = valueA === 0 ? " = " : minus ? " <= " : " >= ",
				absA = Math.abs(valueA);

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
				valueA = GetValue(rm[1], rm[2], 1),
				valueB = GetValue(rm[3], rm[4], 0),
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
			//console.log(valueA, absA, valueB, posValue, comparison, type );

			return { valueA : absA, valueB, posValue, comparison, type };
		}
		regexException(0, "parseFnNotationOfLast", nthEquationReg, argument);
	}

	function isPresent(arg) {
		return typeof arg !== 'undefined';
	}

	function GetValue(sign, num, defaultVal) {
		const minus = sign && sign === '-' ? '-' : '';
		return typeof num !== 'undefined' ? +(minus + num) : defaultVal;
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

	function getTagName(i, xpath) {
		tagNameReg.lastIndex = i;
		const rm = tagNameReg.exec(code);

		if (rm !== null) {
			xpath += rm[0].toLowerCase();
			return [i + rm[0].length - 1, xpath];
		}
		regexException(i, 'getTagName', tagNameReg, code);
	}

	function getName(i, reg, xpath) {
		reg.lastIndex = i;
		const rm = reg.exec(code);

		if (rm !== null) {
			xpath += rm[0];
			return [i + rm[0].length - 1, xpath];
		}
		regexException(i, 'getName', reg, code);
	}

	function getPseudoSelector(i) {
		pseudoSelectorReg.lastIndex = i;
		const rm = pseudoSelectorReg.exec(code);

		if (rm !== null) {
			const name = rm[1];

			if (typeof rm[2] !== 'undefined') {
				const obj = findArgument(i + rm[0].length - 1, code, '(', ')');
				if (obj) {
					return { index : obj.index, pseudoName : name, argument : obj.argument };
				}
			}
			return { index : i + rm[0].length - 1, pseudoName : name, argument : '' };
		}
		regexException(i, 'getPseudoSelector', pseudoSelectorReg, code);
	}

	function isOwnerUniversalSelector(xpath) {
		let index = 0,
			num = 10;
		while (--num > 0) {
			const rm = selectorOwnerReg.exec(xpath);
			if (rm !== null) {
				if (rm[0] === "*") return true;
				else if (typeof rm[1] !== 'undefined') {
					index = findBracketStart(xpath, '[', ']');
					if (index === -1) break;

					xpath = xpath.substring(0, index);
				}
			}
		}
		return false;
	}

	function getFullOwner(xpath, name) {
		const index = xpath.lastIndexOf('/');
		if (index === -1) return xpath;
		return xpath.substring(index + 1);
	}

	function getOwner(xpath, name) {
		let str = xpath === 'self::node()' ? combined : xpath,
			owner = '',
			index = 0,
			num = 10;

		while (--num > 0) {
			const rm = selectorOwnerReg.exec(str);
			if (rm !== null) {
				if (typeof rm[1] !== 'undefined') {
					index = findBracketStart(str, '[', ']');

					if (index > -1) {
						str = str.substring(0, index);

					} else break;

				} else {
					owner = rm[0];
					break;
				}
			}
		}

		if (owner) {
			//if (name && owner == "*") warning += "The universal selector with pseudo-class ':" + name + "' is not work correctly ";
			if (name && owner == "*") parseException("Pseudo-class ':" + name + "' is required element name to work correctly; '*' is not implemented.");
			return owner;
		}
		return '';
	}

	function getAttributeName(i) {
		attrNameReg.lastIndex = i;
		const rm = attrNameReg.exec(code);

		if (rm !== null) {
			const name = rm[0].replace("|", ":").toLowerCase();
			return { index : i + rm[0].length - 1, attrName : name };
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

			return { index : i + rm[0].length - 1, attrValue : value, modifier : rm[4] };
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

	function findBracketStart(text, open, close) {
		let n = 0;

		for (let r = text.length - 1; r >= 0; r--) {
			if (text[r] === close) n++;
			else if (text[r] === open && --n === 0) return r;
		}
		return -1;
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

	function nextCharIsNotWhiteSpace(i) {
		return i + 1 < length && !/\s/.test(code[i + 1]);
	}

	function nextChar(i, ch) {
		return i + 1 < length && code[i + 1] === ch;
	}

	function isLetter(ch) {
		return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z';
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
		const text = message + " function - RegExp failed to match the string:\n<b>\'" + code.substring(i) + "'</b>\n" + reg;
		printError(text);
		message += " function - RegExp failed to match the string:\n'" + code.substring(i) + "'\n" + reg;
		throw new Error(message);
	}

	return convertToXPath;
});























