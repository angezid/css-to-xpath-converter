
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));
		
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
		
	} else {
		root.main = factory(root);
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
		["ul>li[title^='Item']", ""],
		["ul>li[title$='One']", ""],
		["ul>li[title*='Item']", ""],
		["body[lang|=EN]", ""],
		["a[xlink|href]", "select attribute with namespace"],
		
		["$$Attributes ignore case", "https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors"],
		["ul>li[title='one' i]", ""],
		["ul>li[title^='item' i]", ""],
		["ul>li[title$='one' i]", ""],
		["ul>li[title~='two' i]", ""],
		["ul>li[title*='twenty' i]", ""],
		["body[lang|=En i]", ""],
		
		["$$Pseudo-classes", ""],
		["li:not(.c1, .c2)", ""],
		["div:has(h1, h2)", ""],
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
		["ul>li:gt(4)", ""],
		["ul>li:lt(4)", ""],
		["ul>li:eq(4)", ""],
		["ul>li:skip(4)", ""],
		["ul>li:skip-first", ""],
		["ul>li:skip-last", ""],
		["ul>li:limit(5)", ""],
		["ul>li:take(4)", ""],
		[":root", ""],
		
		["$$Pseudo-classes 'nth'", ""],
		["li:nth(5)", ""],
		["ul li:nth-child(3)", ""],
		["ul li:nth-child(even)", ""],
		["ul li:nth-child(odd)", ""],
		["ul li:nth-child(3n+2)", ""],
		
		["$$Pseudo-classes 'of-type'", ""],
		["div p:first-of-type", ""],
		["div>em:last-of-type", ""],
		["div p:only-of-type", ""],
		["ul li:nth-of-type(3)", ""],
		["ul li:nth-of-type(even)", ""],
		["ul li:nth-of-type(odd)", ""],
		["ul li:nth-of-type(3n+2)", ""],
		["ul li:nth-of-type(-3n+2)", ""],
		["ul li:nth-of-type(2n-1)", ""],
		
		["$$Spaces, comments", ""],
		["ul   >   li:  not (  .c1  )", ""],
		["li:  nth-child  (  -3n  +  4  )   ", ""],
		[`!> ul:first /*direct parent*/
	!^   li      /*last child*/
	!+   li  /*previous siblings*/`, ""],
	];
	
	const settings = {
		fastHtmlLibrary : true,
		selectors : [],
		
		save : function() {
			this.saveValue('selectors', JSON.stringify(settings));
		},
		
		load : function() {
			const str = this.loadValue('selectors');
			if (str) {
				const json = JSON.parse(str);
				if (json) {
					this.selectors = json.selectors;
					document.getElementById('fastHtmlLibrary').checked = json.fastHtmlLibrary;
				}
			}
		},
		
		loadValue : function(key) {
			try { return localStorage.getItem(key); } catch (e) {}
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
	
	let prevPos = -1,
		savedLength = 0,
		lock = false;
	
	const input = document.getElementById('input-box'),
		body = document.getElementsByTagName('body')[0],
		up = document.getElementById('up-btn'),
		down = document.getElementById('down-btn'),
		
		lowercase = document.getElementById('lowercase'),
		toLowercase = document.getElementById('to-lowercase'),
		uppercase = document.getElementById('uppercase'),
		toUppercase = document.getElementById('to-uppercase'),
		
		axesSelector = document.getElementById('axes'),
		results = document.getElementById('result-box'),
		convertButton = document.getElementById('convert'),
		library = document.getElementById('library'),
		fastHtmlLibrary = document.getElementById('fastHtmlLibrary'),
		clearButton = document.getElementById('clear'), 
		savedSelectors = document.getElementById('saved-selectors'),
		editor = CodeJar(input, null, { tab : '  ' });
	
	setExamples();
	settings.load();
	
	if (settings.selectors && settings.selectors.length) {
		updateSelectors(true);
	}
	
	registerEvents();
	convert(true);
	
	function registerEvents() {
		savedSelectors.addEventListener('change', function(e) {
			editor.updateCode(savedSelectors.value);
			
			setTimeout(function() {
				convert(true);
			}, 100);
		});
		
		input.addEventListener('paste', function(e) {
			setTimeout(function() {
				convert();
			}, 100);
		});
		
		fastHtmlLibrary.addEventListener('click', function() {
			setExamples();
			convert();
		});
		
		library.addEventListener('click', function() {
			fastHtmlLibrary.checked = !fastHtmlLibrary.checked;
			setExamples();
			convert();
		});
		
		axesSelector.addEventListener('change', function(e) {
			convert();
		});
		
		toLowercase.addEventListener('click', function() {
			const value = uppercase.value.trim();
			if (value) {
				console.log(value);
				lowercase.value = value.toLowerCase();
			}
		});
		
		toUppercase.addEventListener('click', function() {
			const value = lowercase.value.trim();
			if (value) {
				uppercase.value = value.toUpperCase();
			}
		});
		
		window.addEventListener('scroll', function() {
			if ( !lock) {
				prevPos = getPositionY();
			}
		});
		
		up.addEventListener('click', function() {
			const currentPos = getPositionY();
			if (prevPos != -1 && currentPos >= prevPos) {
				scrollToPos(prevPos);
				prevPos += 60;
				
			} else {
				prevPos = currentPos;
				scrollToPos(0);
			}
			console.log('up', currentPos, prevPos);
		});
		
		down.addEventListener('click', function() {
			const currentPos = getPositionY();
			if (currentPos >= prevPos) {
				scrollToPos(5000);
				
			} else {
				scrollToPos(prevPos);
			}
			console.log('down', currentPos, prevPos);
		});
		
		convertButton.addEventListener('click', function() {
			convert();
		});
		
		clearButton.addEventListener('click', function() {
			editor.updateCode('');
			results.innerHTML = '';
			input.focus();
		});
	}
	
	function scrollToPos(pos) {
		lock = true;
		window.scrollTo(0, pos);
		setTimeout(function() { lock = false; }, 100);
	}
	
	function getPositionY() {
		const top = window.pageYOffset;
		const elems = document.getElementsByTagName('tr');
		
		for (let i = 0; i < elems.length; i++) {
			if (elems[i].offsetTop >= top) {
				return elems[i].offsetTop;
			}
		}
		return elems[elems.length - 1].offsetTop;
	}
	
	/*function getPositionY() {
		const half = window.innerHeight / 2;
		const top = window.pageYOffset + half;
		const elems = document.getElementsByTagName('tr');
	
		for (let i = 0; i < elems.length; i++) {
			if (elems[i].offsetTop + half >= top) {
				return elems[i].offsetTop + half;
			}
		}
		return -1;
	}*/
	
	function getPositionY2() {
		//const top = window.pageYOffset;
		const top = window.pageYOffset + window.innerHeight / 2;
		const elems = document.getElementsByTagName('tr');
		
		for (let i = 0; i < elems.length; i++) {
			if (elems[i].offsetTop >= top) {
				return elems[i].offsetTop;
			}
		}
		return -1;
	}
	
	function convert(notSave) {
		const selector = input.innerText.trim();
		if ( !selector) return;
		
		results.innerHTML = '';
		
		const axes = axesSelector.value;
		results.innerHTML = convertToXPath(selector, axes);
		
		if (notSave) return;
		
		saveSelectors(selector);
		updateSelectors();
	}
	
	function saveSelectors(selector) {
		settings.selectors = settings.selectors.filter(sel => sel !== selector);
		settings.selectors.push(selector);
		
		settings.save();
	}
	
	function updateSelectors(update) {
		if (settings.selectors.length > 20) {
			settings.selectors.shift();
		}
		
		if (isChanged()) {
			let str = '';
			settings.selectors.forEach((sel) => {
				str += '<option value="' + sel + '">' + sel + '</option>';
			});
			savedSelectors.innerHTML = str;
			savedLength === settings.selectors.length;
			settings.save();
			console.log( 'isChanged' );
		}
		
		if (update) {
			editor.updateCode(savedSelectors.value);
		}
	}
	
	function isChanged() {
		const list = []; 
		for (let i = 0; i < savedSelectors.childNodes.length; i++) {
			if (savedSelectors.childNodes[i].nodeType === 1) list.push(savedSelectors.childNodes[i]);
		}
		
		console.log(list  );
		
		if (settings.selectors.length !== list.length) return true;
		
		for (let i = 0; i < settings.selectors.length; i++) {
			console.log(list[i]);
			if (list[i].hasAttribute("value")) console.log(list[i].attributes['value']);
			if (list[i].attributes && settings.selectors[i] !== list[i].attributes['value']) return true; 
		}
		return false; 
	}
	
	function setExamples() {
		const section = document.getElementById('example');
		const sb = [];
		sb.push('<table><thead><tr><td>name</td><td>CSS</td><td>XPath</td></tr></thead><tbody>');
		
		selectors.forEach(item => {
			if (/^\$\$/.test(item[0])) {
				const title = item[0].substring(2);
				sb.push('<tr><td id="' + (title.replace(/\W+/g, '_').toLowerCase()) + '" class="group-name">' + title + '</td><td></td><td></td></tr>');
				
			} else {
				try {
					const xpath = convertToXPath(item[0], '//').replace(/ABCDEFGHJIKLMNOPQRSTUVWXYZ[^']*/g, 'ABC...').replace(/abcdefghjiklmnopqrstuvwxyz[^']*/g, 'abc...');
					sb.push('<tr><td class="name">' + (item[1] || ' - ') + '</td>');
					sb.push('<td class="css"><code class="css">' + item[0].replace(/ /g, '&nbsp;') + '</code></td><td><code class="xpath">' + xpath + '</code></td></tr>');
					
				} catch (e) {
					console.log(item[0], e);
				}
			}
		});
		sb.push('</tbody></table>');
		section.innerHTML = sb.join('');
		
		/*const codes = document.getElementsByClassName('xpath');
		
		for (let i = 0; i < codes.length; i++) {
			hljs.highlightElement(codes[i]);
		}*/
	}
	
});





















