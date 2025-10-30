const admin = require("firebase-admin");
const path = require("path");

// Get absolute path to the service account file
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
