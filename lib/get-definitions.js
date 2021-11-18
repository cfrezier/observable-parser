const ts = require('typescript');

const searchFor = (node, types = [], fn) => {
    node.forEachChild(child => {
        const match = types.map(type => ts.SyntaxKind[child.kind] === type).reduce((p, c) => p || c, false)
        if (match && !!fn) {
            fn(child);
        }
    });
}

const formatKind = (node) => {
    return ts.SyntaxKind[node.kind].toLocaleLowerCase().replace("keyword", "");
}

const reGenerateActualCode = (node, ast) => {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true, omitTrailingSemicolon: true, noEmitHelpers: true });
    const result = printer.printNode(ts.EmitHint.Unspecified, node, ast);
    return result.replace(/\(/g, '[').replace(/\)/g, ']').replace(/\s/g, "");
}

let fnId = 0;
const displayFnExpr = (node, ast) => {
    if (node.parent.arguments) {
        return reGenerateActualCode(node.parent.arguments[0], ast);
    } else {
        return "function[" + ++fnId + "]";
    }
}

/* Searching for the correct name to display in graph */
const getName = (node, definitions) => {
    if (!!node.escapedText) {
        return [definitions.packName + "." + node.escapedText];
    }
    if (!!node.name) {
        return [definitions.packName + "." + node.name.escapedText];
    }
    if (!!node.parent && !!node.parent.name) {
        if (node.parent.name.escapedText === "store") {
            if (!!node.parent.parent.parent.arguments[0].escapedText) {
                // return store seletor name
                return ["Store[" + node.parent.parent.parent.arguments[0].escapedText + "]"];
            } else {
                //return store parametrized selector fn name
                return ["Store[" + node.parent.parent.parent.arguments[0].expression.escapedText + "]"];
            }
        } else {
            const varName = node.parent.name.escapedText;
            const injection = definitions.definitions.fromClasses[definitions.packName].injections.find(inj => inj.name === varName);
            if (!injection) {
                return [definitions.packName + "." + node.parent.name.escapedText];
            }
            return [injection.type + "." + reGenerateActualCode(node.parent.parent, definitions.ast).replace("this.", "").replace(varName + '.', '')];
        }
    }
    if (!!node.parameters && !!node.body) {
        return [displayFnExpr(node, definitions.ast)];
    }
    if (ts.SyntaxKind[node.kind] === "ConditionalExpression") {
        return [...getName(node.whenTrue, definitions), ...getName(node.whenFalse, definitions)];
    }
    return ["[" + formatKind(node) + "]"];
}

/* Recursive function to analyze what is an observable expression */
const analyseExprTree = (node, definitions) => {
    let recurse = node;
    if (recurse.expression) {
        if (!!recurse.expression.name && recurse.expression.name.escapedText === "subscribe") {
            return [...analyseExprTree(recurse.expression, definitions), "subscribe"];
        } else if (recurse.expression.escapedText === "combineLatest") {
            return (recurse.arguments[0].elements || [recurse.arguments[0].arguments[0]])
                .map(arg => {
                    arg.parent = recurse;
                    return analyseExprTree(arg, definitions)
                })
                .reduce((p, c) => [...p, ...c], []);
        } else {
            recurse.expression.parent = recurse;
            return analyseExprTree(recurse.expression, definitions);
        }
    } else {
        if (recurse.right) {
            recurse.right.parent = recurse;
            recurse.left.parent = recurse;
            return [
                ...analyseExprTree(recurse.right, definitions),
                ...analyseExprTree(recurse.left, definitions)
            ];
        } else {
            return getName(recurse, definitions);
        }
    }
}

/* Allows to check in definitions if the item can be validated as an observable */
const isAnObservable = (definitions, a) => {
    return a[a.length - 1] === "subscribe" ||
        definitions.definitions.fromClasses[definitions.packName].defs.indexOf("usecase \"" + a[a.length - 1] + "\"") >= 0
}

/* Transform tree into internal structure for display */
const SUBSCRIBE_ARROW = "-u------->";
const MODULE_ARROW = "-d->";

function calculateArrow(a, v) {
    let arrow = `-d-${'-'.repeat(a.length)}>`;
    if (a[a.length - 1] === "subscribe") {
        arrow = SUBSCRIBE_ARROW;
    }
    if (a[a.length - 1].split('.')[0] === v.split('.')[0]) {
        // Inside module arrow
        arrow = MODULE_ARROW;
    }
    return arrow;
}

const asLink = (definitions) => (v, i, a) => {
    if (isAnObservable(definitions, a)) {
        if (v.indexOf("subscribe") === 0) {
            definitions.definitions.hasSubscribes = true;
        }
        if (i < a.length - 1) {
            if (v.indexOf("Store") === 0) {
                definitions.definitions.fromStore.push("(" + v + ")");
            }
            definitions.definitions.fromClasses[definitions.packName].links.push("(" + a[a.length - 1] + ") " + calculateArrow(a, v) + " (" + v + ")");
        }
    }
}

const checkForObservablesInMethods = (classChildNode, definitions) => {
    searchFor(classChildNode, ['Block'], blockChildNode => {
        searchFor(blockChildNode, ['ExpressionStatement'], expressionChildNode => {

            // Searching for assignments
            searchFor(expressionChildNode, ['BinaryExpression'], binaryExpression => {
                analyseExprTree(binaryExpression, definitions).forEach(asLink(definitions));
            });

            // Searching for calls to subscribe
            searchFor(expressionChildNode, ['CallExpression'], callExpression => {
                analyseExprTree(callExpression, definitions).forEach(asLink(definitions));
            })
        })
    })
}

module.exports = (parsedAST) => {
    const definitions = {
        fromClasses: {},
        fromStore: [],
        hasSubscribes: false
    };

    parsedAST
        .forEach((ast) => {
            ast.forEachChild(node => {

                // Dans les déclaration de classes
                if (ts.SyntaxKind[node.kind] === "ClassDeclaration") {

                    const packName = node.name.escapedText;
                    definitions.fromClasses[packName] = {
                        injections: [],
                        defs: [],
                        links: []
                    }

                    node.forEachChild(classChildNode => {

                        // Fill the injections
                        if (ts.SyntaxKind[classChildNode.kind] === "Constructor") {
                            searchFor(classChildNode, ['Parameter'], parameterNodes => {
                                if (!!parameterNodes.type) {
                                    definitions.fromClasses[packName].injections.push({
                                        name: parameterNodes.name.escapedText,
                                        type: reGenerateActualCode(parameterNodes.type, ast)
                                    });
                                }
                            });
                        }

                        // Propriétés
                        if (ts.SyntaxKind[classChildNode.kind] === "PropertyDeclaration") {
                            if (!!classChildNode.type && !!classChildNode.type.typeName &&
                                (classChildNode.type.typeName.escapedText === "Observable" ||
                                    classChildNode.type.typeName.escapedText === "Subject" ||
                                    classChildNode.type.typeName.escapedText === "BehaviorSubject")) {
                                definitions.fromClasses[packName].defs.push("usecase \"" + packName + "." + classChildNode.name.escapedText + "\"");
                            }
                        }

                        // Constructor
                        if (ts.SyntaxKind[classChildNode.kind] === "Constructor" ||
                            ts.SyntaxKind[classChildNode.kind] === "MethodDeclaration") {
                            checkForObservablesInMethods(classChildNode, { definitions, ast, packName });
                        }

                    })
                }
            })
        });

    return definitions;
}
