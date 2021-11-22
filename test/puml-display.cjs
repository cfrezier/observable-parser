const pumlDisplay = require("../lib/puml-display");
const options = require("../lib/options-management");

const expect = require('chai').expect;

describe('puml-display', () => {
    it('should display simple observables', () => {

        const definitions = {
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
        };

        expect(pumlDisplay(definitions, options)).to.eql([
            "@startuml",
            "package SimpleObservable {",
            "  usecase \"SimpleObservable.obs$\"",
            "  usecase \"SimpleObservable.obs2$\"",
            "  (SimpleObservable.obs$) -d-> (SimpleObservable.obs2$)",
            "}",
            "scale 1",
            "@enduml"
        ]);
    });

    it('should display ngrx\'s store', () => {

        const definitions = {
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
        };

        expect(pumlDisplay(definitions, options)).to.eql([
            "@startuml",
            "package Store {",
            "  usecase (Store[aNgrxSelector])",
            "}",
            "package NgrxStore {",
            "  usecase \"NgrxStore.obs$\"",
            "  usecase \"NgrxStore.obs2$\"",
            "  (NgrxStore.obs$) -d---> (Store[aNgrxSelector])",
            "  (NgrxStore.obs2$) -d-> (NgrxStore.step$)",
            "}",
            "scale 1",
            "@enduml"
        ]);
    });

    it('should display subscribes', () => {

        const definitions = {
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
        };

        expect(pumlDisplay(definitions, options)).to.eql([
            "@startuml",
            "(subscribe)",
            "package CombineLatestWithFn {",
            "  (subscribe) -u-------> (this.array.map[item=>item.obs$])",
            "  (subscribe) -u-------> (this.things.toArray[].map[item=>item.obs$])",
            "}",
            "scale 1",
            "@enduml"
        ]);
    });

});
