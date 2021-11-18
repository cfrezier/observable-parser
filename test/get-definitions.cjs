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
                        injections: [],
                        defs: [
                            "usecase \"SimpleObservable.obs$\"",
                            "usecase \"SimpleObservable.obs2$\""
                        ],
                        links: [
                            "(SimpleObservable.obs$) -d-> (SimpleObservable.obs2$)"
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
                        "injections": [
                            {
                                "name": "store",
                                "type": "Store<AppState>"
                            }
                        ],
                        defs: [
                            "usecase \"NgrxStore.obs$\"",
                            "usecase \"NgrxStore.obs2$\""
                        ],
                        links: [
                            "(NgrxStore.obs$) -d---> (Store[aNgrxSelector])",
                            "(NgrxStore.obs2$) -d-> (NgrxStore.step$)"
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
                        "injections": [
                            {
                                "name": "store",
                                "type": "Store<AppState>"
                            }
                        ],
                        defs: [
                            "usecase \"NgrxStoreSelectorFn.obs$\""
                        ],
                        links: [
                            "(NgrxStoreSelectorFn.obs$) -d---> (Store[aNgrxSelectorFn])"
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
                        "injections": [
                            {
                                "name": "store",
                                "type": "Store<AppState>"
                            }
                        ],
                        defs: [
                            "usecase \"CombineLatest.obs$\"",
                            "usecase \"CombineLatest.obs2$\"",
                            "usecase \"CombineLatest.obs3$\""
                        ],
                        links: [
                            "(CombineLatest.obs3$) -d-> (CombineLatest.obs$)",
                            "(CombineLatest.obs3$) -d-----> (Store[aNgrxSelector])",
                            "(CombineLatest.obs3$) -d-> (CombineLatest.obs2$)"
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
                        injections: [],
                        defs: [],
                        links: ["(subscribe) -u-------> (NoProperty.anyObservable$)"]
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
                        injections: [],
                        defs: [],
                        links: [
                            "(subscribe) -u-------> (NoPropertyCombine.anyObservable$)",
                            "(subscribe) -u-------> (NoPropertyCombine.anyObservable2$)"
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
                        injections: [],
                        defs: [
                            "usecase \"OrDefinition.obs$\"",
                            "usecase \"OrDefinition.obs2$\"",
                            "usecase \"OrDefinition.obs3$\""
                        ],
                        links: [
                            "(OrDefinition.obs$) -d-> (OrDefinition.obs2$)",
                            "(OrDefinition.obs$) -d-> (OrDefinition.obs3$)"
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
                        injections: [],
                        defs: [],
                        links: [
                            "(subscribe) -u-------> (this.array.map[item=>item.obs$])",
                            "(subscribe) -u-------> (this.things.toArray[].map[item=>item.obs$])"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: true
            }
        );
    });

    it('should detect even when using injection', () => {

        const parsedAST = [generateAST('./test/using-injection.class.ts')];

        expect(getObservablesDefinitions(parsedAST)).to.eql(
            {
                fromClasses: {
                    UsingInjection: {
                        injections: [
                            {
                                "name": "service",
                                "type": "Service"
                            }
                        ],
                        defs: [
                            "usecase \"UsingInjection.obs$\""
                        ],
                        links: [
                            "(UsingInjection.obs$) -d---> (Service.obs1$)"
                        ]
                    }
                },
                fromStore: [],
                hasSubscribes: false
            }
        );
    });
});
