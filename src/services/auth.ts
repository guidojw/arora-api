import * as fs from 'node:fs'
import * as jwt from 'jsonwebtoken'
import { injectable } from 'inversify'

const publicKey = fs.readFileSync('public.key', 'utf8')
const privateKey = fs.readFileSync('private.key', 'utf8')

@injectable()
export default class AuthService {
  public authenticate (token: string): boolean {
    try {
      this.verify(token)
      return true
    } catch {
      return false
    }
  }

  public sign (payload: string | object | Buffer): string {
    return jwt.sign(payload, privateKey, { algorithm: 'RS256' })
  }

  public verify (token: string): string | object {
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
  }
}
