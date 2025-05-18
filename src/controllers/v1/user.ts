import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  requestBody,
  requestParam,
  type results
} from 'inversify-express-utils'
import { type ValidationChain, body, header, param } from 'express-validator'
import type { GetUsers } from '../../services/user'
import { UserService } from '../../services'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/users')
export default class UserV1Controller extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.UserService) private readonly userService!: UserService

  @httpGet(
    '/:username/user-id',
    ...UserV1Controller.validate('getUserIdFromUsername'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getUserIdFromUsername (@requestParam('username') username: string): Promise<results.JsonResult> {
    return this.json(await this.userService.getUserIdFromUsername(username))
  }

  @httpGet('/', ...UserV1Controller.validate('getUsers'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getUsers (@requestBody() body: { userIds: number[] }): Promise<GetUsers> {
    return await this.userService.getUsers(body.userIds)
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getUserIdFromUsername':
        return [
          header('authorization').exists().isString(),
          param('username').isString()
        ]
      case 'getUsers':
        return [
          header('authorization').exists().isString(),
          body('userIds').exists(),
          body('userIds.*').isInt().toInt()
        ]

      default:
        return []
    }
  }
}
