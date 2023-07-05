/* eslint-disable */
const express = require('express')
const app = express()

// Importa as rotas do arquivo index.js na pasta "routes"
const routes = require('./routes/routes')

// Define as rotas principais
app.use('/', routes)

module.exports = app
