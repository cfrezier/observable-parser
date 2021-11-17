const getObservablesDefinitions = require("../lib/get-definitions");
const generateAST = require("../lib/generate");

const expect = require('chai').expect;

describe('get-definitions', () => {
    it('should detect simple observables', () => {

        const parsedAST = [generateAST('./test/simple-observable.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    SimpleObservable: {
                        defs: [
                            "usecase \"SimpleObservable.obs$\"",
                            "usecase \"SimpleObservable.obs2$\""
                        ],
                        links: [
                            "(SimpleObservable.obs$) --> (SimpleObservable.obs2$)"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: false
            }
        );
    });

    it('should detect ngrx\'s store observables', () => {

        const parsedAST = [generateAST('./test/ngrx-store.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    NgrxStore: {
                        defs: [
                            "usecase \"NgrxStore.obs$\"",
                            "usecase \"NgrxStore.obs2$\""
                        ],
                        links: [
                            "(NgrxStore.obs$) --> (Store[aNgrxSelector])",
                            "(NgrxStore.obs2$) --> (NgrxStore.step$)"
                        ]
                    }
                },
                fromStore: [
                    "(Store[aNgrxSelector])"
                ],
                hasSubscribes: false
            }
        );
    });


    it('should detect ngrx\'s store observables event when they are parametrized', () => {

        const parsedAST = [generateAST('./test/ngrx-store-selectorFn.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    NgrxStoreSelectorFn: {
                        defs: [
                            "usecase \"NgrxStoreSelectorFn.obs$\""
                        ],
                        links: [
                            "(NgrxStoreSelectorFn.obs$) --> (Store[aNgrxSelectorFn])"
                        ]
                    }
                },
                fromStore: [
                    "(Store[aNgrxSelectorFn])"
                ],
                hasSubscribes: false
            }
        );
    });

    it('should detect combineLatest', () => {

        const parsedAST = [generateAST('./test/combine-latest.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    CombineLatest: {
                        defs: [
                            "usecase \"CombineLatest.obs$\"",
                            "usecase \"CombineLatest.obs2$\"",
                            "usecase \"CombineLatest.obs3$\""
                        ],
                        links: [
                            "(CombineLatest.obs3$) --> (CombineLatest.obs$)",
                            "(CombineLatest.obs3$) --> (Store[aNgrxSelector])",
                            "(CombineLatest.obs3$) --> (CombineLatest.obs2$)"
                        ]
                    }
                },
                fromStore: [
                    "(Store[aNgrxSelector])"
                ],
                hasSubscribes: false
            }
        );
    });

    it('should detect observables subscribed but not stored as property', () => {

        const parsedAST = [generateAST('./test/no-property.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    NoProperty: {
                        defs: [],
                        links: ["(subscribe) --> (NoProperty.anyObservable$)"]
                    }
                },
                fromStore: [],
                hasSubscribes: true
            }
        );
    });

    it('should detect combineLatests subscribed but not stored as property', () => {

        const parsedAST = [generateAST('./test/no-property-combine.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    NoPropertyCombine: {
                        defs: [],
                        links: [
                            "(subscribe) --> (NoPropertyCombine.anyObservable$)",
                            "(subscribe) --> (NoPropertyCombine.anyObservable2$)"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: true
            }
        );
    });

    it('should detect conditionals as obs declaration', () => {

        const parsedAST = [generateAST('./test/or-definition.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    OrDefinition: {
                        defs: [
                            "usecase \"OrDefinition.obs$\"",
                            "usecase \"OrDefinition.obs2$\"",
                            "usecase \"OrDefinition.obs3$\""
                        ],
                        links: [
                            "(OrDefinition.obs$) --> (OrDefinition.obs2$)",
                            "(OrDefinition.obs$) --> (OrDefinition.obs3$)"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: false
            }
        );
    });

    it('should detect combine latest with fn arg', () => {

        const parsedAST = [generateAST('./test/combine-latest-with-fn.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    CombineLatestWithFn: {
                        defs: [],
                        links: [
                            "(subscribe) --> (this.array.map[item => item.obs$])",
                            "(subscribe) --> (this.things.toArray[].map[item => item.obs$])"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: true
            }
        );
    });
});
