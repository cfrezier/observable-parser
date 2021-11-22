const OFFSET = "  ";
const NB_LINES_SCALE_1 = 300;

adaptSizeFromOutputLength = (outputList) => {
    return Math.max(Math.min(Math.round(10.0 * NB_LINES_SCALE_1 / outputList.length) / 10, 1), 0.1);
}

module.exports = (definitions, options) => {
    const outputList = [];
    outputList.push("@startuml");

    // Define subscription event if needed
    if (definitions.hasSubscribes) {
        outputList.push("(subscribe)");
    }

    // Make store definitions a separate part of the graph
    if (definitions.fromStore.length > 0) {
        outputList.push("package Store {");
        definitions.fromStore.forEach(def => {
            outputList.push(OFFSET + "usecase " + def);
        });
        outputList.push("}");
    }

    // Then add all defintions of each class
    Object.keys(definitions.fromClasses).forEach(key => {
        const classDef = definitions.fromClasses[key];
        if (classDef.defs.length + classDef.links.length > 0 || options.addEmpty) {
            outputList.push("package " + key + " {");
            classDef.defs.forEach(def => {
                outputList.push(OFFSET + def);
            })
            classDef.links.forEach(link => {
                outputList.push(OFFSET + link);
            })
            outputList.push("}");
        }
    });

    outputList.push("scale " + (options.scale !== "auto" ? options.scale : adaptSizeFromOutputLength(outputList)));
    outputList.push("@enduml");

    return outputList;
}
