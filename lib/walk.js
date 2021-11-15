const fs = require('fs');
const path = require('path');

const walk = (dir, options, done) => {
    let results = [];

    fs.readdir(dir, function (err, list) {
        if (err) return done(err);

        let i = 0;

        (function next() {
            let file = list[i++];

            if (!file) return done(null, results);

            file = path.resolve(dir, file);

            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory() && (file.indexOf("node_modules") === -1 || options.addNodeModules)) {
                    walk(file, options, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    const matchIgnore = options.exclude
                        .map(exclude => file.indexOf(exclude) >= 0)
                        .reduce((p, c) => p || c, false);

                    // Do not match ignores, and must be a ts file
                    if (!matchIgnore && file.indexOf(".ts") === file.length - 3) {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
};

module.exports = walk;
