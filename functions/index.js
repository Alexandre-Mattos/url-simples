/* eslint-disable */
const functions = require('firebase-functions')
const app = require('./app')

// Inicia o servidor
exports.app = functions.region('southamerica-east1').https.onRequest(app)
