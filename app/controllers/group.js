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
                    .then(roles => res.send(roles))
                    .catch(() => sendError(res, 503, 'Couldn\'t suspend'))
            } else {
                sendError(res, 403, 'Can\'t suspend HRs')
            }
        }).catch(() => sendError(res, 503, 'Couldn\'t get rank'))
}

exports.getRank = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    console.log(req.params.groupId + ', ' + req.params.userId)
    roblox.getRankInGroup(req.params.groupId, req.params.userId)
        .then(rank => res.json(rank))
        .catch(() => sendError(res, 5003, 'Couldn\'t get rank'))
}

exports.promote = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    roblox.getRankInGroup(req.params.groupId, req.params.userId)
        .then(rank => {
            if (rank > 0) {
                if (rank < 100) {
                    roblox.promote(req.params.groupId, req.params.userId)
                        .then((roles) => {
                            if (roles.newRole.rank === 2) {
                                exports.promote(req, res, next)
                            }
                            res.send(roles)
                        }).catch(() => sendError(res, 503, 'Couldn\'t promote'))
                } else {
                    sendError(res, 403, 'Can\'t promote MRs or higher')
                }
            } else {
                sendError(res, 403,'Can only promote group members')
            }
        }).catch(() => sendError(res, 503, 'Couldn\'t get rank'))
}
