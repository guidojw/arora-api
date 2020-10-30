'use strict'
const express = require('express')

export default class CatalogRouter {
    constructor(catalogController, { handleValidationResult }, { authenticate }) {
        const router = express.Router()

        router.get('/', catalogController.validate('getItems'), handleValidationResult, authenticate, catalogController
            .getItems)

        return router
    }
}

