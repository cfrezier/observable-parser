const ts = require('typescript');
const fs = require('fs');
const basename = require('./basename');

const generate = (sourceFilename) => {
    return ts.createSourceFile(
        basename(sourceFilename),
        fs.readFileSync(sourceFilename, 'utf8'),
        ts.ScriptTarget.Latest
    );
}

module.exports = generate;
