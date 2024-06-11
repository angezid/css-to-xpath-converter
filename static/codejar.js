
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));

	} else if (typeof exports === 'object') {
		module.exports = factory(root);

	} else {
		root.CodeJar = factory(root);
	}
})(typeof global !== "undefined" ? global : this.window || this.global, function(root) {

const globalWindow = window;

function CodeJar(editor, highlighter, opt = {}) {
	const options = Object.assign({
		tab : '\t',
		indentOn : /[({[]$/,
		moveToNewLine : /^[)}\]]/,
		spellcheck : false,
		catchTab : true,
		preserveIndent : true,
		addClosing : true,
		history : true,
		window : globalWindow
	}, opt);
	const window = options.window,
		document = window.document,
		maxHistory = 300;
	let listeners = [],
		history = [],
		index = -1,
		prev,    // code content prior keydown event
		recording = false,
		focus = false,
		isLegacy = false,    // true if plaintext-only is not supported
		onUpdate = () => {};
	editor.setAttribute('contenteditable', 'plaintext-only');
	editor.setAttribute('spellcheck', options.spellcheck);
	editor.style.outline = 'none';
	editor.style.overflowWrap = 'break-word';
	editor.style.overflowY = 'auto';
	editor.style.whiteSpace = 'pre-wrap';

	const highlight = (pos) => {
		if (highlighter && typeof highlighter === 'function') {
			highlighter(editor, pos);
		}
	};

	highlight();

	if (editor.contentEditable !== 'plaintext-only') isLegacy = true;
	if (isLegacy) editor.setAttribute('contenteditable', 'true');

	const debounceHighlight = debounce(() => {
		const pos = save();
		highlight(pos);
		select(pos);
	}, 30);
	const shouldRecord = (event) => {
		return !isCtrl(event) && !event.altKey && !isUndo(event) && !isRedo(event) && !event.key.startsWith('Arrow');
	};
	const debounceRecordHistory = debounce((event) => {
		if (shouldRecord(event)) {
			recordHistory();
			recording = false;
		}
	}, 300);
	const on = (type, fn) => {
		listeners.push([type, fn]);
		editor.addEventListener(type, fn);
	};
	on('keydown', event => {
		if (event.defaultPrevented) return;
		prev = toString();

		if (event.key === 'F8') {
			deleteLine(event);
			return;
		}

		if (options.preserveIndent) handleNewLine(event);
		else legacyNewLineFix(event);

		if (options.catchTab) handleTabCharacters(event);
		if (options.addClosing) handleSelfClosingCharacters(event);
		if (options.history) {
			handleUndoRedo(event);
			if (shouldRecord(event) && !recording) {
				recordHistory();
				recording = true;
			}
		}
		if (isLegacy) select(save());
	});
	on('keyup', event => {
		if (event.defaultPrevented || event.isComposing) return;
		if (prev !== toString()) debounceHighlight();
		debounceRecordHistory(event);
		onUpdate(toString(), event);
	});
	on('focus', _event => {
		focus = true;
	});
	on('blur', _event => {
		focus = false;
	});
	on('paste', event => {
		handlePaste(event);
	});
	on('cut', event => {
		handleCut(event);
	});
	on('dragover', event => {
		let data;
		// prevents dragover event when there is a plain text
		if ((data = event.dataTransfer) !== null && data.types.includes('text/plain')) preventDefault(event);
	});
	on('drop', event => {
		handleDrop(event);
	});
	function save() {
		const s = getSelection();
		const pos = { start : 0, end : 0, dir : undefined };
		let { anchorNode, anchorOffset, focusNode, focusOffset } = s;
		if ( !anchorNode || !focusNode) throw 'error1';
		// If the anchor and focus are the editor element, return either a full
		// highlight or a start/end cursor position depending on the selection
		if (anchorNode === editor && focusNode === editor) {
			const text = editor.textContent;
			pos.start = (anchorOffset > 0 && text) ? text.length : 0;
			pos.end = (focusOffset > 0 && text) ? text.length : 0;
			pos.dir = (focusOffset >= anchorOffset) ? '->' : '<-';
			return pos;
		}
		// Selection anchor and focus are expected to be text nodes,
		// so normalize them.
		if (anchorNode.nodeType === Node.ELEMENT_NODE) {
			const node = document.createTextNode('');
			anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
			anchorNode = node;
			anchorOffset = 0;
		}
		if (focusNode.nodeType === Node.ELEMENT_NODE) {
			const node = document.createTextNode('');
			focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
			focusNode = node;
			focusOffset = 0;
		}
		visit(editor, el => {
			if (el === anchorNode && el === focusNode) {
				pos.start += anchorOffset;
				pos.end += focusOffset;
				pos.dir = anchorOffset <= focusOffset ? '->' : '<-';
				return 'stop';
			}
			if (el === anchorNode) {
				pos.start += anchorOffset;
				if ( !pos.dir) {
					pos.dir = '->';
				} else {
					return 'stop';
				}
			} else if (el === focusNode) {
				pos.end += focusOffset;
				if ( !pos.dir) {
					pos.dir = '<-';
				} else {
					return 'stop';
				}
			}
			if (el.nodeType === Node.TEXT_NODE) {
				if (pos.dir != '->') pos.start += el.nodeValue.length;
				if (pos.dir != '<-') pos.end += el.nodeValue.length;
			}
		});
		// collapse empty text nodes
		editor.normalize();
		return pos;
	}
	function setSelection(start, end, dir) {
		select({ start, end, dir });
	}
	function select(pos) {
		const s = getSelection();
		let startNode,
			endNode,
			startOffset = 0,
			endOffset = 0,
			current = 0;
		if ( !pos.dir) pos.dir = '->';
		if (pos.start < 0) pos.start = 0;
		if (pos.end < 0) pos.end = 0;
		// Flip start and end if the direction reversed
		if (pos.dir == '<-') {
			const { start, end } = pos;
			pos.start = end;
			pos.end = start;
		}
		visit(editor, el => {
			if (el.nodeType !== Node.TEXT_NODE) return;
			const len = (el.nodeValue || '').length;
			if (current + len > pos.start) {
				if ( !startNode) {
					startNode = el;
					startOffset = pos.start - current;
				}
				//if (current + len > pos.end) {
				if (current + len > pos.end && pos.end >= current) {
					endNode = el;
					endOffset = pos.end - current;
					return 'stop';
				}
			}
			current += len;
		});
		//console.log(pos.dir, 'current', current, 'endOffset', endOffset, 'startOffset', startOffset);
		if ( !startNode) startNode = editor, startOffset = editor.childNodes.length;
		if ( !endNode) endNode = editor, endOffset = editor.childNodes.length;
		// Flip back the selection
		if (pos.dir == '<-') {
			[startNode, startOffset, endNode, endOffset] = [endNode, endOffset, startNode, startOffset];
		}

		// If nodes not editable, create a text node.
		let node = uneditable(startNode);
		if (node) {
			startNode = node;
			startOffset = 0;
		}
		node = uneditable(endNode);
		if (node) {
			endNode = node;
			endOffset = 0;
		}

		s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
	}
	function uneditable(node) {
		while (node && node !== editor) {
			if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute('contenteditable') == 'false') {
				const nd = document.createTextNode('');
				node.parentNode.insertBefore(nd, node);
				return nd;
			}
			node = node.parentNode;
		}
		return null;
	}
	function beforeCursor() {
		return getText(true);
	}
	function afterCursor() {
		return getText();
	}
	function getText(before, includeSelection) {
		const sel = getSelection(),
			r0 = sel.getRangeAt(0),
			range = document.createRange();
		range.selectNodeContents(editor);

		if(before) range.setEnd(r0.startContainer, r0.startOffset);
		else range.setStart(r0.endContainer, r0.endOffset);

		return range.toString();
	}

	function getText(before) {
		const r0 = getSelection().getRangeAt(0),
			range = document.createRange();
		range.selectNodeContents(editor);

		if(before) range.setEnd(r0.startContainer, r0.startOffset);
		else range.setStart(r0.endContainer, r0.endOffset);

		return range.toString();
	}
	function handleNewLine(event) {
		if (event.key === 'Enter') {
			const before = beforeCursor(),
				after = afterCursor(),
				[indent] = findIndent(before);
			let newIndent = indent;
			// If last symbol is "{" ident new line
			if (options.indentOn.test(before)) {
				newIndent += options.tab;
			}
			// Preserve indent
			if (newIndent.length > 0) {
				preventDefault(event);
				event.stopPropagation();
				insert('\n' + newIndent);

			} else {
				legacyNewLineFix(event);
			}
			// Place adjacent "}" on next line
			if (newIndent !== indent && options.moveToNewLine.test(after)) {
				const pos = save();
				insert('\n' + indent);
				select(pos);
			}
		}
	}
	function legacyNewLineFix(event) {
		// Firefox does not support plaintext-only mode
		// and puts <div><br></div> on Enter. Let's help.
		if (isLegacy && event.key === 'Enter') {
			preventDefault(event);
			event.stopPropagation();
			if (afterCursor() === '') {
				insert('\n ');
				const pos = save();
				pos.start = --pos.end;
				select(pos);

			} else {
				insert('\n');
			}
		}
	}
	function handleSelfClosingCharacters(event) {
		const open = `([{`,
			close = `)]}`,
			quotes = `'"`,
			opened = open.includes(event.key);

		if ( !opened && !quotes.includes(event.key)) return;

		if (getSelection().type === 'Range') {
			if (opened) enclose(event, open, close);
			else enclose(event, quotes, quotes);

		} else {
			const ch = afterCursor().charAt(0),
				code = beforeCursor(),
				reg = /[ \t\n]/;
			if (opened && code[code.length - 1] !== '\\' && (close.includes(ch) || reg.test(ch))) {
				enclose(event, open, close);

			} else if ( !/\S$/.test(code) && reg.test(ch)) {
				enclose(event, quotes, quotes);
			}
		}
	}
	function enclose(event, open, close) {
		preventDefault(event);
		const pos = save();
		let text = pos.start == pos.end ? '' : getSelection().toString();
		insert(event.key + text + close[open.indexOf(event.key)]);
		setSelection(pos.start + 1, pos.end + 1, pos.dir);
	}
	function deleteLine(event) {
		preventDefault(event);
		recordHistory();

		const before = beforeCursor(),
			[_, start] = findIndent(before),
			after = afterCursor(),
			index = after.indexOf('\n'),
			end = index !== -1 ? index + 1 : after.length,
			sel = getSelection().toString();
		 let offset = 0;

		if(isLegacy && sel) {
		   const rm = sel.match(/\n/g);
		   if(rm) offset = rm.length;
		}

		setSelection(start, start + (before.length - start) + (sel.length - offset) + end);
		document.execCommand('delete');
	}
	function handleTabCharacters(event) {
		if (event.key === 'Tab') {
			preventDefault(event);

			if (getSelection().type === 'Range') {
				recordHistory();
				normalize();
				handleSelection(event.shiftKey);

			} else {
				if (event.shiftKey) {
					dedent();

				} else {
					recordHistory();
					insert(options.tab);
				}
			}
		}
	}
	function dedent() {
		let [indent, start] = findIndent(beforeCursor());
		if (indent) {
			const pos = save(),
				len = Math.min(options.tab.length, indent.length);
			setSelection(start, start + len);
			document.execCommand('delete');
			setSelection(pos.start - len, pos.end - len, pos.dir);
		}
	}
	function handleSelection(shiftKey) {
		const pos = save(),
			tabLen = options.tab.length,
			lines = getSelection().toString().split('\n');
		let len = 0, end;

		if (shiftKey) {
			for (let i = 0; i < lines.length; i++) {
				const rm = /^[ \t]+/.exec(lines[i]);
				if (rm !== null) {
					const length = Math.min(rm[0].length, tabLen);
					lines[i] = lines[i].slice(length);
					len += length;
				}
			}

		} else {
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].trim() === '') continue;
				lines[i] = options.tab + lines[i];
				len += tabLen;
			}
		}

		insert(lines.join('\n'));
		end = shiftKey ? pos.end - len : pos.end + len;
		setSelection(pos.start, end, pos.dir);
	}
	function handleDrop(event) {
		const data = event.dataTransfer;
		if(data) {
			process(data.getData("text/plain"), event);
		}
	}
	function handleCut(event) {
		const sel = getSelection().toString();
		if( !sel) return;

		recordHistory();
		const pos = save();
		(event.originalEvent || event).clipboardData.setData('text/plain', sel);
		document.execCommand('delete');

		process2(event, pos, 0);
	}
	function handlePaste(event) {
		let text = (event.originalEvent || event).clipboardData.getData('text/plain');
		process(text, event);
	}
	function process(text, event) {
		if( !text) return;

		recordHistory();
		text = text.replace(/\r\n?/g, '\n');
		text = normalizeSpaces(text);
		const pos = save(),
			len = text.length;
		insert(text);

		process2(event, pos, len)
	}
	function process2(event, pos, len) {
		highlight();
		setSelection(Math.min(pos.start, pos.end) + len, Math.min(pos.start, pos.end) + len, '<-');
		recordHistory();
		preventDefault(event);
		onUpdate(toString(), event);
	}
	function normalize() {
		const pos = save(),
			[_, start] = findIndent(beforeCursor()),
			right = pos.dir === '->';

		pos.start = right ? start : pos.start;
		pos.end = right ? pos.end : start;
		select(pos);

		const text = getSelection().toString(),
			normalized = normalizeSpaces(text);

		insert(normalized);
		pos.end += (normalized.length - text.length);
		select(pos);
	}
	function normalizeSpaces(text) {
		const indentReg = /(^|\n)[ \t]+(?=(\S)?)/g;

		if (options.tab === '\t') {
			const style = window.getComputedStyle(editor),
				size = style.getPropertyValue('tab-size') || 8,
				reg = new RegExp(` {${size < 3 ? 1 : (Math.floor(size / 2) + 1)},${size}}`, 'g'),
				spaces = ' '.repeat(size);

			text = text.replace(indentReg, (m, gr1, gr2) => {
				if( !gr2) return gr1;
				return m.replace(/\t/g, spaces).replace(reg, '\t');
			});

		} else {
			text = text.replace(indentReg, (m, gr1, gr2) => {
				if( !gr2) return gr1;
				return m.replace(/\t/g, options.tab);
			});
		}
		return text;
	}
	function findIndent(text) {
		let i = text.lastIndexOf('\n'),
			j = i++;
		// Find indent of the line.
		while (++j < text.length && /[ \t]/.test(text[j]));
		return [text.substring(i, j), i, j];
	}
	function handleUndoRedo(event) {
		if (isUndo(event)) {
			preventDefault(event);
			if (--index < 0) index = 0;
			restore(index);
		}
		if (isRedo(event)) {
			preventDefault(event);
			if (++index >= history.length) index = history.length - 1;
			restore(index);
		}
	}
	function restore(index) {
		const record = history[index];
		if (record) {
			editor.innerHTML = record.html;
			select(record.pos);
		}
	}
	function recordHistory() {
		if ( !focus) return;
		const html = editor.innerHTML,
			pos = save(),
			last = history[index];

		if (last && last.pos.start === pos.start && last.pos.end === pos.end && last.html === html) return;

		history[++index] = { html, pos };
		history.splice(index + 1);

		if (index > maxHistory) {
			index = maxHistory;
			history.splice(0, 1);
		}
	}
	function visit(editor, visitor) {
		const queue = [];
		let elem = editor.firstChild;

		while (elem) {
			if (visitor(elem) === 'stop') break;
			if (elem.nextSibling) queue.push(elem.nextSibling);
			if (elem.firstChild) queue.push(elem.firstChild);
			elem = queue.pop();
		}
	}
	function isUndo(event) {
		return isCtrl(event) && !event.shiftKey && event.code === 'KeyZ';
	}
	function isRedo(event) {
		return isCtrl(event) && event.shiftKey && event.code === 'KeyZ';
	}
	function isCtrl(event) {
		return event.metaKey || event.ctrlKey;
	}
	function insert(text) {
		text = text.replace(/[<>&"']/g, m => {
			return m === '<' ? '&lt;' : m === '>' ? '&gt;' : m === '&' ? '&amp;' : m === '"' ? '&quot;' : '&#039;';
		});
		document.execCommand('insertHTML', false, text);
	}
	function debounce(cb, wait) {
		let timeout = 0;
		return (...args) => {
			clearTimeout(timeout);
			timeout = window.setTimeout(() => cb(...args), wait);
		};
	}
	function toString() {
		return editor.textContent || '';
	}
	function preventDefault(event) {
		event.preventDefault();
	}
	function getSelection() {
		const root = editor.getRootNode();
		if (root.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			try { return root.getSelection(); } catch (e) { }
		}
		return window.getSelection();
	}
	return {
		updateOptions(newOptions) {
			Object.assign(options, newOptions);
		},
		updateCode(code) {
			editor.textContent = code;
			highlight();
			onUpdate(code);
		},
		onUpdate(cb) {
			onUpdate = cb;
		},
		toString,
		save,
		select,
		recordHistory,
		destroy() {
			for (let [type, fn] of listeners) {
				editor.removeEventListener(type, fn);
			}
		},
	};
}
return CodeJar;
});
