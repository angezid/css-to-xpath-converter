
'use strict';

export default function xNode(node) {
	this.axis = '';
	this.separator = '';
	this.owner = '';
	this.isClone = false;
	this.parentNode = node;
	this.previousNode;
	this.childNodes;
	this.content;

	this.addChild = function(nd) {
		if ( !this.childNodes) this.childNodes = [];
		this.childNodes.push(nd);
	}

	this.add = function() {
		let str = '';
		for (let i = 0; i < arguments.length; i++) {
			str += arguments[i];
		}
		if ( !this.content) this.content = [];
		this.content.push(str);
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

	this.hasOr = function() {
		if (this.content && this.content.some(str => str === ' or ' || str === ' | ')) return true;

		if (this.childNodes) {
			for (let i = 0; i < this.childNodes.length; i++) {
				if (this.childNodes[i].hasOr()) return true;
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

			if (this.content) {
				text += this.content.join('');
			}
		}

		if (this.childNodes) {
			this.childNodes.forEach((node) => {
				text += node.toString(text);
			});
		}
		return text;
	}
}
