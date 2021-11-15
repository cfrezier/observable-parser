'use strict';
process.env.LC_ALL = 'fr_FR';
// See: https://github.com/yargs/yargs/issues/1666
console.warn = message => {
    throw Error(message);
};
