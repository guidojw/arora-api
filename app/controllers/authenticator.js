const { sendError } = require('../helpers/error')
const models = require('../models')

exports.authenticate = (req, res, next) => {
    const admin = models.Admin.findById(req.body.id)
    if (admin && req.body.key === admin.key) {
        next()
    } else {
        sendError(res, 401, 'Incorrect authentication key')
    }
}