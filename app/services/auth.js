'use strict'
const jwt = require('jsonwebtoken')
const fs = require('fs')

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

function authenticate (token) {
    try {
        verify(token)
        return true
    } catch {
        return false
    }
}

function verify (token) {
    return jwt.verify(token, publicKey, { algorithm: ['RS256'] })
}

// function sign (payload) {
//     return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
// }

module.exports = {
    authenticate
}
