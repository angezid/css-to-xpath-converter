/**
* A javascript version of
* @see {@link https://github.com/angezid/FastHtml/blob/master/src/FastHtml/CssToXpathConverter.cs} class
* ported by angezid.
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

	const idReg = /[a-zA-Z][\w_-]*/y;

	const classReg = /[a-zA-Z][\w_-]*/y;

	const pseudoSelectorReg = /([a-z-]+)([(])?/y;

	const nthEquationReg = /^(-)?([0-9]+)?n?(?:\s*([+-])\s*([0-9]*))?$/;

	const selectorOwnerReg = /(?:\b[a-zA-Z][a-zA-Z0-9_-]*|\*|(\]))$/;

	const attrNameReg = /(?:[a-zA-Z]+\|)?(?:\*(?=(?:[~^|$!]?=)|\])|[\w]+(?=(?:[~^|$!*]?=)|\]))/y;

	const attributeReg = /(\*|[\w:-]+)/y;

	const attrValueReg = /(?:"([^"]+)"|'([^']+)'|([^ "'\]]+))(?: +([si]))?(?=\])/y;

	const State = Object.freeze({ "Text" : 0, "PseudoSelector" : 1, "AttributeName" : 2, "AttributeValue" : 3 });

	let fastHtml = true, uppercase = '', lowercase = '', resultBox, stack, code, length;

	const leftChars = ",>+=~^:([";
	const rightChars = ",>+=~|^$!]()";
	const pseudo = "Pseudo selector ':";

	let combined;

	function convertToXPath(selector, axis) {
		combined = '';

		fastHtml = document.getElementById('fastHtmlLibrary').checked;

		resultBox = document.getElementById('result-box');
		resultBox.innerHTML = '';

		if (isNullOrWhiteSpace(selector)) {
			argumentException("selector is null or white space");
		}

		var upper = document.getElementById('uppercase'),
			lower = document.getElementById('lowercase');

		uppercase = upper.value.trim();
		lowercase = lower.value.trim();

		if (uppercase.length != lowercase.length) {
			argumentException("Custom upper and lower case letters have different length");
		}

		stack = [];

		const normalized = normalizeWhiteSpaces(selector);
		const xpath = parse(normalized, axis, null);

		return xpath;
	}

	function parseNested(selector, axis = "", owner = null) {
		stack.push(code);

		const xpath = parse(selector, axis, owner, true);

		code = stack.pop();
		length = code.length;

		return xpath;
	}

	function parse(selector, axis, owner, nested = false) {
		if ( !selector) {
			argumentException("selector is empty or white space");
		}

		const sb = [];

		let attrName = null,
			attrValue = null,
			modifier = null,
			operation = null,
			state = State.Text,
			check = false,
			first = true,
			slash = "",
			i = -1,
			ch;

		code = selector;
		length = code.length;

		if (axis) sb.push(axis);

		if (/^[,|]/.test(code)) {
			characterException(code[0], 0, "State.Text");
		}

		while (++i < length) {
			ch = code[i];

			if (state === State.Text) {
				if (check && !".#*:[@".includes(ch) && !isLetter(ch)) {
					characterException(ch, i, "State." + getState(state) + ", check=" + check);
				}

				if (first) first = false;
				else slash = "/";

				switch (ch) {
					case '.' :
						addOwner(owner, sb);
						sb.push('[');
						do {
							sb.push(fastHtml ? "contains(@class, ' " : "contains(concat(' ', normalize-space(@class), ' '), ' ");
							i = getName(i + 1, classReg, sb);

							tagNameReg.lastIndex = i + 2;
							if (nextChar(i, '.') && tagNameReg.test(code)) {
								sb.push(" ') and ");

							} else break;
						} while (++i < length);

						sb.push(" ')]");
						check = false;
						break;

					case '#' :
						addOwner(owner, sb);
						sb.push("[@id='");
						i = getName(i + 1, idReg, sb);
						sb.push("']");
						check = false;
						break;

					case '>' :
						console.log(axis, slash  );
						sb.push(slash);
						//sb.push('/');
						check = true;
						break;

					case '+' :
						sb.push(slash, "following-sibling::*[1]/self::");
						check = true;
						break;

					case '~' :
						sb.push(slash, "following-sibling::");
						check = true;
						break;

					case '^' :    // first child
						sb.push(slash, "child::*[1]/self::");
						check = true;
						break;

					case '!' :
						if (nextChar(i, '^')) {    // last child
							sb.push(slash, "child::*[last()]/self::");

						} else if (nextChar(i, '+')) {    // adjacent preceding sibling
							sb.push(slash, "preceding-sibling::*[1]/self::");

						} else if (nextChar(i, '>')) {    // direct parent
							sb.push(slash, "parent::");

						} else if (nextChar(i, '~')) {    // preceding sibling
							sb.push(slash, "preceding-sibling::");

						} else {
							sb.push(slash, "ancestor-or-self::");    // ancestors
						}
						check = true;
						i++;
						break;

					case '[' :
						addOwner(owner, sb);
						attrName = null;
						attrValue = null;
						modifier = null;
						operation = null;
						state = State.AttributeName;
						break;

					case ':' :
						addOwner(owner, sb);
						if (nextChar(i, ':')) i++;
						state = State.PseudoSelector;
						break;

					case ',' :
						if (i + 1 >= length) parseException('Unexpected comma');
						sb.push(" | ", axis);
						check = true;
						break;

					case '@' :
						i = parseAttribute(i, axis, nested, sb);
						check = false;
						break;

					case '*' :
						sb.push("*");
						check = false;
						break;

					case ' ' :
						sb.push("//");
						check = true;
						break;

					case '|' :
						if(/\*$/.test(sb[sb.length-1])) {
							parseException("XPath doesn't support '*' as a namespace.");
						}
						sb.push(":");
						check = false;
						break;

					case '\\' :
						if (nextCharIsNotWhiteSpace(i)) i++;
						break;

					default :
						if (isLetter(ch)) {
							i = getTagName(i, owner, sb);

						} else {
							characterException(ch, i, "State." + getState(state));
						}
						check = false;
						break;
				}

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
							parseException("XPath doesn't support '*' as a namespace.");

						} else {
							characterException(ch, i, "State." + getState(state));
						}
						break;

					case ']' :
						if (attrName === null) nullException("attrName");

						sb.push("[@", attrName, "]");
						state = State.Text;
						check = false;
						break;

					case ' ' : break;

					default :
						let obj = getAttributeName(i);
						i = obj.index;
						attrName = obj.attrName;
						break;
				}

			} else if (state === State.AttributeValue) {
				switch (ch) {
					case ']' :
						if (attrName === null) nullException("attrName");
						if (attrValue === null) nullException("attrValue");

						processAttribute(attrName, attrValue, operation, modifier, sb);

						state = State.Text;
						check = false;
						break;

					case '=' :
						characterException(ch, i, "State." + getState(state));
						break;

					case ' ' : break;

					default :
						if (attrValue != null) {
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

				let obj = getSeudoSelector(i);
				i = obj.index;
				pseudoName = obj.pseudoName;
				argument = obj.argument;

				if (pseudoName === "root") {
					sb.push("[ancestor-or-self::*[last()]]");

				} else {
					addOwner(owner, sb);
					processPseudoSelector(pseudoName, argument, sb);
				}

				state = State.Text;
				check = false;
			}
		}

		const xpath = sb.join('');

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

	function addOwner(owner, sb) {
		const str = sb.join(''),
			len = str.length;
		let result = '';

		if (len == 0) {
			result = owner != null ? owner : "*";

		} else {
			const c = str[len-1];

			if (owner != null) {
				if (c == '|') result = owner;
				else if (c == ':') result = "*";

			} else if (c == ':' || c == '/' || c == '|') result = "*";
		}
		sb.push(result);
	}

	function parseAttribute(i, axis, nested, sb) {
		const str = sb.join('');

		if (str.length === 0) {
			if ( !nested) sb.push(axis);

		} else {
			const ch = str[str.length - 1];
			if (ch != ':' && ch != '/') sb.push("/");
		}
		sb.push('@');

		const rm = attributeReg.exec(code.substring(i + 1));
		if (rm !== null) {
			sb.push(rm[0]);
			return i + rm[0].length;
		}

		regexException(i, 'parseAttribute', attributeReg, code);
	}

	function processAttribute(attrName, attrValue, operation, modifier, sb) {
		const ignoreCase = modifier === "i",
			lowerCaseValue = ignoreCase ? toLowerCase("@" + attrName, false) : null;

		if (attrName === "class") {
			processClass(attrName, attrValue, operation, ignoreCase, sb);
			return;
		}

		switch (operation) {
			case "=" :
				if (ignoreCase) {    // equals
					sb.push("[", lowerCaseValue, " = ", toLowerCase(attrValue), "]");

				} else {
					sb.push("[@", attrName, " = '", attrValue, "']");
				}
				break;

			case "!=" :
				if (ignoreCase) {    // not have or not equals
					sb.push("[not(@", attrName, ") or ", lowerCaseValue, " != ", toLowerCase(attrValue), "]");

				} else {
					sb.push("[not(@", attrName, ") or @", attrName, " != '", attrValue, "']");
				}
				break;

			case "~=" :    // exactly contains
				if (ignoreCase) {
					sb.push("[contains(concat(' ', normalize-space(", lowerCaseValue, "), ' '), concat(' ', ", toLowerCase(attrValue), ", ' '))]");

				} else {
					sb.push("[contains(concat(' ', normalize-space(@", attrName, "), ' '), ' ", attrValue, " ')]");
				}
				break;

			case "|=" :    // equals or starts with immediately followed by a hyphen
				if (ignoreCase) {
					sb.push("[", lowerCaseValue, " = ", toLowerCase(attrValue), " or starts-with(", lowerCaseValue, ", concat(", toLowerCase(attrValue), ", '-'))]");

				} else {
					sb.push("[@", attrName, " = '", attrValue, "' or starts-with(@", attrName, ", '", attrValue, "-')]");
				}
				break;

			case "^=" :    //starts with
				if (ignoreCase) {
					sb.push("[starts-with(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					sb.push("[starts-with(@", attrName, ", '", attrValue, "')]");
				}
				break;

			case "$=" :    //ends with
				if (ignoreCase) {
					sb.push("[substring(", lowerCaseValue, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = ", toLowerCase(attrValue), "]");

				} else {
					sb.push("[substring(@", attrName, ", string-length(@", attrName, ") - (string-length('", attrValue, "') - 1)) = '", attrValue, "']");
				}
				break;

			case "*=" :    // contains within the string.
				if (ignoreCase) {
					sb.push("[contains(", lowerCaseValue, ", ", toLowerCase(attrValue), ")]");

				} else {
					sb.push("[contains(@", attrName, ", '", attrValue, "')]");
				}
				break;

			default :
				break;
		}
	}

	function processClass(attrName, attrValue, operation, ignoreCase, sb) {
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
			sb.push("[not(", attrName, ") or not(", getClass(attrName, attributeValue), ")]");

		} else if (operation === "|=") {
			const attrValue1 = ignoreCase ? toLowerCase(' ' + attrValue + ' ') : "' " + attrValue + " '";
			const attrValue2 = ignoreCase ? toLowerCase(' ' + attrValue + '-') : "' " + attrValue + "-'";

			sb.push("[", getClass(attrName, attrValue1), " or ", getClass(attrName, attrValue2), "]");

		} else {
			sb.push("[", getClass(attrName, attributeValue), "]");
		}
	}

	function getClass(attrName, attributeValue) {
		if (fastHtml) {
			return `contains(${attrName}, ${attributeValue})`;

		} else {
			return `contains(concat(' ', normalize-space(${attrName}), ' '), ${attributeValue})`;
		}
	}

	function processPseudoSelector(name, arg, sb) {
		let xpath, owner, str2;

		switch (name) {
			case "contains" :
				sb.push("[contains(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "icontains" :
				sb.push("[contains(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
				break;

			case "empty" :
				sb.push("[not(*) and not(normalize-space())]");
				break;

			case "first-child" :
				sb.push("[not(preceding-sibling::*)]");
				break;

			case "first" :
				sb.push("[1]");
				break;

			case "first-of-type" :
				owner = getOwner(sb, name);
				//sb.push("[name(preceding-sibling::", owner, ") != name()]");
				sb.push("[not(preceding-sibling::", owner, ")]");
				break;

			case "gt" :
				sb.push("[position() > ", parseNumber(arg), "]");
				break;

			case "lt" :
				sb.push("[position() < ", parseNumber(arg), "]");
				break;

			case "eq" :
			case "nth" :
				sb.push("[", parseNumber(arg), "]");
				break;

			case "last-child" :
				sb.push("[not(following-sibling::*)]");
				break;

			case "only-child" :
				sb.push("[not(preceding-sibling::*) and not(following-sibling::*)]");
				break;

			case "only-of-type" :
				owner = getOwner(sb, name);
				sb.push("[count(preceding-sibling::", owner, ") = 0 and count(following-sibling::", owner, ") = 0]");
				//sb.push("[name(preceding-sibling::", owner, ") != name() and name(following-sibling::", owner, ") != name()]");
				break;

			case "nth-child" :
			case "nth-of-type" :
			case "nth-last-of-type" :
				processNth(name, arg, sb);
				break;

			case "text" :
				sb.push("[@type='text']");
				break;

			case "starts-with" :
				sb.push("[starts-with(normalize-space(), ", normalizeArg(name, arg), ")]");
				break;

			case "istarts-with" :
				sb.push("[starts-with(", toLowerCase(), ", ", toLowerCase(normalizeArg(name, arg), false), ")]");
				break;

			case "ends-with" :
				str2 = normalizeArg(name, arg);
				sb.push("[substring(normalize-space(), string-length(normalize-space()) - string-length(", str2, ") + 1) = ", str2, "]");
				break;

			case "iends-with" :
				str2 = normalizeArg(name, arg);
				sb.push("[substring(", toLowerCase(), ", string-length(normalize-space()) - string-length(", str2, ") + 1) = ", toLowerCase(str2, false), "]");
				break;

			case "not" :
				combined += sb.join('');
				sb.push("[not(", parseNested(normalizeArg(name, arg, false), '', "self::node()"), ")]");
				break;

			case "has" :
				combined += sb.join('');
				xpath = parseNested(normalizeArg(name, arg, false), ".//");

				sb.push("[count(", xpath, ") > 0]");
				break;

			case "has-sibling" :
				xpath = parseNested(normalizeArg(name, arg, false));
				sb.push("[count(preceding-sibling::", xpath, ") > 0 or count(following-sibling::", xpath, ") > 0]");
				break;

			case "has-parent" :
				combined += sb.join('');
				sb.push("[count(parent::", parseNested(normalizeArg(name, arg, false)), ") > 0]");
				break;

			case "has-ancestor" :
				combined += sb.join('');
				sb.push("[count(ancestor::", parseNested(normalizeArg(name, arg, false)), ") > 0]");
				break;

			case "last" :
				sb.push("[last()]");
				break;

			case "last-of-type" :
				owner = getOwner(sb, name);
				//sb.push("[name(following-sibling::", owner, ") != name()]");
				sb.push("[not(following-sibling::", owner, ")]");
				break;

			case "skip" :
				sb.push("[position() > ", parseNumber(arg), "]");
				break;

			case "skip-first" :
				sb.push("[position() > 1]");
				break;

			case "skip-last" :
				sb.push("[position() < last()]");
				break;

			case "take" :
			case "limit" :
				sb.push("[position() <= ", parseNumber(arg), "]");
				break;

			case "range" :
				var splits = arg.split(',');

				if (splits.length != 2) argumentException(pseudo + name + "(,)' requires two numbers");

				const start = parseNumber(splits[0]);
				const end = parseNumber(splits[1]);

				if (start >= end) argumentException(pseudo + name + "(" + start + ", " + end + ")' have wrong arguments");

				sb.push("[position() >= ", start, " and position() <= ", end, "]");
				break;

			case "target" :
				sb.push("[starts-with(@href, '#')]");
				break;

			case "disabled" :
				sb.push("[@disabled]");
				break;

			case "enabled" :
				sb.push("[not(@disabled)]");
				break;

			case "checked" :
				sb.push("[@checked]");
				break;

			default :
				parseException(pseudo + name + "' is not implemented");
		}
	}

	function processNth(name, arg, sb) {
		switch (name) {
			case "nth-child" :
				if (isNumber(arg)) {
					sb.push("[(count(preceding-sibling::*) + 1) = ", arg, "]");
					break;
				}
				switch (arg) {
					case "odd" :
						sb.push("[(count(preceding-sibling::*) + 1) mod 2 = 1]");
						break;

					case "even" :
						sb.push("[(count(preceding-sibling::*) + 1) mod 2 = 0]");
						break;
					default :
						const obj = parseFunctionalNotation(arg);

						sb.push("[(count(preceding-sibling::*) + 1)", obj.comparison, obj.value, " and ((count(preceding-sibling::*) + 1) - ", obj.value, ") mod ", obj.modulo, " = 0]");
						break;
				}
				break;

			case "nth-of-type" :
				if (isNumber(arg)) {
					sb.push("[name(preceding-sibling::*[", arg, "]) != name() and name(preceding-sibling::*[", arg, "-1]) = name()]");
					break;
				}

				getOwner(sb, name);    // checks owner validity

				switch (arg) {
					case "odd" :
						sb.push("[position() mod 2 = 1]");
						break;
					case "even" :
						sb.push("[position() mod 2 = 0 and position() >= 0]");
						break;
					default :
						const obj = parseFunctionalNotation(arg);

						sb.push("[position()", obj.comparison, obj.value, " and (position() - ", obj.value, ") mod ", obj.modulo, " = 0]");
						break;
				}
				break;

			case "nth-last-of-type" :
				if (isNumber(arg)) {
					sb.push("[name(following-sibling::*[", arg, "]) != name() and name(following-sibling::*[", arg, "+1]) = name()]");
					break;
				}

				getOwner(sb, name);    // checks owner validity

				switch (arg) {
					case "odd" :
						sb.push("[position() mod 2 = 1]");
						break;
					case "even" :
						sb.push("[position() mod 2 = 0 and position() <= last()]");
						break;
					default :
						const obj = parseFunctionalNotation2(arg);

						sb.push("[position()", obj.comparison, obj.value, " and (position() + ", obj.value, ") mod ", obj.modulo, " = 0]");
						break;
				}
				break;

			default :
				break;
		}
	}

	function isNumber(arg) {
		return /^\d+$/.test(arg);
	}

	function parseFunctionalNotation(argument) {
		if ( !argument) argumentException("argument is empty or white space");

		const rm = nthEquationReg.exec(argument);    //@"^(-)?([0-9]+)?n?(?:\s*([+-])\s*([0-9]*))?$"
		if (rm !== null) {
			const comparison = typeof rm[1] !== 'undefined' ? " <= " : " >= ",
				modulo = typeof rm[2] !== 'undefined' ? rm[2] : '1',
				sign = typeof rm[3] !== 'undefined' && rm[3] === '-' ? '-' : '',
				value = typeof rm[4] !== 'undefined' ? sign + rm[4] : '0';

			return { value, comparison, modulo, sign };
		}
		regexException(0, "tryParseFunctionalNotation", nthEquationReg, argument);
	}

	function parseFunctionalNotation2(argument) {
		if ( !argument) argumentException("argument is empty or white space");

		const rm = nthEquationReg.exec(argument);    //@"^(-)?([0-9]+)?n?(?:\s*([+-])\s*([0-9]*))?$"
		if (rm !== null) {
			const comparison = typeof rm[1] !== 'undefined' ? " >= " : " <= ",
				modulo = typeof rm[2] !== 'undefined' ? rm[2] : '1',
				sign = typeof rm[3] !== 'undefined' && rm[3] === '-' ? '-' : '',
				value = typeof rm[4] !== 'undefined' ? sign + rm[4] : '0';

			return { value, comparison, modulo, sign };
		}
		regexException(0, "tryParseFunctionalNotation", nthEquationReg, argument);
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

	function getTagName(i, owner, sb) {
		tagNameReg.lastIndex = i;
		const rm = tagNameReg.exec(code);

		if (rm !== null) {
			if (owner === 'self::node()') sb.push('self::');

			sb.push(rm[0].toLowerCase());
			return i + rm[0].length - 1;
		}
		regexException(i, 'getTagName', tagNameReg, code);
	}

	function getName(i, reg, sb) {
		reg.lastIndex = i;
		const rm = reg.exec(code);

		if (rm !== null) {
			sb.push(rm[0]);
			return i + rm[0].length - 1;
		}
		regexException(i, 'getName', reg, code);
	}

	function getSeudoSelector(i) {
		pseudoSelectorReg.lastIndex = i;
		const rm = pseudoSelectorReg.exec(code);

		if (rm !== null) {
			const name = rm[1];
			let argument = '';

			if (typeof rm[2] !== 'undefined') {
				const obj = findArgument(i + rm[0].length - 1, code, '(', ')');
				if (obj !== null) {
					return { index : obj.index, pseudoName : name, argument : obj.argument };
				}
			}
			return { index : i + rm[0].length - 1, pseudoName : name, argument };
		}
		regexException(i, 'getSeudoSelector', pseudoSelectorReg, code);
	}

	function getOwner(sb, name) {
		let str = sb.join(''),
			owner = [],
			index = 0,
			num = 10;
		str = str === 'self::node()' ? combined : sb.join('');

		while (--num > 0) {
			const rm = selectorOwnerReg.exec(str);
			if (rm !== null) {
				if (typeof rm[1] !== 'undefined') {
					index = findBracketStart(str, '[', ']');

					if (index > -1) {
						owner.push(str.substring(index));
						str = str.substring(0, index);

					} else break;

				} else {
					if (owner.length || rm[0] !== "*") owner.push(rm[0]);
					else owner.push('self::' + rm[0]);
					break;
				}
			}
		}

		if (owner.length) {
			owner.reverse();
			return owner.join('');
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
				//if (unresolved && !rightChars.includes(ch) && !(ch === '*' && (nextChar(i, '=')) || /![>+^~]|[>+^~]/)) {
				//if (unresolved && !rightChars.includes(ch) && !(ch === '*' && (nextChar(i, '=')) || /!?[>+^~]/.test())) {
				//if (unresolved && !rightChars.includes(ch) && !(ch === '*' && (nextChar(i, '=')) || /[!>+^~]/.test(code[i + 1]))) {
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

	function printError(message) {
		resultBox.innerHTML = '<span class="errors">' + message + '</span>';
	}

	function nullException(message) {
		const text = 'Null exception of ' + message;
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
		const text = message + ". Unexpected character '<b>" + ch + "</b>' in the substring - <b>" + code.substring(i) + '</b>';
		printError(text);
		throw new Error(text);
	}

	function regexException(i, message, reg, code) {
		const text = message + " function - RegExp failed to match the string:\n<b>" + code.substring(i) + '</b>\n' + reg;
		printError(text);
		throw new Error(text);
	}

	return convertToXPath;
});























