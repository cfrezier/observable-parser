const OFFSET = "  ";

let outputLength = 0;
const output = (line) => {
    console.log(line);
    outputLength++;
}

const NB_LINES_SCALE_1 = 300;
adaptSizeFromOutputLength = () => {
    return Math.round(10.0 * NB_LINES_SCALE_1 / outputLength) / 10;
}

module.exports = (definitions, options) => {
    output("@startuml");

    // Define subscription event if needed
    if (definitions.hasSubscribes) {
        output("(subscribe)");
    }

    // Make store definitions a separate part of the graph
    if (definitions.fromStore.length > 0) {
        output("package Store {");
        definitions.fromStore.forEach(def => {
            output(OFFSET + "usecase " + def);
        });
        output("}");
    }

    // Then add all defintions of each class
    Object.keys(definitions.fromClasses).forEach(key => {
        const classDef = definitions.fromClasses[key];
        if (classDef.defs.length + classDef.links.length > 0 || options.addEmpty) {
            output("package " + key + " {");
            classDef.defs.forEach(def => {
                output(OFFSET + def);
            })
            classDef.links.forEach(link => {
                output(OFFSET + link);
            })
            output("}");
        }
    });

    output("scale " + (options.scale !== "auto" ? options.scale : adaptSizeFromOutputLength()));
    output("@enduml");
}
