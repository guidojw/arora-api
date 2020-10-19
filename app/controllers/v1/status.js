'use strict'
const { header, param } = require('express-validator')
const statusService = require('../../services/status')

exports.validate = method => {
    switch (method) {
        case 'getStatus':
            return [
                header('authorization').exists().isString(),
                param('groupId').isInt().toInt()
            ]
    }
}

exports.getStatus = (req, res) => {
    res.json(statusService.getStatus(req.params.groupId))
}
