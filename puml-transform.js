module.exports = (parsedAST) => {
    parsedAST.forEach((ast) => {
        console.log(ast.fileName, ast);
    });
}
