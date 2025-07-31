
import { hasOr } from "../src/util";

'use strict';

export default function xNode(node) {
	this.axis = '';
	this.separator = '';
	this.owner = '';
	this.parentNode = node;
	this.previousNode;
	this.childNodes;
	this.content;

	this.addChild = function(nd) {
		if ( !this.childNodes) this.childNodes = [];
		this.childNodes.push(nd);
	}

	this.add = function() {
		let str = '',
			arg = arguments,
			forbid = false;

		for (let i = 0; i < arg.length; i++) {
			if (i === arg.length - 1 && typeof arg[i] === 'boolean') forbid = true;
			else if(hasOr(arg[i], true)) {
				str += arg[i];
				forbid = true;

			} else str += arg[i];
		}
		if ( !this.content) this.content = [];
		this.content.push({ str, forbid });
	}

	this.hasAxis = function(axis) {
		if (this.axis === axis) return true;

		if (this.childNodes) {
			for (let i = 0; i < this.childNodes.length; i++) {
				if (this.childNodes[i].hasAxis(axis)) return true;
			}
		}
		return false;
	}

	this.clone = function() {
		const node = new xNode();
		node.owner = this.owner;
		node.isClone = true;
		return node;
	}

	this.toString = function(text = "") {
		if ( !this.isClone) {
			text = this.separator + this.axis + this.owner;
			const array = this.content;

			if (array) {
				const len = array.length;

				if (len === 1) {
					text += this.or ? array[0].str : '[' + removeBrackets(array[0].str) + ']';

				} else {
					let join = false;

					for (let i = 0; i < len; i++) {
						const obj = array[i],
							str = removeBrackets(obj.str),
							last = i + 1 === len;

						if ( !obj.forbid) {
							text += (join ? ' and ' : '[') + str;

							if (i + 1 < len && !array[i + 1].forbid) {
								text += (last ? ']' : '');
								join = true;

							} else {
								text += ']';
								join = false;
							}

						} else {
							text += '[' + str + ']';
							join = false;
						}
					}
				}
			}
		}

		if (this.childNodes) {
			this.childNodes.forEach((node) => {
				text += node.toString(text);
			});
		}

		function removeBrackets(str) {
			return str.replace(/\x01\[((?:[^"'\x01\x02]|"[^"]*"|'[^']*')+)\]\x02/g, '$1');
		}

		return text;
	}
}
