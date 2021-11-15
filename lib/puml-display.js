const OFFSET = "  ";

module.exports = (definitions, options) => {
    console.log("@startuml");

    // Define subscription event if needed
    if (definitions.hasSubscribes) {
        console.log("(subscribe)");
    }

    // Make store definitions a separate part of the graph
    if (definitions.fromStore.length > 0) {
        console.log("package Store {");
        definitions.fromStore.forEach(def => {
            console.log(OFFSET + "usecase " + def);
        });
        console.log("}");
    }

    // Then add all defintions of each class
    Object.keys(definitions.fromClasses).forEach(key => {
        const classDef = definitions.fromClasses[key];
        if (classDef.defs.length + classDef.links.length > 0 || options.addEmpty) {
            console.log("package " + key + " {");
            classDef.defs.forEach(def => {
                console.log(OFFSET + def);
            })
            classDef.links.forEach(link => {
                console.log(OFFSET + link);
            })
            console.log("}");
        }
    });
    console.log("@enduml");
}
