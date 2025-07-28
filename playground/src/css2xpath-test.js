
"use strict";

let saveResults;

performTest();

function performTest() {
	const coverage = {};
	let array;
	let success = true;

	for (const key in cssSelectors) {
		const section = cssSelectors[key];

		for (let k = 0; k < section.paths.length; k++) {
			const htmlName = section.paths[k],
				name = htmlName.replace(/\.html$/, ''),
				html = htmls[name];

			console.log('testing ' + key + ' with ' + name);

			const doc = new DOMParser().parseFromString(html, "text/html");
			if ( !doc) return;

			array = [];

			for (let i = 0; i < section.selectors.length; i++) {
				const selector = section.selectors[i],
					css = entitize(selector);
				let cssElems,
					xpathElems = [],
					cssError,
					xpathError,
					xpath;

				const obj = toXPath(selector, { standard : true });
				if (obj.error) {
					array.push({ 'error' : true, 'text' : `${css}`, message : obj.error });
					continue;
				}

				xpath = entitize(obj.xpath);

				try { cssElems = doc.querySelectorAll(selector); } catch (e) { cssError = true; }
				try {
					let node;
					const iterator = doc.evaluate(obj.xpath, doc, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

					while ((node = iterator.iterateNext())) {
						xpathElems.push(node);
					}
				} catch (e) { xpathError = true; }

				if (cssError) {
					let count = xpathElems ? xpathElems.length : NaN;
					array.push({ 'notValid' : 'css', 'text' : `${css}`, 'xpath' : `${xpath}`, 'xpathCount' : count });
				}

				if (xpathError) {
					let count = cssElems ? cssElems.length : NaN;
					array.push({ 'notValid' : 'xpath', 'css' : `${css}`, 'text' : `${xpath}`, 'cssCount' : count  })
				}

				if (cssError || xpathError) continue;

				if (cssElems.length === xpathElems.length) {
					if (cssElems.length === 0) {
						array.push({ 'noMatch' : true, 'css' : `${css}`, 'xpath' : `${xpath}` });

					} else {
						let passed = true;

						for (let i = 0; i < cssElems.length; i++) {
							const equal = cssElems[i] === xpathElems[i];
							if ( !equal) {
								passed = success = false;
							}
						}

						if (passed) {
							array.push({ 'success' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'count' : cssElems.length });

						} else {
							array.push({ 'notReferenceEquals' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'count' : cssElems.length });
						}
					}

				} else {
					array.push({ 'notEquals' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'cssCount' : cssElems.length, 'xpathCount' : xpathElems.length });
					success = false;
				}
			}

			coverage[key] = array;
		}
	}

	reportCoverage(coverage);

	if ( !success) {
		//throw Error('Tests are not passed');

	} else {
		console.log('All tests are passed');
	}
}

function reportCoverage(coverage) {
	let nav = '<nav><ul>\n',
		result = '',
		text = '',
		html = '';

	let summaries = '<h3>Total results:</h3>';
	let passedNum = 0, failedNum = 0, errorNum = 0, notValidNum = 0, noMatchNum = 0, notEqualsNum = 0, warningNum = 0;

	for (let key of Object.keys(coverage)) {
		const array = coverage[key],
			id = key.replace(/\W+/g, '_').toLowerCase();

		let passed = [], notReferenceEquals = [], error = [], notValid = [], noMatch = [], notEquals = [], warning = [];

		array.forEach((item) => {
			if (item.success) {
				passed.push(`<p>${item.css} <b>${item.count} === ${item.count}</b> ${item.xpath}</p>\n`);

			} else if (item.notReferenceEquals) {
				notReferenceEquals.push(`<p>${item.css}  <b>${item.count}  !== ${item.count}</b> ${item.xpath}</p>\n`);

			} else if (item.notValid) {
				if (item.notValid === 'css') {
					const errBoth = item.xpathCount === NaN ? 'color: #f0f' : '';
					const htmlCss =`<p><span style="${errBoth}">${item.text}</span> <b>CSS</b><b>  x === ${item.xpathCount}</b> ${item.xpath}</p>\n`;
					notValid.push({ html: htmlCss });

				} else if (item.notValid === 'xpath') {
					const htmlXpath =`<p>${item.css} <b>${item.cssCount} --- x </b> <span style="color: #f00">${item.text}</span> <b>XPath</b></p>\n`;
					notValid.push({ html: htmlXpath, error: true });
				}

			} else if (item.noMatch) {
				noMatch.push(`<p>${item.css} <b>- 0 -</b> ${item.xpath}</p>\n`);

			} else if (item.warning) {
				warning.push(`<p>${item.text} <b>converter warning</b></p>\n`);

			} else if (item.error) {
				error.push(`<p>${item.text} <b>converter error:</b> ${item.message}</p>\n\n`);

			} else if (item.notEquals) {
				notEquals.push(`<p>${item.css} <b>${item.cssCount} !== ${item.xpathCount}</b> ${item.xpath}</p>\n`);
			}
		});

		let obj, str = '', summary = '', resultNav = '';

		if (passed.length) {
			passedNum += passed.length;
			obj = add(key, 'Passed', passed);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (notReferenceEquals.length) {
			failedNum += notReferenceEquals.length;
			obj = add(key, 'Not reference equals', notReferenceEquals, 'red');
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (notValid.length) {
			notValidNum += notValid.length;
			const xpathErrors = notValid.filter(obj => obj.error).length;
			obj = add(key, 'Not valid', notValid.map((obj) => obj.html), '#ff8300', xpathErrors);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (notEquals.length) {
			notEqualsNum += notEquals.length;
			obj = add(key, 'Have different match count', notEquals, 'red');
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (noMatch.length) {
			noMatchNum += noMatch.length;
			obj = add(key, 'Have no matches', noMatch);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (error.length) {
			errorNum += error.length;
			obj = add(key, 'Coverter errors', error);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}

		result += `<section>\n<h2 id="${id}">${key}</h2>\n` + '<h3>Results:</h3>\n' + summary + (str || '<p>Has no tests</p>\n') + '</section>';
		nav += `<li><a href="#${id}">${key}</a></li>\n`;
		if (resultNav) {
			nav += `<ul>${resultNav}</ul>\n`;
		}
	}

	function add(key, title, array, color, errors) {
		const id = key + '_' + title.replace(/\W+/g, '_').toLowerCase();
		title = color ? '<span style="color:' + color + '">' + title + '</span>' : title;
		const err = errors ? ` <b style="color: red">${errors}</b>` : '';

		const str = `<h3 id="${id}">${title}: <b>${array.length}</b>${err}</h3>\n` + array.join('');
		const summary = `<p><a href="#${id}">${title}: <b>${array.length}</b></a>${err}</p>\n`;
		const nav = `<li><a href="#${id}">${title}</a> <b>${array.length}</b>${err}</li>\n`;
		return { str, summary, nav };
	}

	if (passedNum) summaries += '<p>Passed: <b>' + passedNum + '</b></p>\n';
	if (failedNum) summaries += '<p>Failed: <b>' + failedNum + '</b></p>\n';
	if (notValidNum) summaries += '<p>Not valid: <b>' + notValidNum + '</b></p>\n';
	if (notEqualsNum) summaries += '<p>Have different match count: <b>' + notEqualsNum + '</b></p>\n';
	if (noMatchNum) summaries += '<p>Have no matches: <b>' + noMatchNum + '</b></p>\n';
	if (errorNum) summaries += '<p>Coverter errors: <b>' + errorNum + '</b></p>\n';

	nav += '</ul><br><br></nav>\n';

	document.getElementById('sidebar').innerHTML = nav;
	document.getElementById('summary').innerHTML = summaries;
	document.getElementById('result').innerHTML = result;

	if (saveResults) save(result);
}

function save(html) {
	if (location.protocol !== 'file:') return;

	let text = deEntitize(html.trim().replace(/<h\d[^>]*>/g, '\n').replace(/<\/?[^>]+>/g, ''));
	const array = text.split('\n').filter((str) => !/^(?:Coverter|Css|Have|Not|Passed|Results)/.test(str));
	text = array.sort().join('\n').trim();
	
	const elem = document.getElementById('save-results');
	elem.download = 'test-results.txt';
	elem.href = URL.createObjectURL(new Blob([text], { type : 'text/text' }));
}

function entitize(text) {
	text = text.replace(/[<>&"']/g, m => {
		return m === '<' ? '&lt;' : m === '>' ? '&gt;' : m === '&' ? '&amp;' : m === '"' ? '&quot;' : '&#039;';
	});
	return text;
}

function deEntitize(text) {
	text = text.replace(/&lt;|&gt;|&amp;|&quot;|&#039;/g, m => {
		return m === '&lt;' ? '<' : m === '&gt;' ? '>' : m === '&amp;' ? '&' : m === '&quot;' ? '"' : '\'';
	});
	return text;
}

document.getElementById('save-results').addEventListener('click', function() {
	saveResults = true;
	performTest();
});
