const options = require("../lib/options-management");

const expect = require('chai').expect;

describe('options-management', () => {
    it('should have default values', () => {
        expect(options).to.eql({
                addEmpty: false,
                addNodeModules: false,
                exclude: [
                    ".spec.ts",
                    "main.ts"
                ],
                rootDirectory: ".",
                scale: "auto"
            }
        );
    });
});
