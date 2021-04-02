'use strict'

require('dotenv').config()

const express = require('express')

const loaders = require('./src/loaders')

const app = express()
require('express-async-errors')
loaders.init(app)

module.exports = app
