const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const { sendError } = require('../helpers/error')

exports.validate = method => {
    switch (method) {
        case 'suspend':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString()
            ]
        case 'getRank':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString()
            ]
        case 'promote':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric(),
                body('id').exists().isNumeric(),
                body('key').exists().isString()
            ]
    }
}

exports.suspend = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    roblox.getRankInGroup(req.params.groupId, req.params.userId)
        .then((rank) => {
            if (rank < 200) {
                roblox.setRank(req.params.groupId, req.params.userId, 2)
                    .then(res.send)
                    .catch(err => sendError(res, 401, err.message))
            } else {
                sendError(res, 401, 'Can\'t suspend HRs')
            }
        }).catch(err => sendError(res, 401, err.message))
}

exports.getRank = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    roblox.getRankInGroup(req.params.groupId, req.params.userId)
        .then(res.send)
        .catch(err => sendError(res, 401, err.message))
}

exports.promote = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    roblox.getRankInGroup(req.params.groupId, req.params.userId)
        .then(rank => {
            if (rank < 100) {
                roblox.promote(req.params.groupId, req.params.userId)
                    .then((roles) => {
                        if (roles.newRole.rank == 2) {
                            exports.promote(req, res, next)
                        }
                        res.send(roles)
                    }).catch((err) => {
                        sendError(res, 401, err.message)
                })
            } else {
                sendError(res, 401, 'Can\'t promote MRs or higher')
            }
        }).catch(err => sendError(res, 401, err.message))
}
