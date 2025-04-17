
export default function ParserError(code, column, message, fileName, lineNumber) {
	const instance = new Error(message, fileName, lineNumber);
	instance.parser = true;
	instance.column = column;
	instance.code = code;
	Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
	if (Error.captureStackTrace) {
		Error.captureStackTrace(instance, ParserError);
	}
	return instance;
}

ParserError.prototype = Object.create(Error.prototype, {
	constructor : {
		value : Error,
		enumerable : false,
		writable : true,
		configurable : true
	}
});

if (Object.setPrototypeOf) {
	Object.setPrototypeOf(ParserError, Error);
	
} else {
	ParserError.__proto__ = Error;
}