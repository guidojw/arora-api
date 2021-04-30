import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

const publicKey = fs.readFileSync('public.key', 'utf8')
// const privateKey = fs.readFileSync('private.key', 'utf8')

export default class AuthService {
  authenticate (token: string): boolean {
    try {
      this._verify(token)
      return true
    } catch (err) {
      return false
    }
  }

  _verify (token: string): string | object {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
  }

  // _sign (payload: string | object | Buffer): string {
  //   return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
  // }
}
