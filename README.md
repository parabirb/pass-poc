# pass-poc
proof of concept for a cryptographically based vaccine passport system. while this can theoretically be securely implemented without HTTPS, the use of a reverse proxy to provide HTTPS is strongly recommended.

## generating keys
run generate-keys.js to generate the keys for the server.

## setting up
1. run `npm i`.
2. run `node generate-keys.js`.
3. run `node .`. your server is now up on port 80 and ready for use.

## adding providers
1. run `node add-medical.js`.
2. enter all necessary information.
3. restart the server.