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
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printNode(ts.EmitHint.Unspecified, node, ast);
    return result.replace(/\(/g, '[').replace(/\)/g, ']');
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
const getName = (node, file, ast) => {
    if (!!node.escapedText) {
        return [file + "." + node.escapedText];
    }
    if (!!node.name) {
        return [file + "." + node.name.escapedText];
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
            return [file + "." + node.parent.name.escapedText];
        }
    }
    if (!!node.parameters && !!node.body) {
        return [displayFnExpr(node, ast)];
    }
    if (ts.SyntaxKind[node.kind] === "ConditionalExpression") {
        return [getName(node.whenTrue, file, ast), getName(node.whenFalse, file, ast)];
    }
    return ["[" + formatKind(node) + "]"];
}

/* Recursive function to analyze what is an observable expression */
const analyseExprTree = (file, node, ast) => {
    let recurse = node
    if (recurse.expression) {
        if (!!recurse.expression.name && recurse.expression.name.escapedText === "subscribe") {
            return [...analyseExprTree(file, recurse.expression, ast), "subscribe"];
        } else if (recurse.expression.escapedText === "combineLatest") {
            return (recurse.arguments[0].elements || [recurse.arguments[0].arguments[0]])
                .map(arg => {
                    arg.parent = recurse;
                    return analyseExprTree(file, arg, ast)
                })
                .reduce((p, c) => [...p, ...c], []);
        } else {
            recurse.expression.parent = recurse;
            return analyseExprTree(file, recurse.expression, ast);
        }
    } else {
        if (recurse.right) {
            recurse.right.parent = recurse;
            recurse.left.parent = recurse;
            return [
                ...analyseExprTree(file, recurse.right, ast),
                ...analyseExprTree(file, recurse.left, ast)
            ];
        } else {
            return getName(recurse, file, ast);
        }
    }
}

/* Allows to check in definitions if the item can be validated as an observable */
const isAnObservable = (definitions, packName, a) => {
    return a[a.length - 1] === "subscribe" ||
        definitions.fromClasses[packName].defs.indexOf("usecase \"" + a[a.length - 1] + "\"") >= 0
}

/* Transform tree into internal structure for display */
const asLink = (definitions, packName) => (v, i, a) => {
    if (isAnObservable(definitions, packName, a)) {
        if (v.indexOf("subscribe") === 0) {
            definitions.hasSubscribes = true;
        }
        if (i < a.length - 1) {
            if (v.indexOf("Store") === 0) {
                definitions.fromStore.push("(" + v + ")");
            }
            definitions.fromClasses[packName].links.push("(" + a[a.length - 1] + ") --> (" + v + ")");
        }
    }
}

const checkForObservablesInMethods = (classChildNode, packName, definitions, ast) => {
    searchFor(classChildNode, ['Block'], blockChildNode => {
        searchFor(blockChildNode, ['ExpressionStatement'], expressionChildNode => {

            // Searching for assignments
            searchFor(expressionChildNode, ['BinaryExpression'], binaryExpression => {
                analyseExprTree(packName, binaryExpression, ast).forEach(asLink(definitions, packName));
            });

            // Searching for calls to subscribe
            searchFor(expressionChildNode, ['CallExpression'], callExpression => {
                analyseExprTree(packName, callExpression, ast).forEach(asLink(definitions, packName));
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
                        defs: [],
                        links: []
                    }

                    node.forEachChild(classChildNode => {

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
                            checkForObservablesInMethods(classChildNode, packName, definitions, ast);
                        }

                    })
                }
            })
        });

    return definitions;
}
