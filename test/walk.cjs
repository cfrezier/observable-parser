const walk = require("../lib/walk");
const options = require("../lib/options-management");

const expect = require('chai').expect;

describe('walk', () => {
    it('should visit everything and call function', (done) => {
        walk('.', options, (err, res) => {
            expect(res).to.eql(
                [
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/combine-latest-with-fn.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/combine-latest.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/ngrx-store-selectorFn.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/ngrx-store.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/no-property-combine.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/no-property.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/or-definition.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/simple-observable.class.ts',
                    '/Users/c.frezier/IdeaProjects/observable-parser/test/using-injection.class.ts'
                ]);
            done();
        })
    });
});
