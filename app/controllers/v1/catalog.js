'use strict'
const { header, query } = require('express-validator')

const catalogService = require('../../services/catalog')

exports.validate = method => {
    switch (method) {
        case 'getItems':
            return [
                header('authorization').exists().isString(),
                query('CatalogContext').optional().isNumeric(),
                query('Category').optional().isNumeric(),
                query('CreatorID').optional().isNumeric(),
                query('ResultsPerPage').optional().isNumeric(),
                query('Keyword').optional().isString(),
                query('SortType').optional().isString(),
                query('PageNumber').optional().isNumeric()
            ]
    }
}

exports.getItems = async (req, res) => {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0 ? req.originalUrl.slice(queryStart + 1) : ''
    await res.json(await catalogService.getItems(queryString))
}
