'use strict'
const { header, query } = require('express-validator')
const { catalogService } = require('../../services')

function validate (method) {
    switch (method) {
        case 'getItems':
            return [
                header('authorization').exists().isString(),
                query('CatalogContext').optional().isInt().toInt(),
                query('Category').optional().isInt().toInt(),
                query('CreatorID').optional().isInt().toInt(),
                query('ResultsPerPage').optional().isInt().toInt(),
                query('Keyword').optional().isString(),
                query('SortType').optional().isString(),
                query('PageNumber').optional().isInt().toInt()
            ]
    }
}

async function getItems (req, res) {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0 ? req.originalUrl.slice(queryStart + 1) : ''
    await res.json(await catalogService.getItems(queryString))
}

module.exports = {
    validate,
    getItems
}
