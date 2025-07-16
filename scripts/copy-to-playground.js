const fs = require('fs');

const file = 'dist/converter.js',
    destFile = 'playground/src/converter.js';

try {
    fs.copyFileSync(file, destFile, fs.constants.COPYFILE_FICLONE);
    console.log(file + ' was copied to ' + destFile);
} catch(e) {
    console.log(e);
}
