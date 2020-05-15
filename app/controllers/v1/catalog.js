'use strict'
const { header, query } = require('express-validator')
const catalogService = require('../../services/catalog')

exports.validate = method => {
    switch (method) {
        case 'getItems':
            return [
                header('authorization').exists().isString(),
                query('CatalogContext').optional().isNumeric().toInt(),
                query('Category').optional().isNumeric().toInt(),
                query('CreatorID').optional().isNumeric().toInt(),
                query('ResultsPerPage').optional().isNumeric().toInt(),
                query('Keyword').optional().isString(),
                query('SortType').optional().isString(),
                query('PageNumber').optional().isNumeric().toInt()
            ]
    }
}

exports.getItems = async (req, res) => {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0 ? req.originalUrl.slice(queryStart + 1) : ''
    await res.json(await catalogService.getItems(queryString))
}
