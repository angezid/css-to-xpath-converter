/*!*******************************************
* Modified version of https://github.com/antonmedv/codejar
* MIT licensed
*********************************************/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.CodeJar = factory());
})(this, (function () { 'use strict';

  function _extends() {
    return _extends = Object.assign ? Object.assign.bind() : function (n) {
      for (var e = 1; e < arguments.length; e++) {
        var t = arguments[e];
        for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
      }
      return n;
    }, _extends.apply(null, arguments);
  }

  function CodeJar(editor, highlighter, options) {
    var opt = _extends({
      tab: '\t',
      indentOn: /[({[][ \t]*$/,
      moveToNewLine: /^[ \t]*[)}\]]/,
      spellcheck: false,
      catchTab: true,
      preserveIndent: true,
      addClosing: true,
      history: true
    }, options);
    var maxHistory = 300,
      isFirefox = /firefox/i.test(window.navigator.userAgent);
    var listeners = [],
      history = [],
      index = -1,
      prev,
      recording = false,
      focus = false,
      update = function update() {};
    editor.setAttribute('contenteditable', 'plaintext-only');
    editor.setAttribute('spellcheck', opt.spellcheck);
    _extends(editor.style, {
      outline: "none",
      overflowWrap: "break-word",
      overflowY: "auto",
      whiteSpace: "pre-wrap"
    });
    var richText = editor.contentEditable !== 'plaintext-only';
    if (richText) editor.setAttribute('contenteditable', 'true');
    var highlight = function highlight(pos) {
      if (highlighter && typeof highlighter === 'function') {
        highlighter(editor, pos);
      }
    };
    highlight();
    var debounceHighlight = debounce(function () {
      var pos = save();
      highlight(pos);
      restore(pos);
    }, 30);
    var shouldRecord = function shouldRecord(event) {
      return !isCtrlZ(event) || !/^(?:Control|Meta|Alt)$|^Arrow/.test(event.key);
    };
    var debounceRecordHistory = debounce(function (event) {
      if (shouldRecord(event)) {
        recordHistory();
        recording = false;
      }
    }, 300);
    var on = function on(type, fn) {
      listeners.push([type, fn]);
      editor.addEventListener(type, fn);
    };
    on('keydown', function (event) {
      if (isPrevented(event)) return;
      prev = toString();
      if (event.key === 'F8') {
        deleteLine(event);
        return;
      }
      if (event.key === 'Enter') {
        if (opt.preserveIndent) handleNewLine(event);else fixNewLine(event);
      }
      if (opt.catchTab && event.key === 'Tab') handleTabCharacters(event);
      if (opt.addClosing) handleSelfClosingCharacters(event);
      if (opt.history) {
        handleUndoRedo(event);
        if (shouldRecord(event) && !recording) {
          recordHistory();
          recording = true;
        }
      }
    });
    on('keyup', function (event) {
      if (isPrevented(event)) return;
      if (prev !== toString()) debounceHighlight();
      debounceRecordHistory(event);
      update(toString(), event);
    });
    on('focus', function (event) {
      focus = true;
    });
    on('blur', function (event) {
      focus = false;
    });
    on('paste', function (event) {
      handlePaste(event);
    });
    on('cut', function (event) {
      handleCut(event);
    });
    on('dragover', function (event) {
      var data;
      if ((data = event.dataTransfer) !== null && data.types.includes('text/plain')) preventDefault(event);
    });
    on('drop', function (event) {
      handleDrop(event);
    });
    function isPrevented(e) {
      return e.defaultPrevented || e.isComposing;
    }
    function save() {
      var pos = {
        start: 0,
        end: 0,
        dir: null
      };
      var _getSelection = getSelection(),
        anchorNode = _getSelection.anchorNode,
        anchorOffset = _getSelection.anchorOffset,
        focusNode = _getSelection.focusNode,
        focusOffset = _getSelection.focusOffset;
      if (isElement(anchorNode)) {
        anchorNode = insertTextNode(anchorNode, anchorNode.childNodes[anchorOffset]);
        anchorOffset = 0;
      }
      if (isElement(focusNode)) {
        focusNode = insertTextNode(focusNode, focusNode.childNodes[focusOffset]);
        focusOffset = 0;
      }
      visit(editor, function (node) {
        var isAnchor = node === anchorNode,
          isFocus = node === focusNode;
        if (isAnchor) {
          pos.start += anchorOffset;
          if (pos.dir) return true;
          if (!isFocus) pos.dir = '->';
        }
        if (isFocus) {
          pos.end += focusOffset;
          if (pos.dir) return true;
          if (!isAnchor) pos.dir = '<-';
        }
        if (isAnchor && isFocus) {
          pos.dir = anchorOffset <= focusOffset ? '->' : '<-';
          return true;
        }
        if (pos.dir !== '->') pos.start += node.nodeValue.length;
        if (pos.dir !== '<-') pos.end += node.nodeValue.length;
      });
      editor.normalize();
      return pos;
    }
    function setSelection(start, end, dir) {
      restore({
        start: start,
        end: end,
        dir: dir
      });
    }
    function restore(pos) {
      if (!pos.dir) pos.dir = '->';
      if (pos.start < 0) pos.start = 0;
      if (pos.end < 0) pos.end = 0;
      var s = getSelection(),
        reversed = pos.dir === '<-',
        gt = pos.start !== pos.end || s.anchorOffset === 0 && s.focusOffset === 0;
      var startNode,
        endNode,
        startOffset = 0,
        endOffset = 0,
        previous = 0,
        temp;
      if (reversed) {
        temp = pos.start;
        pos.start = pos.end;
        pos.end = temp;
      }
      visit(editor, function (node) {
        var current = previous + (node.nodeValue || '').length;
        if (!gt && current >= pos.start || gt && current > pos.start) {
          if (!startNode) {
            startNode = node;
            startOffset = pos.start - previous;
          }
          if (current >= pos.end) {
            endNode = node;
            endOffset = pos.end - previous;
            return true;
          }
        }
        previous = current;
      });
      var obj = checkNode(startNode, startOffset),
        obj2 = checkNode(endNode, endOffset);
      if (reversed) {
        temp = obj;
        obj = obj2;
        obj2 = temp;
      }
      s.setBaseAndExtent(obj.node, obj.offset, obj2.node, obj2.offset);
    }
    function visit(elem, visitor) {
      var iterator = document.createNodeIterator(elem, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = iterator.nextNode()) && !visitor(node));
    }
    function checkNode(node, offset) {
      if (!node) {
        node = editor;
        offset = editor.childNodes.length;
      } else {
        var nd = node;
        while (nd && nd !== editor) {
          if (isElement(nd) && nd.getAttribute('contenteditable') === 'false') {
            node = insertTextNode(nd.parentNode, nd);
            offset = 0;
            break;
          }
          nd = nd.parentNode;
        }
      }
      return {
        node: node,
        offset: offset
      };
    }
    function isElement(node) {
      return node.nodeType === Node.ELEMENT_NODE;
    }
    function insertTextNode(parent, refNode) {
      var node = document.createTextNode('');
      parent.insertBefore(node, refNode);
      return node;
    }
    function getText() {
      var r0 = getSelection().getRangeAt(0);
      return {
        before: getString(r0, true),
        after: getString(r0)
      };
    }
    function getString(r0, before) {
      var range = document.createRange();
      range.selectNodeContents(editor);
      if (before) range.setEnd(r0.startContainer, r0.startOffset);else range.setStart(r0.endContainer, r0.endOffset);
      return range.toString();
    }
    function handleNewLine(event) {
      var _getText = getText(),
        before = _getText.before,
        after = _getText.after,
        indent = findIndent(before).indent,
        newIndent = opt.indentOn.test(before) ? indent + opt.tab : indent;
      if (newIndent.length) {
        preventDefault(event, true);
        insert('\n' + newIndent);
      } else {
        fixNewLine(event);
      }
      if (newIndent !== indent && opt.moveToNewLine.test(after)) {
        insertText('\n' + indent, 0);
      }
    }
    function fixNewLine(event) {
      if (richText || isFirefox) {
        preventDefault(event, true);
        if (!getText().after) {
          insertText('\n ', 1);
        } else {
          insert('\n');
        }
      }
    }
    function handleSelfClosingCharacters(event) {
      var key = event.key,
        open = "([{",
        close = ")]}",
        quotes = "'\"",
        isOpen = open.includes(key),
        isQuote = quotes.includes(key);
      if (!isOpen && !isQuote) return;
      var _getText2 = getText(),
        before = _getText2.before,
        after = _getText2.after;
      if (getSelection().type === 'Range') {
        if (isOpen) enclose(event, open, close);else enclose(event, quotes, quotes);
      } else {
        var ch = before[before.length - 1],
          ch2 = after.charAt(0),
          endOrSpace = /^$|[\s]/.test(ch2),
          i = !ch2 ? -1 : close.indexOf(ch2);
        if (isOpen && ch !== '\\' && (i >= 0 || endOrSpace)) {
          enclose(event, open, close);
        } else if (isQuote && (ch === open[i] || i >= 0 && /[\s=]/.test(ch) || endOrSpace && !/[^\s([{]/.test(ch))) {
          enclose(event, quotes, quotes);
        }
      }
    }
    function enclose(event, open, close) {
      preventDefault(event);
      var pos = save();
      var text = pos.start == pos.end ? '' : getSelection().toString();
      insertText(event.key + text + close[open.indexOf(event.key)], 1);
    }
    function insertText(text, offset) {
      var pos = save();
      insert(text);
      setSelection(pos.start + offset, pos.end + offset, pos.dir);
    }
    function deleteLine(event) {
      preventDefault(event);
      recordHistory();
      var _getText3 = getText(),
        before = _getText3.before,
        after = _getText3.after,
        start = findIndent(before).start,
        index = after.indexOf('\n'),
        end = index >= 0 ? index + 1 : after.length;
      setSelection(start, before.length + end);
      execDelete();
    }
    function handleTabCharacters(event) {
      preventDefault(event);
      if (getSelection().type === 'Range') {
        recordHistory();
        handleSelection(event.shiftKey);
      } else {
        if (event.shiftKey) {
          dedent();
        } else {
          recordHistory();
          insert(opt.tab);
        }
      }
    }
    function dedent() {
      var _getText4 = getText(),
        before = _getText4.before,
        after = _getText4.after,
        obj = findIndent(before),
        spaces = getStartSpaces(after);
      if (obj.indent || spaces) {
        var pos = save(),
          start = obj.start,
          len = Math.min(opt.tab.length, obj.indent.length + spaces),
          num = Math.max(start, pos.start - len);
        setSelection(start, start + len);
        execDelete();
        setSelection(num, num, pos.dir);
      }
    }
    function handleSelection(shiftKey) {
      normalizeSelection();
      var pos = save(),
        tabLen = opt.tab.length,
        lines = getSelection().toString().split(/\r?\n|\r/);
      var len = 0,
        start = pos.start,
        end = pos.end;
      for (var i = 0; i < lines.length; i++) {
        if (shiftKey) {
          var spaces = getStartSpaces(lines[i]);
          if (spaces) {
            spaces = Math.min(spaces, tabLen);
            lines[i] = lines[i].slice(spaces);
            len += spaces;
          }
        } else {
          if (!lines[i]) continue;
          lines[i] = opt.tab + lines[i];
          len += tabLen;
        }
      }
      if (pos.dir === '->') {
        end = shiftKey ? pos.end - len : pos.end + len;
      } else {
        start = shiftKey ? pos.start - len : pos.start + len;
      }
      insert(lines.join('\n'));
      setSelection(start, end, pos.dir);
    }
    function getStartSpaces(text) {
      var rm = /^[ \t]+/.exec(text);
      return rm !== null ? rm[0].length : 0;
    }
    function normalizeSelection() {
      var pos = save(),
        start = findIndent(getText().before).start,
        right = pos.dir === '->';
      setSelection(right ? start : pos.start, right ? pos.end : start, pos.dir);
    }
    function handleDrop(event) {
      var data = event.dataTransfer;
      if (data) {
        process(data.getData("text/plain"), event);
      }
    }
    function handleCut(event) {
      var sel = getSelection().toString();
      if (!sel) return;
      recordHistory();
      var pos = save();
      (event.originalEvent || event).clipboardData.setData('text/plain', sel);
      execDelete();
      processNext(event, pos, 0);
    }
    function execDelete() {
      getSelection().deleteFromDocument();
    }
    function handlePaste(event) {
      if (isPrevented(event)) return;
      var text = (event.originalEvent || event).clipboardData.getData('text/plain');
      process(text, event);
    }
    function process(text, event) {
      if (!text) return;
      recordHistory();
      text = text.replace(/\r\n?/g, '\n');
      text = normalizeSpaces(text);
      var pos = save(),
        len = text.length;
      insert(text);
      processNext(event, pos, len);
    }
    function processNext(event, pos, len) {
      preventDefault(event);
      highlight();
      var num = Math.min(pos.start, pos.end) + len;
      setSelection(num, num, '<-');
      recordHistory();
      update(toString(), event);
    }
    function normalizeSpaces(text) {
      var indentReg = /(^|\n)[ \t]+(?=(\S)?)/g;
      var by = opt.tab,
        reg;
      if (opt.tab === '\t') {
        var style = window.getComputedStyle(editor),
          size = style.getPropertyValue('tab-size') || 8;
        reg = new RegExp(" {".concat(size < 3 ? 1 : Math.floor(size / 2) + 1, ",").concat(size, "}"), 'g');
        by = ' '.repeat(size);
      }
      text = text.replace(indentReg, function (m, gr1, gr2) {
        if (!gr2) return gr1;
        var str = m.replace(/\t/g, by);
        return reg ? str.replace(reg, '\t') : str;
      });
      return text;
    }
    function findIndent(text) {
      var rm = /(^|[\n\r])([ \t]*)[^\n\r]*$/.exec(text);
      return {
        indent: rm[2],
        start: rm.index + rm[1].length
      };
    }
    function handleUndoRedo(event) {
      if (isUndo(event)) {
        preventDefault(event);
        if (--index < 0) index = 0;
        restoreHistory();
      }
      if (isRedo(event)) {
        preventDefault(event);
        if (++index >= history.length) index = history.length - 1;
        restoreHistory();
      }
    }
    function restoreHistory() {
      var record = history[index];
      if (record) {
        editor.innerHTML = record.html;
        restore(record.pos);
      }
    }
    function recordHistory() {
      if (!focus) return;
      var html = editor.innerHTML,
        pos = save(),
        last = history[index];
      if (last && last.pos.start === pos.start && last.pos.end === pos.end && last.html === html) return;
      history[++index] = {
        html: html,
        pos: pos
      };
      history.splice(index + 1);
      if (index > maxHistory) {
        index = maxHistory;
        history.shift();
      }
    }
    function isUndo(event) {
      return isCtrlZ(event) && !event.shiftKey;
    }
    function isRedo(event) {
      return isCtrlZ(event) && event.shiftKey;
    }
    function isCtrlZ(event) {
      return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';
    }
    function insert(text) {
      var asHtml = richText || !isFirefox;
      if (asHtml) {
        var obj = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          '\'': '&#039;'
        };
        text = text.replace(/[<>&"']/g, function (m) {
          return obj[m];
        });
      }
      document.execCommand(asHtml ? 'insertHTML' : 'insertText', false, text);
    }
    function debounce(cb, wait) {
      var id;
      return function (args) {
        clearTimeout(id);
        id = window.setTimeout(function () {
          return cb(args);
        }, wait);
      };
    }
    function toString() {
      return editor.textContent || '';
    }
    function preventDefault(event, stop) {
      event.preventDefault();
      if (stop) event.stopPropagation();
    }
    function getSelection() {
      try {
        return editor.getRootNode().getSelection();
      } catch (e) {}
      return window.getSelection();
    }
    return {
      updateOptions: function updateOptions(options) {
        _extends(opt, options);
      },
      updateCode: function updateCode(code) {
        editor.textContent = code;
        highlight();
        update(code);
      },
      onUpdate: function onUpdate(cb) {
        update = cb;
      },
      toString: toString,
      save: save,
      restore: restore,
      recordHistory: recordHistory,
      destroy: function destroy() {
        listeners.forEach(function (arr) {
          editor.removeEventListener(arr[0], arr[1]);
        });
      }
    };
  }

  return CodeJar;

}));
