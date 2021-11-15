const currentPath = process.cwd();

module.exports = (sourceFilename) => {
    return sourceFilename.replace(currentPath, '');
}
