const { param } = require('express-validator')

exports.validate = method => {
    switch (method) {
        case 'suspend':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
        case 'getRank':
            return [
                param('groupId').isNumeric(),
                param('userId').isNumeric()
            ]
    }
}

exports.suspend = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    res.send({"message": "suspend"})
}

exports.getRank = (req, res, next) => {
    req.params.groupId = parseInt(req.params.groupId)
    req.params.userId = parseInt(req.params.userId)
    res.send({"message": "rank"})
}
