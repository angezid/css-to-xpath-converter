
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));

	} else if (typeof exports === 'object') {
		module.exports = factory(root);

	} else {
		root.initConverter = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {
	'use strict';

	const selectors = [
		["$$Combinators", ""],
		["ul > li", "child"],
		["li !> ul", "parent", "0"],
		["div + p", "adjacent following sibling"],
		["div !+ p", "adjacent preceding sibling", "0"],
		["div ^ p", "first child"],
		["div !^ p", "last child", "0"],
		["div ~ p", "following sibling"],
		["div !~ p", "preceding sibling", "0"],
		["div ! p", "ancestors", "0"],

		["$$Class attribute", ""],
		["div.content", "contains class"],
		["div[class='content']", "contains exactly"],
		["div[class='content' i]", "ignore case", "1 2"],
		["div[class^='cont']", "starts with"],
		["div[class$='tent']", "ends with"],
		["div[class~='content']", "contains exactly"],
		["div[class*='ten']", "contains within"],
		["div[class|='content']", "exactly or followed by a hyphen"],

		["$$Attributes", ""],
		["section[title='Item']", "equal"],
		["section[title!='Item']", "not equals"],
		["section[title^='Item']", "starts with"],
		["section[title$='one']", "ends with"],
		["section[title*='item']", "contains within"],
		["div[lang|=EN]", "exactly or followed by a hyphen"],

		["$$Attributes ignore case", "https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors"],
		["section[title='one' i]", "", "1 2"],
		["section[title^='item' i]", "", "1 2"],
		["section[title$='one' i]", "", "1 2"],
		["section[title~='two' i]", "", "1 2"],
		["section[title*='twenty' i]", "", "1 2"],
		["div[lang|=En i]", "", "1 2"],

		["$$Pseudo-classes", ""],
		["div:not(.c1, .c2)", ""],
		["div:has(h1, h2)", ""],
		["div:has(.c1)", ""],
		["a:is([name],[href])", ""],
		[":is(ol, ul) :is(ol, ul) ol", ""],
		["div:has-sibling(p)", "", "0"],
		["div:has-parent(main)", "", "0"],
		["div:has-ancestor(main)", "", "0"],
		["li:range(2, 5)", "from n1 to n2 inclusive", "0"],
		["div:contains('Test')", "contains text", "0"],
		["div:icontains('content')", "", "0 2"],
		["div:starts-with(Test)", "", "0"],
		["div:istarts-with('TEST')", "", "0 2"],
		["p:ends-with('test')", "", "0"],
		["p:iends-with('TEST')", "", "0 2"],
		["ul>li:first", "the first element", "0"],
		["ul>li:last", "the last element", "0"],
		["li:nth(5)", "element equal to n", "0"],
		["li:eq(4)", "element equal to n", "0"],
		["li:gt(4)", "elements greater than n", "0"],
		["li:lt(4)", "elements lesser than n", "0"],
		["li:skip(4)", "skip elements lesser than n", "0"],
		["li:skip-first", "skips the first element", "0"],
		["li:skip-last", "skips the last element", "0"],
		["li:limit(5)", "from 1 to n inclusive", "0"],
		["div:empty", ""],
		[":checked", ""],
		[":enabled", ""],
		[":disabled", ""],
		[":target", ""],
		[":text", ""],

		["$$'-child'", ""],
		["li:first-child", ""],
		["li:last-child", ""],
		["p:only-child", ""],

		["$$'nth-child'", ""],
		["li:nth-child(3)", ""],
		["li:nth-child(odd)", ""],
		["li:nth-child(even)", ""],
		["li:nth-child(3n+2)", ""],

		["$$'nth-last-child'", ""],
		["li:nth-last-child(3)", ""],
		["li:nth-last-child(odd)", ""],
		["li:nth-last-child(even)", ""],
		["p:nth-last-child(3n+2)", ""],
		["p:nth-last-child(-3n+2)", ""],

		["$$'-of-type'", "", "Not works with universal selector '*'"],
		["div p:first-of-type", ""],
		["div>p:last-of-type", ""],
		["div p:only-of-type", ""],

		["$$':nth-of-type'", "", "Not works with universal selector '*'"],
		["li:nth-of-type(3)", ""],
		["li:nth-of-type(odd)", ""],
		["li:nth-of-type(even)", ""],
		["li:nth-of-type(3n+2)", ""],
		["li:nth-of-type(-3n+2)", ""],

		["$$':nth-last-of-type'", "", "Not works with universal selector '*'"],
		["li:nth-last-of-type(3)", ""],
		["li:nth-last-of-type(odd)", ""],
		["li:nth-last-of-type(even)", ""],
		["p:nth-last-of-type(3n+2)", ""],
		["p:nth-last-of-type(-3n+2)", ""],

		["$$Spaces, comments", ""],
		["ul   >   li:  not (  .c1  )", ""],
		["li:  nth-child  (  -3n  +  4  )   ", ""],
		[`!> ul:first /*direct parent*/
	!^   li      /*last child*/
	!+   li  /*previous siblings*/`, ""],

		["$$namespaces", "Not works in browsers", ""],
		["|*", "all elements without a namespace"],
		["*|*", "all elements"],
		["ns|*", "all elements in namespace ns"],
		["ns|p", ""],
		["div ns|p", ""],
		["div |*", ""],
		["div *|*", ""],
		["div ns|*", ""],
		["div ns|p", ""],
		["*:not(ns|p)", ""],
		["a[xlink|href='...']", "attributes with namespace"],
	];

	const settings = {
		selectors : [],
		lowercase : '',
		uppercase : '',

		save : function() {
			this.saveValue('selectors', JSON.stringify(settings));
		},

		load : function() {
			const str = this.loadValue('selectors');
			if (str) {
				const json = JSON.parse(str);
				if (json) {
					this.selectors = json.selectors;
				}
			}
		},

		loadValue : function(key) {
			try { return localStorage.getItem(key); } catch (e) { }
			return null;
		},

		saveValue : function(key, value) {
			try {
				if (value !== localStorage.getItem(key)) {
					localStorage.setItem(key, value);
				}
			} catch (e) { }
		}
	};

	const maxSaveNumber = 30,
		input = document.getElementById('input-box'),
		body = document.getElementsByTagName('body')[0],
		up = document.getElementById('up-btn'),
		down = document.getElementById('down-btn'),

		lowercase = document.getElementById('lowercase'),
		toLowercase = document.getElementById('to-lowercase'),
		uppercase = document.getElementById('uppercase'),
		toUppercase = document.getElementById('to-uppercase'),

		axesSelector = document.getElementById('axis'),
		browserUse = document.getElementById('browser-use'),
		results = document.getElementById('result-box'),
		warningBox = document.getElementById('warning-box'),
		copy = document.getElementById('copy-code'),
		convertButton = document.getElementById('convert'),
		fastHtml = document.getElementById('fast-html'),
		clearButton = document.getElementById('clear'),
		savedSelectors = document.getElementById('saved-selectors'),
		cssEditor = CodeJar(input, null, { tab : '  '	}),
		xpathEditor = CodeJar(results, null, { tab : '  ' });

	const options = {
		axis : '//',
		uppercaseLetters : '',
		lowercaseLetters : '',
		printError : (message) => results.innerHTML = '<span class="errors">' + message + '</span>'
	};

	function initConverter() {
		setExamples();
		settings.load();

		if (settings.selectors && settings.selectors.length) {
			updateSelectors();
			updateSelector(savedSelectors.value);
		}

		registerEvents();
		convert(true);
	}

	initConverter();

	function updateSelector() {
		try {
			const obj = JSON.parse(savedSelectors.value);
			if (obj) {
				cssEditor.updateCode(obj.selector);
				axesSelector.value = obj.axis || '//';
				uppercase.value = obj.uppercase || '';
				lowercase.value = obj.lowercase || '';
			}
		} catch (e) { }
	}

	function registerEvents() {
		savedSelectors.addEventListener('change', function(e) {
			updateSelector(this.value);

			setTimeout(function() {
				convert();
			}, 100);
		});

		input.addEventListener('paste', function(e) {
			setTimeout(function() {
				convert();
			}, 100);
		});

		browserUse.addEventListener('click', function() {
			convert();
		});

		fastHtml.addEventListener('click', function() {
			setExamples();
			convert();
		});

		copy.addEventListener('click', function() {
			document.getSelection().selectAllChildren(this.parentNode);
			document.execCommand('copy');
			document.getSelection().removeAllRanges();
		});

		axesSelector.addEventListener('change', function(e) {
			convert();
		});

		toLowercase.addEventListener('click', function() {
			const value = uppercase.value.trim();
			if (value) {
				lowercase.value = value.toLowerCase();
			}
		});

		toUppercase.addEventListener('click', function() {
			const value = lowercase.value.trim();
			if (value) {
				uppercase.value = value.toUpperCase();
			}
		});

		up.addEventListener('click', function() {
			window.scrollTo(0, 0);
		});

		down.addEventListener('click', function() {
			window.scrollTo(0, 5000);
		});

		convertButton.addEventListener('click', function() {
			convert();
		});

		clearButton.addEventListener('click', function() {
			cssEditor.updateCode('');
			xpathEditor.updateCode('');
			input.focus();
		});
	}

	function convert(notSave) {
		const selector = input.innerText.trim();
		if ( !selector) return;

		xpathEditor.updateCode('');
		warningBox.innerHTML = '';
		warningBox.className = 'hide';

		const axis = axesSelector.value;

		options.axis = axis;
		options.normalizeClassSpaces = !fastHtml.checked;
		options.browserUse = browserUse.checked;
		options.uppercaseLetters = uppercase.value.trim();
		options.lowercaseLetters = lowercase.value.trim();

		const { xpath, css, warning, error } = toXPath(selector, options);
		if (xpath) {
			xpathEditor.updateCode(browserUse.checked ? '$x("' + xpath + '")' : xpath);
		}

		if (warning) {
			warningBox.innerHTML = warning.trim();
			warningBox.className = '';
		}

		if (notSave) return;

		addSelector(css, axis);
		updateSelectors(true);
	}

	function addSelector(selector, axis) {
		selector = selector.replace(/'/g, '&#39;');
		settings.selectors = settings.selectors.filter(obj => obj.selector && obj.selector !== selector);

		const upper = uppercase.value.trim(),
			lower = lowercase.value.trim();

		settings.selectors.unshift({ selector, axis : axis, lowercase : lower, uppercase : upper });

		if (settings.selectors.length > maxSaveNumber) {
			settings.selectors.pop();
		}
	}

	function updateSelectors(save) {
		if (isChanged()) {
			let str = '';
			settings.selectors.forEach(obj => {
				if ( !obj.selector) return true;
				str += "<option value='" + JSON.stringify(obj) + "'>" + obj.selector + '</option>';
			});
			savedSelectors.innerHTML = str;
			settings.save();

		} else if (save) {
			settings.save();
		}
	}

	function isChanged() {
		const list = Array.from(savedSelectors.childNodes).filter(node => node.nodeType === 1);

		if (settings.selectors.length !== list.length) return true;

		return settings.selectors.some((obj, i) => list[i].getAttribute("value") !== JSON.stringify(obj).replace(/&#39;/g, "'"));
	}

	function setExamples() {
		const hrefs = ['<a href="#info-1">[1]</a> ', '<a href="#info-2">[2]</a> ', '<a href="#info-3">[3]</a> '];
		const section = document.getElementById('example');
		const sb = [];
		sb.push('<table><thead><tr><td>Description</td><td>CSS</td><td>XPath</td></tr></thead><tbody>');

		selectors.forEach(item => {
			if (/^\$\$/.test(item[0])) {
				const title = item[0].substring(2);
				sb.push('<tr class="group"><td id="', title.replace(/\W+/g, '_').toLowerCase(), '">', title, '</td><td>' + (item[1] || '')+ '</td><td><span class="example-info">' + (item[2] || '')+ '</span></td></tr>');

			} else {
				let href = item[2] ? item[2].split(' ').map(n => hrefs[n]).join('') : '';
				
				let { xpath, css, warning, error } = toXPath(item[0], options);
				if (xpath) {
					xpath = xpath.replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g, 'ABC...').replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g, 'abc...');
					sb.push('<tr><td class="name">', href, (item[1] || ' - '), '</td>');
					sb.push('<td class="css"><code class="css" data-selector="', item[0], '">', item[0].replace(/ +/g, '&nbsp;'), '</code></td>');
					sb.push('<td><code class="xpath">', xpath, '</code></td></tr>');
				}
				if (error) console.log(item[0], error);
			}
		});
		sb.push('</tbody></table>');
		section.innerHTML = sb.join('');

		section.querySelectorAll('code.css').forEach((elem) => {
			elem.addEventListener('click', function(e) {
				clearButton.click();
				const selector = this.getAttribute('data-selector');
				cssEditor.updateCode(selector);
			});
		});

		/*const codes = document.querySelectorAll('xpath');

		for (let i = 0; i < codes.length; i++) {
			hljs.highlightElement(codes[i]);
		}*/
	}
});
