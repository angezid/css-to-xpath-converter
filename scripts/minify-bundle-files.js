
const fs = require('fs');
const { minify } = require("terser");

const files = ['converter.js', 'auto-complete.js', 'codejar.js', 'mark.min.js', 'beautify-html.js', 'data.js'],
	testFiles = ['converter.js', 'test-data.js', 'css2xpath-test.js'],
	sourceDir = 'playground/src/',
	destDir = 'playground/static/';

const debugPlayground = false; 

process(files, 'bundle.js', 4);
process(testFiles, 'test-bundle.js', 1);

async function process(files, fileName, start) {
	let scripts = '';
	
	if ( !debugPlayground) files.push('playground.js');

	scripts += fs.readFileSync(sourceDir + files[0]) + '\n\n';

	for (let i = 1; i < files.length; i++) {
		const code = fs.readFileSync(sourceDir + files[i], 'utf-8');
		const result = await minify(code.trim());

		if (i > start) {
			scripts += '/*!****************************\n* ' + files[i] + '\n******************************/\n';
		}

		scripts += result.code + '\n\n';
	}

	if (debugPlayground) scripts += fs.readFileSync(sourceDir +  'playground.js') + '\n\n';

	fs.writeFileSync(destDir + fileName, scripts);
}
