// dependencies
const fs = require("fs");
const loki = require("lokijs");
const express = require("express");
const bodyParser = require("body-parser");
let nacl = require("tweetnacl");
nacl.auth = require("tweetnacl-auth");
nacl.util = require("tweetnacl-util");

console.log("Initializing keys...");
// initialize keys
if (!fs.existsSync("keys.json")) {
    throw new Error("Keys not generated yet. Run generate-keys.js to generate keys.");
}
let base64Keys = JSON.parse(fs.readFileSync("keys.json").toString());
const keys = {
    publicKey: nacl.util.decodeBase64(base64Keys.publicKey),
    secretKey: nacl.util.decodeBase64(base64Keys.secretKey)
};

console.log("Initializing database...");
// initialize database
const medicals = new loki("medicals.db", {
    autoload: true
});
medicals.loadDatabase({}, () => {
    let providers = medicals.getCollection("providers");
    if (providers === null) {
        providers = medicals.addCollection("providers");
    }
    console.log("Starting Express server...");
    // start express server
    const app = new express();
    app.set("view engine", "ejs");
    app.use(express.static("public"));
    app.use(bodyParser.urlencoded({extended: true}));

    console.log("Initializing views...");
    app.get("/", (req, res) => {
        res.render("index");
    });
    app.get("/medical", (req, res) => {
        res.render("medical");
    });
    app.get("/verify", (req, res) => {
        res.render("verify", {
            base64Keys
        });
    });
    app.get("/passport", (req, res) => {
        res.render("passport");
    });
    app.get("/create-passport", (req, res) => {
        res.render("create-passport", {
            base64Keys
        });
    });
    app.get("/:path", (req, res) => {
        res.render("not-found");
    });
    app.post("/create", (req, res) => {
        if (providers.findOne({
            publicKey: req.body.key
        }) === null) {
            res.status(401);
            res.json({success: false, error: "Your key is not authorized!"});
            return;
        }
        try {
            let provider = providers.findOne({publicKey: req.body.key});
            let info = JSON.parse(nacl.util.encodeUTF8(nacl.sign.open(nacl.util.decodeBase64(req.body.signature), nacl.util.decodeBase64(req.body.key))));
            let signed = nacl.sign(nacl.util.decodeUTF8(JSON.stringify({
                publicKey: info.patientKey,
                dob: info.dob,
                expiry: info.expiry,
                name: info.name,
                provider: {
                    name: provider.name,
                    information: provider.information
                }
            })), keys.secretKey);
            res.json({success: true, data: nacl.util.encodeBase64(signed)});
            return;
        } catch (e) {
            res.status(500);
            res.json({success: false, error: "Server encountered an error."});
            return;
        }
    });

    console.log("Starting app (HTTP) on port 8080... (MAKE SURE TO SET UP HTTPS VIA REVERSE PROXY)");
    app.listen(8080);
});