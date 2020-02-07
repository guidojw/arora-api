'use strict'
const { header } = require('express-validator')

const statusService = require('../../services/status')

exports.validate = method => {
    switch (method) {
        case 'getStatus':
            return [
                header('authorization').exists().isString()
            ]
    }
}

exports.getStatus = async (req, res) => {
    res.json(await statusService.getStatus())
}
