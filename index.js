const walk = require('./walk');
const generate = require('./generate');
const basename = require('./basename');

walk('../serious-vaccination', (err, results) => {
    if (err) throw err;

    const parsed = results
        .map(sourceFile => ({ [basename(sourceFile)] : generate(sourceFile)}))
        .reduce((p, c) => ({...p, ...c}), {});

    console.log(parsed);
});



