const dotenv = require('dotenv')
dotenv.config()

const { sendError } = require('../helpers/error')

exports.authenticate = (req, res, next) => {
    if (req.body.key === process.env.APP_KEY) {
        next()
    } else {
        sendError(res, 401, "Incorrect authentication key")
    }
}