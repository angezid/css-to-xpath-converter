
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

	const settings = {
		selectors : [],
		standard : false,
		lowercase : '',
		uppercase : '',
		html : '',
		showHtmlBox : false,

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
					this.showHtmlBox = json.showHtmlBox;
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
		debug = document.getElementById('debug'),
		up = document.getElementById('up-btn'),
		down = document.getElementById('down-btn'),

		cssBox = document.getElementById('css-box'),
		body = document.getElementsByTagName('body')[0],
		convertButton = document.getElementById('convert'),
		clearCSSButton = document.getElementById('clear-css'),
		axesSelector = document.getElementById('axis'),
		translate = document.getElementById('translate'),
		selectorHistory = document.getElementById('selector-history'),

		lowercase = document.getElementById('lowercase'),
		toLowercase = document.getElementById('to-lowercase'),
		uppercase = document.getElementById('uppercase'),
		toUppercase = document.getElementById('to-uppercase'),
		consoleUse = document.getElementById('console-use'),

		xpathBox = document.getElementById('xpath-box'),
		copy = document.getElementById('copy-code'),

		messageBox = document.getElementById('message-box'),

		detailsHtmlBox = document.querySelector('details.html'),
		htmlBox = document.getElementById('html-box'),
		runXPath = document.getElementById('run-xpath'),
		runCSS = document.getElementById('run-css'),
		htmlList = document.getElementById('html-list'),
		clearHtmlButton = document.getElementById('clear-html');

	new autoComplete(cssBox, {
		suggestions: [autocompleteCSS, htmlTags, htmlAttributes.map(str => str.replace('@', '['))],
		regex : /(^|[\s"'*./:=>+~^!@()[\]\\|]|[a-z](?=:)|[\s\w](?=\[))([:[@]?\w+[\w-]+)$/u,
		threshold : 2,
		startsWith : true,
		listItem : (elem, data) => {
			process(elem);
		},
		debug : !debug.checked
	});

	new autoComplete(xpathBox, {
		suggestions: [autocompleteXPath, htmlTags, htmlAttributes],
		//regex : /(^|[\s"'*./:=@()[\]\\|]|[/[](?=@))([@]?[\w-]+)$/u,
		regex : /(?<trigger>^|[\s"'*./:=([\\|]|[/[](?=@))(?<query>[@]?[\w-]+)$/u,
		threshold : 2,
		startsWith : true,
		highlight : true,
		listItem : (elem, data) => {
			process(elem);
		},
		debug : !debug.checked
	});

	const cssEditor = CodeJar(cssBox, null, { tab : '  ' }),
		xpathEditor = CodeJar(xpathBox, null, { tab : '  ' }),
		htmlEditor = CodeJar(htmlBox, null, { tab : '  ' });

	const options = {
		axis : './/',
		standard : false,
		uppercaseLetters : '',
		lowercaseLetters : '',
		printError : (message) => xpathBox.innerHTML = '<span class="errors">' + message + '</span>'
	};

	let changed = false,
		isEmpty = false,
		selection = '',
		position = 0;

	function initConverter() {
		if (location.protocol === 'file:') {
			debug.className = ''; // show checkbox
		}

		setExamples();
		buildHtmlSelector();
		settings.load();

		if (settings.selectors && settings.selectors.length) {
			updateSelectors();
			updateSelector(selectorHistory.value);
		}

		if (settings.html && settings.html.length) {
			htmlEditor.updateCode(settings.html);

			if (settings.showHtmlBox) {
				detailsHtmlBox.setAttribute('open', true);
			}
		}

		registerEvents();
		//convert();
	}

	initConverter();

	function process(elem) {
		elem = elem.querySelector('mark') || elem;
		const text = elem.textContent;
		if (/^[@:[]/.test(text)) {
			elem.textContent = text.substr(1);
		}
	}

	function buildHtmlSelector() {
		let options = '<option value="">' + defaultHtmls['name'] + '</option>';

		for (const key in defaultHtmls) {
			buildOptions(key, defaultHtmls);
		}

		function buildOptions(key, htmls) {
			if (key !== 'name') {
				let title = key.replace(/^[a-z]/, m => m.toUpperCase()).replace(/[a-z](?=[A-Z])/g, '$& ');
				title = title.replace(/( [A-Z])([a-z]+)/g, (m, gr1, gr2) => gr1.toLowerCase() + gr2);
				options += `<option value="${key}">${title}</option>`;
			}
		}
		htmlList.innerHTML = options;
	}

	function beautify(html) {
		try { return html_beautify(html); } catch(e) { return html; }
	}

	function updateSelector() {
		try {
			const obj = JSON.parse(selectorHistory.value);
			if (obj) {
				cssEditor.updateCode(obj.selector);
				axesSelector.value = obj.axis || './/';
				uppercase.value = obj.uppercase || '';
				lowercase.value = obj.lowercase || '';
			}
		} catch (e) { }
	}

	function registerEvents() {
		cssEditor.onUpdate(() => { changed = true; });

		htmlEditor.onUpdate((code, event) => {
			changed = true;

			if (isEmpty && event && (event.type === 'paste' || event.type === 'drop')) {
				htmlEditor.updateCode(beautify(code));
			}
			isEmpty = false;
		});

		window.addEventListener('beforeunload', function(e) {
			if (changed) {
				const selector = cssBox.innerText.trim();
				if (selector) {
					addSelector(selector, axesSelector.value);
				}

				const html = htmlBox.textContent;
				if (html.trim()) {
					settings.html = html;
				}

				settings.save();
			}
		});

		htmlList.addEventListener('change', function(e) {
			const html = defaultHtmls[this.value]?.content;

			if (html) {
				htmlBox.focus();
				htmlEditor.updateCode(beautify(html));
				htmlEditor.recordHistory();
				htmlBox.blur();
			}
		});

		selectorHistory.addEventListener('change', function(e) {
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

		debug.addEventListener('click', function() {
			convert();
		});

		translate.addEventListener('click', function() {
			convert();
		});

		consoleUse.addEventListener('click', function() {
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

			if (position === 0 || position < bottom && position > top) {    // or position is within screen
				window.scrollTo(0, 10000);

			} else {
				window.scrollTo(0, position);
				window.scrollBy(0, -offset);
			}
		});

		convertButton.addEventListener('click', function() {
			selection = tryGetSelection(cssBox);

			clearWarning();
			clearXPathEditor(true);

			setTimeout(function() {
				convert();
			}, 10);
		});

		detailsHtmlBox.addEventListener('toggle', function() {
			const open = this.hasAttribute('open');
			settings.showHtmlBox = open;
			changed = true;
			clearWarning();

			if (open) {
				htmlBox.focus();
				htmlEditor.recordHistory();

				if ( !htmlBox.textContent.trim()) {
					htmlEditor.updateCode(defaultHtmls['page'].content);
				}
				htmlBox.blur();
			}
		});

		runXPath.addEventListener('click', function() {
			let xpath = tryGetSelection(xpathBox) || xpathBox.textContent.trim();

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

		clearCSSButton.addEventListener('click', function() {
			clearCSSEditor();
			clearXPathEditor(true);
			clearWarning();
			cssBox.focus();
			changed = true;
		});

		clearHtmlButton.addEventListener('click', function() {
			htmlBox.focus();
			htmlEditor.recordHistory();
			htmlEditor.updateCode('');
			isEmpty = changed = true;
		});
	}

	function clearCSSEditor(blur) {
		cssBox.focus();
		cssEditor.recordHistory();
		cssEditor.updateCode('');
		if (blur) cssBox.blur();
	}

	function updateCSSEditor(text) {
		cssBox.focus();
		cssEditor.recordHistory();
		cssEditor.updateCode(text);
		cssBox.blur();
	}

	function clearXPathEditor(blur) {
		xpathBox.focus();
		xpathEditor.recordHistory();
		xpathEditor.updateCode('');
		if (blur) xpathBox.blur();
	}

	function updateXPathEditor(text) {
		xpathBox.focus();
		xpathEditor.recordHistory();
		xpathEditor.updateCode(text);
		xpathBox.blur();
	}

	function clearWarning() {
		messageBox.innerHTML = '';
		messageBox.className = 'hide';
		new Mark(htmlBox).unmark();
	}

	function convert() {
		clearWarning();

		//const selector = cssBox.textContent.trim();
		const selector = selection || cssBox.textContent.trim();
		if ( !selector) return;

		selection = '';
		updateXPathEditor('');

		const axis = axesSelector.value;

		options.axis = axis;
		options.standard = consoleUse.checked;
		options.consoleUse = consoleUse.checked;
		options.translate = translate.checked;
		options.postprocess = debug.className ? true : debug.checked;
		options.uppercaseLetters = uppercase.value.trim();
		options.lowercaseLetters = lowercase.value.trim();
		options.debug = !debug.checked;

		const { xpath, css, warning, error } = toXPath(selector, options);

		if (warning) {
			showWarning(warning);
		}

		if (xpath) {
			updateXPathEditor(consoleUse.checked ? '$x("' + xpath + '")' : xpath);
		}

		if (detailsHtmlBox.hasAttribute('open') && xpath) {
			const result = checkDifference(selector, xpath);
			highlightXPath(xpath);

			if (result) {
				//messageBox.innerHTML = messageBox.innerHTML + '<br>' + result;
				messageBox.innerHTML = result;
			}
		}

		if (error) return;

		addSelector(selector, axis);

		if (changed) {
			settings.save();
			changed = false;
		}
		updateSelectors();

		return xpath;
	}

	function tryGetSelection(elem) {
		const sel = window.getSelection();

		if (sel && elem.contains(sel.anchorNode)) {
			return sel.toString().trim();
		}
		return '';
	}

	function highlightXPath(xpath, different) {
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
		highlightElements(startIndexes, 'XPath: ');
		settings.html = htmlString;
	}

	function highlightCSS() {
		clearWarning();

		const selector = tryGetSelection(cssBox) || cssBox.innerText.trim();
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
		highlightElements(startIndexes, 'CSS: ');
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

	function highlightElements(startIndexes, type) {
		const length = startIndexes.length;
		showMessage(type + 'count = ' + length);

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
					showMessage('main.js: Indexes count ' + length + ' !== ' + totalMatches + ' number of highlighted elements');
				}
			}
		});

		if ( !debug.checked) return;

		const elem = htmlBox.querySelector('mark');
		if (elem) {
			elem.scrollIntoView({ block : "center" });
			document.getElementById('demo')?.scrollIntoView();
			scrollBy(0, -10);
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
				index = startIndex + 3; // minimal open tag length is 3
			}
		});

		return startIndexes;
	}

	function checkDifference(selector, xpath) {
		let result = '',
			success = true,
			cssElems = [],
			xpathElems = [],
			node;

		const { doc } = parseHTML();
		if ( !doc) return '';

		try {
			cssElems = doc.querySelectorAll(selector);

		} catch(e) {
			result += 'Selector is not valid; ';
			success = false;
		}

		if (success) {
			result += 'Selector: count = ' + cssElems.length + '; ';
		}

		success = true;

		try {
			const iterator = doc.evaluate(xpath, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			while ((node = iterator.iterateNext())) {
				xpathElems.push(node);
			}

		} catch (e) {
			result += 'XPath is not valid; ';
			success = false;
		}

		if (success) {
			result += 'XPath: count = ' + xpathElems.length + ';';
		}

		if (cssElems.length && xpathElems.length) {
			let equals = 0,
				notEquals = 0;

			for (let i = 0; i < cssElems.length; i++) {
				if (cssElems[i] === xpathElems[i]) equals++;
				else notEquals++;
			}

			if (notEquals) {
				result += ' Elements are <b>not reference equals</b>:<br>equals = ' + equals + '; not equals = ' + notEquals;
			}
		}
		if (success && (xpathElems.length === 0 || cssElems.length !== xpathElems.length)) {
			if ( !options.translate && /translate\(/.test(xpath)) {
				result += '\n<b>Note</b> that <b>translate</b> checkbox is unchecked.'
			}
		}

		return result.replaceAll('; ', ';<br>');
	}

	function showError(error) {
		messageBox.style.color = "red";
		messageBox.innerHTML = error.message || 'Error';
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

	function addSelector(selector, axis) {
		selector = selector.replace(/'/g, '&#39;');
		const length = settings.selectors.length;

		settings.selectors = settings.selectors.filter(obj => obj.selector && obj.selector !== selector);

		if (length === settings.selectors.length) {
			changed = true;
		}

		const upper = uppercase.value.trim(),
			lower = lowercase.value.trim();

		settings.selectors.unshift({ selector, axis : axis, lowercase : lower, uppercase : upper });

		if (settings.selectors.length > maxSaveNumber) {
			settings.selectors.pop();
		}
	}

	function updateSelectors() {
		let str = '';
		settings.selectors.forEach(obj => {
			if ( !obj.selector) return true;
			str += "<option value='" + JSON.stringify(obj) + "'>" + obj.selector + '</option>';
		});
		selectorHistory.innerHTML = str;
	}

	function getPosition(elem) {
		position = elem.getBoundingClientRect().top + window.scrollY;
	}

	async function setExamples() {
		await buildExamples();
	}

	async function buildExamples() {
		return new Promise((resolve) => {
			const section = document.getElementById('examples');
			section.innerHTML = buildTable(exampleSelectors, true);

			section.querySelectorAll('code.css').forEach((elem) => {
				elem.addEventListener('click', function(e) {
					setExampleSelector(this);
				});

				elem.addEventListener('mouseover', function(e) {
					getPosition(this);
				});
			});

			const element = document.getElementById('attribute-table');
			element.innerHTML = buildTable(classAttributes);
			resolve();
		});
	}

	function setExampleSelector(elem) {
		clearCSSButton.click();
		const selector = elem.getAttribute('data-selector');
		updateCSSEditor(selector);
		elem.classList.add("visited");
		scrollBy(0, -90);
	}

	function buildTable(array, examples) {
		const hrefs = ['<a href="#info-1">[1]</a> ', '<a href="#info-2">[2]</a> ', '<a href="#info-3">[3]</a> '];
		const sb = [];
		sb.push('<table><thead><tr><th>Description</th><th>CSS</th><th class="thead-xpath">XPath</th></tr></thead><tbody>');

		array.forEach(item => {
			if (/^\$\$/.test(item[0])) {
				let title = item[0].substring(2);
				const id = title.replace(/\W+/g, '_').toLowerCase();
				title = title.replace(' non-standard', '');    // is necessary to form class attribute id

				sb.push('<tr class="group"><td id="', id, '">', title, '</td><td>' + (item[1] || '') + '</td><td><span class="example-info">' + (item[2] || '') + '</span></td></tr>');

			} else {
				let href = item[2] ? item[2].split(' ').map(n => hrefs[n]).join('') : '';

				options.standard = typeof item[3] === 'undefined';

				let { xpath, css, warning, error } = toXPath(item[0], options);
				if (xpath) {
					xpath = xpath.replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g, 'ABC...').replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g, 'abc...');

					let description = item[1] ? item[1].replace(/ (n\d?)(?= |$)/g, ' <i>$1</i>') : ' - ';

					sb.push('<tr><td class="name">', href, description, '</td>');

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
