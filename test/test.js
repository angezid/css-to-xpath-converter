
"use strict";

const fs = require('fs');
const { readdir } = require('fs/promises');
const { readFile } = require('fs/promises');
const pt = require('puppeteer');
const toXPath = require('../src/converter.js');

const htmlDir = './test/html';
const jsonDir = './test/json';

const personal = false;
//const personal = true;

performTest();

async function performTest() {
	try {
		const opt = personal ?
		  { executablePath : 'c:/Program Files (x86)/Google/Chrome/Application/chrome.exe' } :
		  { args: ['--no-sandbox', '--disable-setuid-sandbox'] };
		let browser = await pt.launch(opt);

		const coverage = {};
		let array;
		const jsonFiles = await readdir(jsonDir);
		let success = true;

		for (const jsonName of jsonFiles) {
			//if (jsonName.startsWith('not-nth-last-')) continue;
			//if (jsonName.includes('nth-')) continue;

			const str = await readFile(jsonDir + '/' + jsonName, 'utf8');
			const json = JSON.parse(str);

			for (let k = 0; k < json.paths.length; k++) {
				const htmlName = json.paths[k],
					name = htmlName.replace(/\.html$/, '');

				console.log('testing ' + jsonName + ' with ' + htmlName);

				const url = 'file:///' + __dirname + '/html/' + htmlName;
				const page = await loadFixtures(browser, url);
				array = [];

				for (let i = 0; i < json.selectors.length; i++) {
					const selector = json.selectors[i],
						css = entitize(selector);
					let cssElems, xpathElems, xpath;

					const obj = toXPath(selector, { standard : true });
					if (obj.error) {
						array.push({ 'error' : true, 'text' : `${css}`, message : obj.error });
						continue;
					}
					
					xpath = entitize(obj.xpath);

					try { cssElems = await page.$$(selector); } catch (e) { array.push({ 'notValid' : 'css', 'text' : `${css}` }); }
					try { xpathElems = await page.$x(obj.xpath); } catch (e) { array.push({ 'notValid' : 'xpath', 'css' : `${css}`, 'text' : `${xpath}`  }); }

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

				const reportName = jsonName.startsWith(name) ? jsonName : jsonName.replace(/\.json$/, '') + '_' + htmlName;

				coverage[reportName] = array;
				reportCoverage({ reportName : array }, reportName);
			}
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

async function loadFixtures(browser, url) {
	const page = await browser.newPage();
	await page.goto(url);
	return page;
}

function reportCoverage(coverage, name) {
	let nav = '<aside><nav><ul>\n',
		result = '',
		text = '',
		html = `<!DOCTYPE html>
<html lang='en'>
<head>
	<meta charset='utf-8'>
	<title>Test coverage</title>
	<style>
		main{width:82%;margin-left:20px;} aside{width:17%;position:fixed;right:20px;} nav{height: 98vh;overflow-y:auto;}
		ul{margin:0 0 6px 20px;padding:0;} ul li{list-style-type:none;padding:3px 0;margin:0;}
		section p{margin:6px 20px;} section p b{margin:0 15px;}
	</style>
</head>
<body>
`;
	const info = '<h3>Info:</h3>\n<p>All tests are run in Puppeteer.</p>\n<p>Tests <b>Passed</b> mean that the elements selected by CSS selector are <b>reference equal</b> (not just only by count) to the elements selected by the generated XPath.</p>\n<p><b>Note</b> that XPath implementation for the class attribute is the standard one (like other attributes).</p>\n';

	let summaries = '';
	let passedNum = 0, failedNum = 0, errorNum = 0, notValidNum = 0, noMatchNum = 0, matchNum = 0, warningNum = 0;

	for (let key of Object.keys(coverage)) {
		const array = coverage[key],
			id = key.replace(/\W+/g, '_').toLowerCase();

		let passed = [], failed = [], error = [], notValid = [], noMatch = [], match = [], warning = [];

		array.forEach((item) => {
			if (item.success) {
				passed.push(`<p>${item.css} <b>${item.count} === ${item.count}</b> ${item.xpath}</p>\n`);

			} else if (item.failed) {
				failed.push(`<p><b>${item.count}</b> ${item.css}  <b>- X -</b> ${item.xpath}</p>\n`);

			} else if (item.notValid) {
				if (item.notValid === 'css') {
					notValid.push(`<p>${item.text} <b>CSS</b></p>\n`);

				} else if (item.notValid === 'xpath') {
					notValid.push(`<p>${item.css} --> ${item.text} <b>XPath</b></p>\n`);
				}

			} else if (item.noMatch) {
				noMatch.push(`<p>${item.css} <b>- 0 -</b> ${item.xpath}</p>\n`);

			} else if (item.warning) {
				warning.push(`<p>${item.text} <b>converter warning</b></p>\n`);

			} else if (item.error) {
				error.push(`<p>${item.text} <b>converter error:</b> ${item.message}</p>\n\n`);

			} else if (item.notEquals) {
				match.push(`<p>${item.css} <b>${item.cssCount} !== ${item.xpathCount}</b> ${item.xpath}</p>\n`);
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
		if (failed.length) {
			failedNum += failed.length;
			obj = add(key, 'Failed', failed);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (notValid.length) {
			notValidNum += notValid.length;
			obj = add(key, 'Not valid', notValid);
			str += obj.str;
			summary += obj.summary;
			resultNav += obj.nav;
		}
		if (match.length) {
			matchNum += match.length;
			obj = add(key, 'Have different match count', match);
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

		result += `<section>\n<h2 id="${id}">${key}</h2>\n` + '<h3>Results:</h3>\n' + summary + (str || '<p>Has no tests</p>\n') +'</section>';
		nav += `<li><a href="#${id}">${key}</a></li>\n`;
		if (resultNav) {
			nav += `<ul>${resultNav}</ul>\n`;
		}
	}

	function add(key, title, array) {
		const id= key + '_' + title.replace(/\W+/g, '_').toLowerCase();
		const str = `<h3 id="${id}">${title}: <b>${array.length}</b></h3>\n` + array.join('');
		const summary = `<p><a href="#${id}">${title}: <b>${array.length}</b></a></p>\n`;
		const nav = `<li><a href="#${id}">${title}</a> <b>${array.length}</b></li>\n`;
		return { str, summary, nav };
	}

	if (passedNum) summaries += '<p>Passed: <b>' + passedNum + '</b></p>\n';
	if (failedNum) summaries += '<p>Failed: <b>' + failedNum + '</b></p>\n';
	if (notValidNum) summaries += '<p>Not valid: <b>' + notValidNum + '</b></p>\n';
	if (matchNum) summaries += '<p>Have different match count: <b>' + matchNum + '</b></p>\n';
	if (noMatchNum) summaries += '<p>Have no matches: <b>' + noMatchNum + '</b></p>\n';
	if (errorNum) summaries += '<p>Coverter errors: <b>' + errorNum + '</b></p>\n';

	nav += '</ul><br><br></nav></aside>\n';
	html += nav +'<main>\n<h1>Test results:</h1>\n' + summaries + info + result + '<br><br></main>\n</body></html>';

	if (personal && !name) writeFile('test/test-coverage.html', html);

	text = (summaries + result).trim().replace(/<h\d[^<>]*>/g, '\n').replace(/<\/?[^<>]+>/g, '');
	text = deEntitize(text);

	writeFile('test/test-coverage.txt', text);
	if (name) writeFile('test/' + name + '.txt', text);

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
