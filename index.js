const walk = require('./walk');
const generateAST = require('./generate');
const basename = require('./basename');
const pumlTransform = require('./puml-transform');

walk('../serious-vaccination', (err, results) => {
    if (err) throw err;

    const parsed = results.map(sourceFile => generateAST(sourceFile));

    pumlTransform(parsed);
});



