
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
		["li !> ul", "parent"],
		["div + p", "adjacent following sibling"],
		["div !+ p", "adjacent preceding sibling"],
		["div ^ p", "first child"],
		["div !^ p", "last child"],
		["div ~ p", "following sibling"],
		["div !~ p", "preceding sibling"],
		["div ! p", "ancestors"],

		["$$Class attribute", ""],
		["div.content", "contains class"],
		["div[class='content']", "contains exactly"],
		["div[class='content' i]", "ignore case"],
		["div[class^='cont']", "starts with"],
		["div[class$='tent']", "ends with"],
		["div[class~='content']", "contains exactly"],
		["div[class*='ten']", "contains within"],
		["div[class|='content']", "exactly or followed by a hyphen"],

		["$$Attributes", ""],
		["section[title^='Item']", "starts with"],
		["section[title$='one']", "ends with"],
		["section[title*='item']", "contains within"],
		["div[lang|=EN]", "exactly or followed by a hyphen"],
		["a[xlink|href]", "select attribute with namespace"],

		["$$Attributes ignore case", "https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors"],
		["section[title='one' i]", ""],
		["section[title^='item' i]", ""],
		["section[title$='one' i]", ""],
		["section[title~='two' i]", ""],
		["section[title*='twenty' i]", ""],
		["div[lang|=En i]", ""],

		["$$Pseudo-classes", ""],
		["div:not(.c1, .c2)", ""],
		["div:has(h1, h2)", ""],
		["a:is([name],[href])", ""],
		[":is(ol, ul) :is(ol, ul) ol", ""],
		["div:has-sibling(p)", ""],
		["div:has-parent(main)", ""],
		["div:has-ancestor(main)", ""],
		["ul>li:range(2, 5)", ""],
		["div:contains('Test')", ""],
		["div:icontains('content')", ""],
		["div:starts-with(Test)", ""],
		["div:istarts-with('TEST')", ""],
		["p:ends-with('test')", ""],
		["p:iends-with('TEST')", ""],
		["div:empty", ""],
		["ul>li:first", ""],
		["ul>li:last", ""],
		["div:first-child", ""],
		["div:last-child", ""],
		["div>*:only-child", ""],
		["li:gt(4)", ""],
		["li:lt(4)", ""],
		["li:eq(4)", ""],
		["li:skip(4)", ""],
		["li:skip-first", ""],
		["li:skip-last", ""],
		["li:limit(5)", ""],
		[":root", ""],

		["$$Pseudo-classes 'nth'", ""],
		["li:nth(5)", ""],
		["li:nth-child(3)", ""],
		["li:nth-child(odd)", ""],
		["li:nth-child(even)", ""],
		["li:nth-child(3n+2)", ""],
		["p:nth-last-child(3n+2)", ""],
		["p:nth-last-child(-3n+2)", ""],

		["$$Pseudo-classes 'of-type'", ""],
		["div p:first-of-type", ""],
		["div>em:last-of-type", ""],
		["div p:only-of-type", ""],
		["li:nth-of-type(3)", ""],
		["li:nth-of-type(odd)", ""],
		["li:nth-of-type(even)", ""],
		["li:nth-of-type(3n+2)", ""],
		["li:nth-of-type(-3n+2)", ""],
		["p:nth-last-of-type(3n+2)", ""],

		["$$Spaces, comments", ""],
		["ul   >   li:  not (  .c1  )", ""],
		["li:  nth-child  (  -3n  +  4  )   ", ""],
		[`!> ul:first /*direct parent*/
	!^   li      /*last child*/
	!+   li  /*previous siblings*/`, ""],
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
		printError : (message) => results.innerHTML = message
	};

	function initConverter() {
		setExamples();
		runTests();
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

		const { xpath, css, warning } = convertToXPath(selector, options);
		xpathEditor.updateCode(browserUse.checked ? '$x("' + xpath + '")' : xpath);

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
		const section = document.getElementById('example');
		const sb = [];
		sb.push('<table><thead><tr><td>Description</td><td>CSS</td><td>XPath</td></tr></thead><tbody>');

		selectors.forEach(item => {
			if (/^\$\$/.test(item[0])) {
				const title = item[0].substring(2);
				sb.push('<tr class="group"><td id="', title.replace(/\W+/g, '_').toLowerCase(), '">', title, '</td><td></td><td></td></tr>');

			} else {
				try {
					let { xpath } = convertToXPath(item[0], options);
					xpath = xpath.replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g, 'ABC...').replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g, 'abc...');
					sb.push('<tr><td class="name">', (item[1] || ' - '), '</td>');
					sb.push('<td class="css"><code class="css" data-selector="', item[0], '">', item[0].replace(/ +/g, '&nbsp;'), '</code></td>');
					sb.push('<td><code class="xpath">', xpath, '</code></td></tr>');

				} catch (e) {
					console.log(item[0], e);
				}
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
