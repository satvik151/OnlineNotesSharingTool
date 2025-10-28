const admin = require('firebase-admin');
const serviceAccount = require('./online-notes-sharing151-firebase-adminsdk-fbsvc-881061c7e0.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
