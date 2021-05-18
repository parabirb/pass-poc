// dependencies
const loki = require("lokijs");
const readlineSync = require("readline-sync");

// init db
const medicals = new loki("medicals.db");
medicals.loadDatabase({}, () => {
    let providers = medicals.getCollection("providers");
    if (providers === null) {
        providers = medicals.addCollection("providers");
    }

    const publicKey = readlineSync.question("What is the public key of the provider? ");
    const name = readlineSync.question("What is the name of the provider? ");
    const information = readlineSync.question("What is the provider's information? ");

    providers.insert({
        publicKey,
        name,
        information
    });

    medicals.save();

    console.log("Medical provider added. Make sure to restart the server.");
});