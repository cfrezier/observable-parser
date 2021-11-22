const walk = require("../lib/walk");
const options = require("../lib/options-management");
const basename = require("../lib/basename");

const expect = require('chai').expect;

describe('walk', () => {
    it('should visit everything and call function', (done) => {
        walk('.', options, (err, res) => {
            expect(res.map(file => basename(file))).to.eql(
                [
                    '/test/combine-latest-with-fn.class.ts',
                    '/test/combine-latest.class.ts',
                    '/test/ngrx-store-selectorFn.class.ts',
                    '/test/ngrx-store.class.ts',
                    '/test/no-property-combine.class.ts',
                    '/test/no-property.class.ts',
                    '/test/or-definition.class.ts',
                    '/test/simple-observable.class.ts',
                    '/test/using-injection.class.ts'
                ]);
            done();
        })
    });
});
