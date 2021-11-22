const basename = require("../lib/basename");

const expect = require('chai').expect;

describe('basename', () => {
    it('should remove current pwd from filename', () => {
        const name = `${process.cwd()}/meuh.txt`

        expect(basename(name)).to.eql('/meuh.txt');
    });
});
