/* eslint-disable */
const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const { encurtarUrl, recuperarUrl } = require('../controllers/urlController')

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json())

router.post('/encurtar', encurtarUrl)
router.get('/:id', recuperarUrl)

module.exports = router
