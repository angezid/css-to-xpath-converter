
'use strict';

export function hasOr(xpath, union) {
	const reg = union ? /(?:[^'" |]|"[^"]*"|'[^']*')+|( or |\|)/g : /(?:[^'" ]|'[^']*'|"[^"]*")+|( or )/g;
	let rm;
	while (rm = reg.exec(xpath)) {
		if (rm[1]) return true;
	}
	return false;
}