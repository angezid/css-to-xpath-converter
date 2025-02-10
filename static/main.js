
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

	const exampleSelectors = [
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

		["$$Class, id", ""],
		["div.content", "contains class"],
		["#wrapper", "id"],

		["$$Class attribute", "Non-standard XPath behavior", "It deals with individual classes instead of the whole className string"],
		["div[class='content']", "contains class", "", "N"],
		["div[class!='content']", "not contains class", "", "N"],
		["div[class='content' i]", "contains class ignore case", "1 2 3", "N"],
		["div[class^='cont']", "class starts with", "", "N"],
		["div[class$='tent']", "class ends with", "", "N"],
		["div[class~='content']", "contains class", "", "N"],
		["div[class*='ten']", "contains class containing substring", "", "N"],
		["div[class|='content']", "contains exactly or followed by a hyphen", "", "N"],

		["$$Attributes", ""],
		["section[title='Section one']", "equal"],
		["section[title!='Section one']", "not equals", "1"],
		["section[title^='Sect']", "starts with"],
		["section[title$='two']", "ends with"],
		["section[title*='on on']", "contains within"],
		["*[lang|=EN]", "exactly or followed by a hyphen"],

		["$$Attributes ignore case", ""],
		["section[title='section one' i]", "", "1 2 3"],
		["section[title^='sect' i]", "", "1 2 3"],
		["section[title$='TWO' i]", "", "1 2 3"],
		["section[title~='One' i]", "", "1 2 3"],
		["section[title*='on On' i]", "", "1 2 3"],

		["$$Pseudo-classes", ""],
		["div:not(.toc)", ""],
		["div:not(:has(nav))", ""],
		["div:has(h1, h2)", ""],
		["div:has(.main)", ""],
		["a:is([name],[href])", ""],
		[":is(ol, ul) :is(ol, ul) ol", ""],
		["li:after(div)", "", "0"],
		["p:after-sibling(h1)", "", "0"],
		["a:before(h1)", "", "0"],
		["p:before-sibling(p.p2)", "", "0"],
		["div:has-sibling(footer)", "", "0"],
		["form:has-parent(nav)", "", "0"],
		["input:has-ancestor(nav)", "", "0"],
		["li:range(2, 5)", "from n1 to n2 inclusive", "0"],
		["p:contains('Test')", "contains text", "0"],
		["p:icontains('content')", "", "0 3"],
		["p:starts-with(Test)", "", "0"],
		["p:istarts-with('TEST')", "", "0 3"],
		["p:ends-with('tent.')", "", "0"],
		["p:iends-with('TENT.')", "", "0 3"],
		["ul>li:first", "the first element", "0"],
		["ul>li:last", "the last element", "0"],
		["li:nth(5)", "element equal to n", "0"],
		["li:eq(4)", "element equal to n", "0"],
		["li:gt(3)", "elements greater than n", "0"],
		["li:lt(4)", "elements lesser than n", "0"],
		["li:skip(4)", "skip elements lesser than n", "0"],
		["li:skip-first", "skips the first element", "0"],
		["li:skip-last", "skips the last element", "0"],
		["li:limit(5)", "from 1 to n inclusive", "0"],
		["*:empty", "empty elements"],
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
		["ul   >   li:not (  .c1  )", ""],
		["li:nth-child  (  -3n  +  4  )   ", ""],
		[`li !> ul:first /*direct parent*/
	!^   li      /*last child*/
	!+   li  /*previous siblings*/`, "A comments demo"],

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

	const classAttributes = [
		["$$Class attribute", "Standard XPath behavior", "It deals with the whole className string"],
		["div[class='content']", "className is equal"],
		["div[class='content' i]", "className is equal ignore case"],
		["div[class^='cont']", "className starts with"],
		["div[class$='tent']", "className ends with"],
		["div[class~='content']", "contains class; the same as 'div.content'"],
		["div[class*='ten']", "className contains within"],
		["div[class|='content']", "className is equal or followed by a hyphen"],
	];

	const settings = {
		selectors : [],
		useClassName : false,
		lowercase : '',
		uppercase : '',
		html : '',
		htmlBox : false,

		save : function() {
			this.saveValue('selectors', JSON.stringify(settings));
		},

		load : function() {
			const str = this.loadValue('selectors');
			if (str) {
				const json = JSON.parse(str);
				if (json) {
					this.selectors = json.selectors;
					this.html = json.html;
					this.htmlBox = json.htmlBox;
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

	const htmlUtil = {

		initHtmlEditor : function(elem) {
			const editor = CodeJar(elem, null, { tab : '  ' });
			editor.onUpdate((code, event) => this.updateTestEditor(code, event));
			return editor;
		},

		updateTestEditor : function(code, event) {
			if (event && (event.type === 'paste' || event.type === 'drop')) {
				//htmlEditor.textContent = this.sanitizeHtml(code);
				htmlEditor.textContent = code;
			}
			changed = true;
		}
	};

	const maxSaveNumber = 30,
		cssBox = document.getElementById('input-box'),
		body = document.getElementsByTagName('body')[0],
		up = document.getElementById('up-btn'),
		down = document.getElementById('down-btn'),

		lowercase = document.getElementById('lowercase'),
		toLowercase = document.getElementById('to-lowercase'),
		uppercase = document.getElementById('uppercase'),
		toUppercase = document.getElementById('to-uppercase'),

		axesSelector = document.getElementById('axis'),
		browserUse = document.getElementById('browser-use'),
		xpathBox = document.getElementById('xpath-box'),
		messageBox = document.getElementById('message-box'),
		copy = document.getElementById('copy-code'),
		convertButton = document.getElementById('convert'),
		clearButton = document.getElementById('clear'),
		savedSelectors = document.getElementById('saved-selectors'),
		runXPath = document.getElementById('run-xpath'),
		runCSS = document.getElementById('run-css'),
		htmlList = document.getElementById('html-list'),
		clearHtmlButton = document.getElementById('clear-html'),
		detailsHtmlBox = document.querySelector('details.html'),
		htmlBox = document.getElementById('html-box'),
		htmlEditor = htmlUtil.initHtmlEditor(htmlBox),
		cssEditor = CodeJar(cssBox, null, { tab : '  ' }),
		xpathEditor = CodeJar(xpathBox, null, { tab : '  ' });

	const options = {
		axis : './/',
		useClassName : false,
		uppercaseLetters : '',
		lowercaseLetters : '',
		printError : (message) => xpathBox.innerHTML = '<span class="errors">' + message + '</span>'
	};

	let changed = false,
		position = 0;

	function initConverter() {
		setExamples();
		buildHtmlSelector();
		settings.load();

		if (settings.selectors && settings.selectors.length) {
			updateSelectors();
			updateSelector(savedSelectors.value);
		}

		if (settings.html && settings.html.length) {
			htmlEditor.updateCode(settings.html);

			if (settings.htmlBox) {
				detailsHtmlBox.setAttribute('open', true);
			}
		}

		registerEvents();
		convert(true);
	}

	initConverter();

	function buildHtmlSelector() {
		let options = '<option value="">' + defaultHtmls['name'] + '</option>';

		for (const key in defaultHtmls) {
			if (key !== 'name') {
				let title = key.replace(/^[a-z]/, m => m.toUpperCase()).replace(/[a-z](?=[A-Z])/g, '$& ');
				title = title.replace(/( [A-Z])([a-z]+)/g, (m, gr1, gr2) => gr1.toLowerCase() + gr2);
				options += `<option value="${key}">${title}</option>`;
			}
		}
		htmlList.innerHTML = options;
	}

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

		htmlList.addEventListener('change', function(e) {
			const obj = defaultHtmls[this.value];

			if (obj) {
				htmlBox.focus();
				htmlEditor.updateCode(obj.content);
				htmlEditor.recordHistory();
			}
		});

		savedSelectors.addEventListener('change', function(e) {
			updateSelector(this.value);

			setTimeout(function() {
				convert();
			}, 100);
		});

		cssBox.addEventListener('paste', function(e) {
			setTimeout(function() {
				convert();
			}, 100);
		});

		browserUse.addEventListener('click', function() {
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
			const top = window.pageYOffset,
				bottom = top + screen.height - 150,
				offset = screen.height / 7;

			if (position < bottom && position > top) {    // within screen
				window.scrollTo(0, 10000);

			} else {
				window.scrollTo(0, position);
				window.scrollBy(0, -offset);
			}
		});

		convertButton.addEventListener('click', function() {
			convert();
		});

		detailsHtmlBox.addEventListener('toggle', function() {
			const attr = this.getAttribute('open');
			settings.htmlBox = attr !== null;
			changed = true;
			clearWarning();
			if (attr !== null) {
				htmlBox.focus();
				htmlEditor.recordHistory();
			}
			
			if (attr !== null && !htmlBox.textContent.trim()) {
				htmlBox.textContent = defaultHtmls['page'].content;
			}
		});

		runXPath.addEventListener('click', function() {
			let xpath = xpathBox.textContent.trim();

			if ( !xpath) {
				if ( !cssBox.textContent.trim()) return;

				convert();
				return;
			}
			highlightXPath(xpath);
		});

		runCSS.addEventListener('click', function() {
			highlightCSS();
		});

		clearButton.addEventListener('click', function() {
			cssEditor.updateCode('');
			xpathEditor.updateCode('');
			clearWarning();
			cssBox.focus();
			changed = true;
		});

		clearHtmlButton.addEventListener('click', function() {
			htmlEditor.updateCode('');
			htmlBox.focus();
			changed = true;
		});
	}

	function convert(notSave) {
		clearWarning();

		const selector = cssBox.textContent.trim();
		if ( !selector) return;

		xpathEditor.updateCode('');

		const axis = axesSelector.value;

		options.axis = axis;
		options.useClassName = false;
		options.browserUse = browserUse.checked;
		options.uppercaseLetters = uppercase.value.trim();
		options.lowercaseLetters = lowercase.value.trim();

		const { xpath, css, warning, error } = toXPath(selector, options);

		if (warning) {
			showWarning(warning);
		}

		if (xpath) {
			xpathEditor.updateCode(browserUse.checked ? '$x("' + xpath + '")' : xpath);
		}

		if (detailsHtmlBox.getAttribute('open') !== null && xpath) {
			highlightXPath(xpath);
		}

		settings.save();

		if ( !css || notSave) return;

		addSelector(css, axis);
		updateSelectors(true);
		return xpath;
	}

	function highlightXPath(xpath) {
		clearWarning();

		const { doc, htmlString, indexes } = parseHTML();
		if ( !doc) return;

		let node,
			iterator;

		try {
			iterator = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
		} catch (e) {
			showError(e);
			return;
		}

		const startIndexes = [];

		while ((node = iterator.iterateNext())) {
			for (let i = 0; i < indexes.length; i++) {
				if (node === indexes[i].node) {
					startIndexes.push(indexes[i].startIndex);
					break;
				}
			}
		}

		htmlEditor.updateCode(htmlString);
		highlightElements(startIndexes);
		settings.html = htmlString;
	}

	function highlightCSS() {
		clearWarning();

		const selector = cssBox.innerText.trim()
			if ( !selector) return;

		const { doc, htmlString, indexes } = parseHTML();
		if ( !doc) return;

		let nodes;
		try {
			nodes = doc.querySelectorAll(selector);
		} catch (e) {
			showError(e);
			return;
		}

		const startIndexes = [];

		for (let k = 0; k < nodes.length; k++) {
			for (let i = 0; i < indexes.length; i++) {
				if (nodes[k] === indexes[i].node) {
					startIndexes.push(indexes[i].startIndex);
					break;
				}
			}
		}
		htmlEditor.updateCode(htmlString);
		highlightElements(startIndexes);
		settings.html = htmlString;
	}

	function parseHTML() {
		let html = htmlBox.textContent;
		if ( !html.trim()) return {};

		const doc = new DOMParser().parseFromString(html, "text/html"),
			htmlString = doc.documentElement.outerHTML,
			indexes = findStartIndexes(doc, htmlString);

		return { doc, htmlString, indexes };
	}

	function highlightElements(startIndexes) {
		const length = startIndexes.length;
		showMessage('Count = ' + length);

		if ( !length) return;

		const instance = new Mark(htmlBox),
			tagReg = /<[A-Za-z][\w:-]*(?:[^>"']+|"[^"]*"|'[^']*')*>/y;
		let i = 0;
		tagReg.lastIndex = startIndexes[i];

		instance.unmark().markRegExp(tagReg, {
			acrossElements : true,
			each : () => {
				if (++i < length) {
					tagReg.lastIndex = startIndexes[i];
					//console.log(startIndexes[i], htmlBox.textContent.substr(startIndexes[i], 20));

				} else {
					tagReg.lastIndex = Infinity;
				}
			},
			done : (_, totalMatches) => {
				if (totalMatches !== length) {
					showMessage('Missing matches - ' + length + ' != ' + totalMatches);
				}
			}
		});

		const elem = htmlBox.querySelector('mark');
		if (elem) {
			//elem.scrollIntoView({ behavior: "smooth", block: "center" });
			elem.scrollIntoView({ block : "center" });
			//document.getElementById('demo')?.scrollIntoView({ behavior: "smooth" });
			document.getElementById('demo')?.scrollIntoView();
		}
	}

	function findStartIndexes(element, html) {
		const nodes = element.querySelectorAll('*');

		const startIndexes = [];
		let index = 0;

		nodes.forEach(node => {
			const outerHTML = node.outerHTML;
			const startIndex = html.indexOf(outerHTML, index);

			if (startIndex !== -1) {
				startIndexes.push({
					node : node,
					startIndex : startIndex
				});
				index = startIndex;
				//console.log(startIndex, htmlBox.textContent.substr(startIndex, 20));
			}
		});

		return startIndexes;
	}

	function showError(error) {
		messageBox.style.color = "red";
		messageBox.innerHTML = error.message;
		messageBox.className = '';
		console.error(error);
	}

	function showWarning(text) {
		messageBox.style.color = "red";
		messageBox.innerHTML = text.trim();
		messageBox.className = '';
	}

	function showMessage(text) {
		messageBox.style.color = "black ";
		messageBox.innerHTML = text;
		messageBox.className = '';
	}

	function clearWarning() {
		messageBox.innerHTML = '';
		messageBox.className = 'hide';
		new Mark(htmlBox).unmark();
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

	function updateSelectors(save) {    // TODO
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
		const section = document.getElementById('examples');
		section.innerHTML = buildTable(exampleSelectors, true);

		section.querySelectorAll('code.css').forEach((elem) => {
			elem.addEventListener('click', function(e) {
				clearButton.click();
				const selector = this.getAttribute('data-selector');
				cssBox.focus();
				cssEditor.recordHistory();
				cssEditor.updateCode(selector);
				this.classList.add("visited");
				scrollBy(0, -80);
			});

			elem.addEventListener('mouseover', function(e) {
				position = this.getBoundingClientRect().top + window.scrollY;
			});
		});

		const element = document.getElementById('attribute-table');
		element.innerHTML = buildTable(classAttributes);
	}

	function buildTable(array, examples) {
		const hrefs = ['<a href="#info-1">[1]</a> ', '<a href="#info-2">[2]</a> ', '<a href="#info-3">[3]</a> ', '<a href="#info-4">[4]</a> '];
		const sb = [];
		sb.push('<table><thead><tr><td>Description</td><td>CSS</td><td>XPath</td></tr></thead><tbody>');

		array.forEach(item => {
			if (/^\$\$/.test(item[0])) {
				const title = item[0].substring(2);
				sb.push('<tr class="group"><td id="', title.replace(/\W+/g, '_').toLowerCase(), '">', title, '</td><td>' + (item[1] || '') + '</td><td><span class="example-info">' + (item[2] || '') + '</span></td></tr>');

			} else {
				let href = item[2] ? item[2].split(' ').map(n => hrefs[n]).join('') : '';

				options.useClassName = typeof item[3] === 'undefined';

				let { xpath, css, warning, error } = toXPath(item[0], options);
				if (xpath) {
					xpath = xpath.replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g, 'ABC...').replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g, 'abc...');
					sb.push('<tr><td class="name">', href, (item[1] || ' - '), '</td>');

					if (examples) {
						sb.push('<td class="css"><code class="css" data-selector="', item[0], '">', item[0].replace(/ +/g, '&nbsp;'), '</code></td>');

					} else {
						sb.push('<td class="css"><code>', item[0].replace(/ +/g, '&nbsp;'), '</code></td>');
					}
					sb.push('<td><code class="xpath">', xpath, '</code></td></tr>');
				}
				if (error) console.log(item[0], error);
			}
		});
		sb.push('</tbody></table>');
		return sb.join('');
	}
});























