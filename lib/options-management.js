const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')

const arguments = yargs(hideBin(process.argv))
    .option('directory', {
        alias: 'd',
        type: 'string',
        description: 'Root directory for search (default: .)'
    })
    .option('exclude', {
        alias: 'x',
        description: 'Ignore files matching one of these patterns (default: [\'.spec.ts\', \'main.ts\'])'
    })
    .array('exclude')
    .option('empty', {
        alias: 'e',
        type: 'boolean',
        description: 'Add empty classes to produce puml graph (default: false)'
    })
    .boolean('empty')
    .option('nodemodules', {
        alias: 'n',
        type: 'boolean',
        description: 'Add node_modules files to the scan (default: false)'
    })
    .boolean('nodemodules')
    .option('scale', {
        alias: 's',
        type: 'number',
        description: 'Set scale for generated diagram (default: calculated from number of generated lines in output file)'
    })
    .argv

const options = {
    rootDirectory: arguments.directory || '.',
    exclude: arguments.exclude || ['.spec.ts', 'main.ts'],
    addEmpty: arguments.empty === undefined ? false : arguments.empty,
    addNodeModules: arguments.nodemodules === undefined ? false : arguments.nodemodules,
    scale: arguments.scale || 'auto',
}

module.exports = options;
