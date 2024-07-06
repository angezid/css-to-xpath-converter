
"use strict";

const fs = require('fs');
const { readdir } = require('fs/promises');
const { readFile } = require('fs/promises');
const pt = require('puppeteer');
const convertToXPath = require('../src/converter.js');

const htmlDir = './test/html';
const jsonDir = './test/json';

performTest();
//performTestDebug();

async function performTest() {
	try {
		//const opt = { executablePath : 'c:/Program Files (x86)/Google/Chrome/Application/chrome.exe' };
		const opt = {};
		let browser;
		browser = await pt.launch(opt);

		const coverage = {};
		let array;
		const htmls = await readdir(htmlDir);
		let success = true;

		for (const file of htmls) {
			const name = file.replace(/\.html$/, '.json');
			console.log('testing ' + name);

			const str = await readFile(jsonDir + '/' + name, 'utf8');
			const json = JSON.parse(str);

			const url = 'file:///' + __dirname + '/html/' + file;
			const page = await loadFixtures(browser, url);
			array = [];

			for (let i = 0; i < json.selectors.length; i++) {
				const selector = json.selectors[i],
					css = entitize(selector);
				let cssElems, xpathElems, xpath, obj;

				try { obj = convertToXPath(selector); } catch (e) { array.push({ 'error' : true, 'text' : `${css}` }); }
				if ( !obj) continue;

				xpath = entitize(obj.xpath);

				try { cssElems = await page.$$(selector); } catch (e) { array.push({ 'notValid' : 'css', 'text' : `${css}` }); }
				try { xpathElems = await page.$x(obj.xpath); } catch (e) { array.push({ 'notValid' : 'xpath', 'text' : `${xpath}` }); }

				if ( !cssElems || !xpathElems) continue;

				if (cssElems.length === xpathElems.length) {
					if (cssElems.length === 0) {
						array.push({ 'noMatch' : true, 'css' : `${css}`, 'xpath' : `${xpath}` });

					} else {
						let passed = true;

						for (let i = 0; i < cssElems.length; i++) {
							const equal = await page.evaluate((e1, e2) => e1 === e2, cssElems[i], xpathElems[i]);
							if ( !equal) {
								passed = success = false;
							}
						}

						if (passed) {
							array.push({ 'success' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'count' : cssElems.length });

						} else {
							array.push({ 'failed' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'count' : cssElems.length });
						}
					}

				} else {
					array.push({ 'notEquals' : true, 'css' : `${css}`, 'xpath' : `${xpath}`, 'cssCount' : cssElems.length, 'xpathCount' : xpathElems.length });
					success = false;
				}
			}
			coverage[name] = array;
		}

		await browser.close();

		reportCoverage(coverage);

		if ( !success) {
			throw Error('Tests are not passed');

		} else {
			console.log('All tests are passed');
		}
	} catch (e) {
		throw Error(e);
	}
}

async function getBrowser(opt) {
	let browser;
	try { browser = await pt.launch(opt); } catch (e) { return Promise.reject('Unable to launch the browser'); }
	return browser;
}

async function loadFixtures(browser, url) {
	const page = await browser.newPage();
	await page.goto(url);
	return page;
}

function reportCoverage(coverage) {
	let nav = '<nav><ul>\n',
		result = '',
		text = '',
		html = `<!DOCTYPE html>
<html lang='en'>
<head>
	<meta charset='utf-8'>
	<title>Test coverage</title>
	<style>p { margin: 6px 20px; } b { margin: 0 15px; }</style>
</head>
<body>`;

	for (let key of Object.keys(coverage)) {
		const array = coverage[key],
			id = key.replace(/\W+/g, '_').toLowerCase();
		let passed = '', failed = '', error = '', notValid = '', noMatch = '', match = '';

		array.forEach((item) => {
			if (item.success) {
				passed += `<p>${item.css} <b>${item.count} === ${item.count}</b> ${item.xpath}</p>\n`;

			} else if (item.failed) {
				failed += `<p><b>${item.count}</b> ${item.css}  <b>- X -</b> ${item.xpath}</p>\n`;

			} else if (item.notValid) {
				if (item.notValid === 'css') {
					notValid += `<p>${item.text} <b>CSS</b></p>\n`;

				} else if (item.notValid === 'xpath') {
					notValid += `<p>${item.text} <b>XPath</b></p>\n`;
				}

			} else if (item.noMatch) {
				noMatch += `<p>${item.css} <b>- 0 -</b> ${item.xpath}</p>\n`;

			} else if (item.error) {
				error += `<p>${item.text} <b>converter error</b></p>\n`;

			} else if (item.notEquals) {
				match += `<p>${item.css} <b>${item.cssCount} !== ${item.xpathCount}</b> ${item.xpath}</p>\n`;
			}
		});
		const str = (passed ? '<h3>Passed:</h3>\n' + passed : '') + (failed ? '<h3>Failed:</h3>\n' + failed : '')
			+ (notValid ? '<h3>Not valid:</h3>\n' + notValid : '') + (noMatch ? '<h3>Have no matches:</h3>\n' + noMatch : '')
			+ (match ? '<h3>Have different match count:</h3>\n' + match : '') + (error ? '<h3>Coverter errors:</h3>\n' + error : '');

		result += `\n<h2 id="${id}">${key}</h2>\n` + (str || '<p>Has no tests</p>\n');
		nav += `<li><a href="#${id}">${key}</a></li>\n`;
	}
	nav += '</ul></nav>\n';
	html += nav + result + '</body></html>';

	writeFile('test/test-coverage.html', html);

	text = result.trim().replace(/<h\d[^<>]*>/g, '\n').replace(/<\/?[^<>]+>/g, '').replace(/(?:&nbsp;)+/g, '  ');
	text = deEntitize(text);

	writeFile('test/test-coverage.txt', text);

	function writeFile(path, text) {
		fs.writeFile(path, text, 'utf-8', err => {
			if (err) console.log(err);
		});
	}
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

async function performTestDebug() {
	try {
		const browser = await getBrowser({ executablePath : 'c:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
		//const browser = await getBrowser({ product: 'firefox' });

		const htmls = await readdir(htmlDir);

		for (const file of htmls) {
			//if (file !== 'CssSelector.html') continue;
			console.log('\ntesting ' + file);

			const str = await readFile(jsonDir + '/' + file.replace(/\.html$/, '.json'), 'utf8');
			const json = JSON.parse(str);

			const url = 'file:///' + __dirname + '/html/' + file;
			const page = await loadFixtures(browser, url);

			for (let i = 0; i < json.selectors.length; i++) {
				const css = json.selectors[i];

				let cssElems, xpathElems, xpath, obj;

				try { obj = convertToXPath(css); } catch (e) { console.log(css, ' to XPath error'); }
				if ( !obj) continue;

				xpath = entitize(obj.xpath);

				try { cssElems = await page.$$(css); } catch (e) { console.log(css, ' CSS '); continue; }
				try { xpathElems = await page.$x(obj.xpath); } catch (e) { console.log(css, xpath, ' XPath '); continue; }

				if (cssElems.length !== xpathElems.length) {
					console.log(css, cssElems.length, ' length  !== length ', xpathElems.length, xpath);

				} else if (cssElems.length !== 0) {
					console.log(css, cssElems.length, ' length === length ', xpathElems.length);

					for (let i = 0; i < cssElems.length; i++) {
						const equals = await page.evaluate((e1, e2) => e1 === e2, cssElems[i], xpathElems[i]);
						if ( !equals) {
							console.log(css, '|  !==  |', xpath);
						}
					}

				} else {
					console.log(css, ' length === ', cssElems.length);
				}
			}
		}
		await browser.close();
	} catch (e) {
		throw Error(e);
	}
}























