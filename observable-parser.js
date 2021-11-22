#!/usr/bin/env node
const walk = require('./lib/walk');
const generateAST = require('./lib/generate');
const getObservablesDefinitions = require('./lib/get-definitions');
const pumlDisplay = require('./lib/puml-display');

const options = require('./lib/options-management');

walk(options.rootDirectory, options, (err, results) => {
    if (err) throw err;

    const parsed = results.map(sourceFile => generateAST(sourceFile));

    const definitions = getObservablesDefinitions(parsed);

    const lines = pumlDisplay(definitions, options);

    lines.forEach(line => {
        console.log(line);
    });
});



