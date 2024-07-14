
/*// tests equality of generated XPathes by C# version and converter.js TODO
const fs = require('fs');
const chalk = require('chalk');
const convertToXPath = require('../src/converter.js');

const path = './test/css2xpath.json',
	json = fs.readFileSync(path, 'utf8'),
	css2xpath = JSON.parse(json);

if (css2xpath === null) {
	throw new Error('Failed to parse JSON.');
}

let count = Object.keys(css2xpath).length;

const options = {
	axis : '//',
	uppercaseLetters : '',
	lowercaseLetters : '',
	printError : (message) => console.log(message)
};

run();

function run() {
	const array = [];
	
	for (let css in css2xpath) {
		const xpath1 = css2xpath[css];
	
		try {
			let { xpath } = convertToXPath(css, options);
	
			if (xpath.replace(/ +/g, '') !== xpath1.replace(/ +/g, '')) {
				report(false, css + '|    |' + xpath + '  !==  ' + xpath1);
				array.push(css + '|    |' + xpath + '  !==  ' + xpath1);
	
			} else {
				report(true, css);
			}
		} catch(e) {}
	}
	
	writeFile('test/css2xpath-comparison.txt', array.join('\n\n'));
}

function writeFile(path, text) {
	fs.writeFile(path, text, 'utf-8', err => {
		if (err) console.log(err);
	});
}

if (count === 0) {
	console.log(chalk.green('All tests are passed.'));
} else {
	console.log(chalk.red(count +  ' test' + (count > 1 ? 's are' : ' is')+ ' failed.'));
}

function report(success, message) {
	if (success) {
		console.log(chalk.green('Test passed'), message);
		count--;

	} else {
		console.log(chalk.red('Test failed'));
		console.log(message);
	}
}*/
