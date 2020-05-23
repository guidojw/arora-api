'use strict'
const jwt = require('jsonwebtoken')
const fs = require('fs')

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

exports.authenticate = token => {
    try {
        exports.verify(token)
        return true
    } catch {
        return false
    }
}

exports.verify = token => {
    return jwt.verify(token, publicKey, { algorithm: ['RS256'] })
}

// exports.sign = payload => {
//     return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
// }
