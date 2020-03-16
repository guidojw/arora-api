'use strict'
const { header } = require('express-validator')

const catalogService = require('../../services/catalog')

exports.validate = method => {
    switch (method) {
        case 'getItems':
            return [
                header('authorization').exists().isString()
            ]
    }
}

exports.getItems = async (req, res) => {
    const query_index = req.originalUrl.indexOf('?')
    const query = query_index > 0 ? req.originalUrl.slice(query_index + 1) : ''
    await res.json(await catalogService.getItems(query))
}
