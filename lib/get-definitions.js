const ts = require('typescript');

const searchFor = (node, types = [], fn) => {
    node.forEachChild(child => {
        const match = types.map(type => ts.SyntaxKind[child.kind] === type).reduce((p, c) => p || c, false)
        if (match && !!fn) {
            fn(child);
        }
    });
}

/* Searching for the correct name to display in graph */
const getName = (node, file) => {
    if (!!node.escapedText) {
        return file + "." + node.escapedText;
    }
    if (!!node.name) {
        return file + "." + node.name.escapedText;
    }
    if (!!node.parent && !!node.parent.name) {
        if (node.parent.name.escapedText === "store") {
            if (!!node.parent.parent.parent.arguments[0].escapedText) {
                // return store seletor name
                return "Store[" + node.parent.parent.parent.arguments[0].escapedText + "]";
            } else {
                //return store parametrized selector fn name
                return "Store[" + node.parent.parent.parent.arguments[0].expression.escapedText + "]";
            }
        } else {
            return file + "." + node.parent.name.escapedText;
        }
    }
    return file + "." + node.escapedText;
}

/* Recursive function to analyze what is an observable expression */
const analyseExprTree = (file, node, level = 0) => {
    let recurse = node
    if (recurse.expression) {
        if (!!recurse.expression.name && recurse.expression.name.escapedText === "subscribe") {
            return [...analyseExprTree(file, recurse.expression, level + 1), "subscribe"];
        } else if (recurse.expression.escapedText === "combineLatest") {
            return recurse.arguments[0].elements
                .map(arg => analyseExprTree(file, arg, level + 1))
                .reduce((p, c) => [...p, ...c], []);
        } else {
            recurse.expression.parent = recurse;
            return analyseExprTree(file, recurse.expression, level + 1);
        }
    } else {
        if (recurse.right) {
            recurse.right.parent = recurse;
            recurse.left.parent = recurse;
            return [
                ...analyseExprTree(file, recurse.right, level + 1),
                ...analyseExprTree(file, recurse.left, level + 1)
            ];
        } else {
            return [getName(recurse, file)];
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

const checkForObservablesInMethods = (classChildNode, packName, definitions) => {
    searchFor(classChildNode, ['Block'], blockChildNode => {
        searchFor(blockChildNode, ['ExpressionStatement'], expressionChildNode => {

            // Searching for assignments
            searchFor(expressionChildNode, ['BinaryExpression'], binaryExpression => {
                analyseExprTree(packName, binaryExpression).forEach(asLink(definitions, packName));
            });

            // Searching for calls to subscribe
            searchFor(expressionChildNode, ['CallExpression'], callExpression => {
                analyseExprTree(packName, callExpression).forEach(asLink(definitions, packName));
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
                            checkForObservablesInMethods(classChildNode, packName, definitions);
                        }

                    })
                }
            })
        });

    return definitions;
}
