'use strict'
const { header, param } = require('express-validator')
const statusService = require('../../services/status')

function validate(method) {
    switch (method) {
        case 'getStatus':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt()
            ]
    }
}

async function getStatus(req, res) {
    res.json(await statusService.getStatus(req.params.groupId))
}

module.exports = {
    validate,
    getStatus
}
