'use strict'

const fs = require('fs')
const jwt = require('jsonwebtoken')

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

class AuthService {
  authenticate (token) {
    try {
      this._verify(token)
      return true
    } catch (err) {
      return false
    }
  }

  _verify (token) {
    return jwt.verify(token, publicKey, { algorithm: ['RS256'] })
  }

  // _sign(payload) {
  //     return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
  // }
}

module.exports = AuthService
