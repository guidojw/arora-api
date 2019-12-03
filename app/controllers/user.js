const { param } = require('express-validator/check')

exports.validate = method => {
    switch (method) {
        case 'getRank':
            return [
                param('userId').isNumeric(),
                param('groupId').isNumeric()
            ]
    }
}

exports.getRank = (req, res, next) => {
    req.params.userId = parseInt(req.params.userId)
    req.params.groupId = parseInt(req.params.groupId)

}
