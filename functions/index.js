/* eslint-disable */
const functions = require('firebase-functions')
const app = require('./app')

exports.app = functions.region('southamerica-east1').https.onRequest(app)
