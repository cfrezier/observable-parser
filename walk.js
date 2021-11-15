const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
    let results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        let i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory() &&
                    file.indexOf("node_modules") === -1) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.indexOf('.ts') >= 0 &&
                        file.indexOf("polyfills.ts") === -1 &&
                        file.indexOf("test.ts") === -1 &&
                        file.indexOf("spec.ts") === -1) {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
};

module.exports = walk;
