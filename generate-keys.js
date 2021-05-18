const fs = require("fs");
let nacl = require("tweetnacl");
nacl.util = require("tweetnacl-util");

if (fs.existsSync("keys.json")) {
    throw new Error("keys.json already exists! Refuse to generate new keys.");
}

console.log("Generating keys...");
const rawKeypair = nacl.sign.keyPair();
const keypair = {
    publicKey: nacl.util.encodeBase64(rawKeypair.publicKey),
    secretKey: nacl.util.encodeBase64(rawKeypair.secretKey)
};
console.log("Writing keys...");
fs.writeFileSync("keys.json", JSON.stringify(keypair));