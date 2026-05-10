import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  type interfaces,
  queryParam,
  requestBody,
  response,
  type results
} from 'inversify-express-utils'
import { type ContextRunner, type ValidationChain, body, header, oneOf, query } from 'express-validator'
import { type RequestHandler, Response } from 'express'
import { BadRequestError } from '../../errors'
import { OAuthService } from '../../services'
import { constants } from '../../util'
import { inject } from 'inversify'
import { rateLimit } from 'express-rate-limit'

const { TYPES } = constants
@controller('/v1/oauth')
export default class OAuthController extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.OAuthService)
  private readonly oAuthService!: OAuthService

  @httpGet(
    '/callback',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false
    }),
    ...OAuthController.validate('getCallback'),
    TYPES.ErrorMiddleware
  )
  public async getCallback (
    @queryParam('state') state: string,
      @response() res: Response,
      @queryParam('code') code?: string,
      @queryParam('error_description') errorDescription?: string
  ): Promise<void> {
    if (typeof code !== 'undefined') {
      await this.oAuthService.handleCallback(state, code)
      res.status(303).setHeader('Location', 'https://roblox.com').send()
    } else {
      throw new BadRequestError(errorDescription)
    }
  }

  @httpPost(
    '/roblox/verify',
    ...OAuthController.validate('verifyRobloxUser'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async verifyRobloxUser (@requestBody() body: { id: string }): Promise<results.JsonResult> {
    return this.json(await this.oAuthService.verifyRobloxUser(body.id))
  }

  @httpGet(
    '/roblox/access-token',
    ...OAuthController.validate('getRobloxAccessToken'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRobloxAccessToken (@requestBody() body: { id: string }): Promise<results.JsonResult> {
    return this.json(await this.oAuthService.getRobloxAccessToken(body.id))
  }

  private static validate (method: string): ValidationChain[] | Array<RequestHandler & ContextRunner> {
    switch (method) {
      case 'getCallback':
        return [
          oneOf([
            query(['code', 'state']).exists().isString(),
            query(['error', 'error_description', 'state']).exists().isString()
          ])
        ]
      case 'verifyRobloxUser':
        return [
          header('authorization').exists().isString(),
          body('id').exists()
        ]
      case 'getRobloxAccessToken':
        return [
          header('authorization').exists().isString(),
          body('id').exists()
        ]

      default:
        return []
    }
  }
}
