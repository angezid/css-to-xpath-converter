const fs = require('fs');

const file = 'dist/converter.js',
    destFile = 'playground/static/converter.js';

try {
    fs.copyFile(file, destFile, () => {}, fs.constants.COPYFILE_FICLONE);
    console.log(file + ' was copied to ' + destFile);
} catch(e) {
    console.log(e);
}
