const { readdir } = require('fs/promises');
const { readFile } = require('fs/promises');
const pt= require('puppeteer');

const htmlDir = './test/html';
const jsonDir = './test/json';

try { performTest(); } catch(e) { }
//performTest();

async function performTest() {
	const browser = await getBrowser({ executablePath: 'c:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
	//const browser = await getBrowser({ headless: "new" });
	if ( !browser) return; 
	
	const htmls = await readdir(htmlDir);
	let success = true;

	for (const file of htmls) {
		console.log('testing ' + file);
		
		const json = await readFile(jsonDir + '/'+ file.replace(/\.html$/, '.json'), 'utf8');
		const css2xpath = JSON.parse(json);

		const url = 'file:///' + __dirname + '/html/' + file;
		const page = await loadFixtures(browser, url);

		for (let css of Object.keys(css2xpath)) {
			const xpath = css2xpath[css],
				cssElems = getCssElements(css),
				xpathElems = getXPathElements(xpath);

			if (cssElems && xpathElems) {
				for (let i = 0; i < cssElems.length; i++) {
					const equal = await page.evaluate((e1, e2) => e1 === e2, cssElems[i], xpathElems[i]);
					if ( !equal) {
						console.log(css, '|   !==   |', xpath);
						success = false;
					}
				}
			}
		}
	}
	if (browser) {
		await browser.close();
	}
	
	if ( !success) {
		throw new Error('Tests are not passed');
	} else {
		console.log('All tests are passed');
	} 
}

async function getBrowser(opt) {
	let browser;
	try { browser = await pt.launch(opt); } catch(e) { console.log('Unable to launch the browser'); }
	return browser;
}

async function loadFixtures(browser, url) {
	const page = await browser.newPage();
	await page.goto(url);
	return page;
}

// some browsers can thow error parsing CSS
async function getCssElements(css) {
	let elems;
	try { elems = await page.$$(css); } catch(e) { }
	return elems;
}

// some browsers can thow error parsing XPaths
async function getXPathElements(xpath) {
	let elems;
	try { elems = await page.$x(xpath); } catch(e) { }
	return elems;
}

async function performTestDebug() {
	const browser = await pt.launch({executablePath: 'c:/Program Files (x86)/Google/Chrome/Application/chrome.exe' });
	const htmls = await readdir(htmlDir);

	let success = false;

	for (const file of htmls) {
		if (file !== 'Slickspeed.html') continue;
		//if (file !== 'CssSelector.html') continue;

		const json = await readFile(jsonDir + '/'+ file.replace(/\.html$/, '.json'), 'utf8');
		const css2xpath = JSON.parse(json);

		const url = 'file:///' + __dirname + '/html/' + file;
		const page = await loadFixtures(browser, url);

		let cssElems, xpathElems;

		for (let css of Object.keys(css2xpath)) {
			const xpath = css2xpath[css];

			try { cssElems = await page.$$(css); } catch(e) { console.log(css, ' CSS '); continue; }
			try { xpathElems = await page.$x(xpath); } catch(e) { console.log(css, xpath, ' XP '); continue; }

			if (cssElems.length !== xpathElems.length) {
				console.log(css, cssElems.length, ' length  !== length ', xpathElems.length, xpath );

			} else {
				//console.log(css, cssElems.length, ' length === length ', xpathElems.length);

				for (let i = 0; i < cssElems.length; i++) {
					const equals = await page.evaluate((e1, e2) => e1 === e2, cssElems[i], xpathElems[i]);
					if ( !equals) {
						console.log(css, '|  !==  |', xpath);
					}
				}
			}
		}
	}
	await browser.close();
}
