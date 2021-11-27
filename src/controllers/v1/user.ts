import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  requestBody,
  requestParam,
  type results
} from 'inversify-express-utils'
import type { GroupService, UserService } from '../../services'
import { type ValidationChain, body, header, param } from 'express-validator'
import type { GetGroupRole } from '../../services/group'
import type { GetUserById } from '@guidojw/bloxy/dist/client/apis/UsersAPI'
import type { GetUsers } from '../../services/user'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/users')
export default class UserController extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.UserService) private readonly userService!: UserService

  @httpGet(
    '/:username/user-id',
    ...UserController.validate('getUserIdFromUsername'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getUserIdFromUsername (@requestParam('username') username: string): Promise<results.JsonResult> {
    return this.json(await this.userService.getUserIdFromUsername(username))
  }

  @httpGet(
    '/:userId/has-badge/:badgeId',
    ...UserController.validate('hasBadge'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async hasBadge (
    @requestParam('userId') userId: number,
      @requestParam('badgeId') badgeId: number
  ): Promise<boolean> {
    return await this.userService.hasBadge(userId, badgeId)
  }

  @httpGet('/', ...UserController.validate('getUsers'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getUsers (@requestBody() body: { userIds: number[] }): Promise<GetUsers> {
    return await this.userService.getUsers(body.userIds)
  }

  @httpGet(
    '/:userId/rank/:groupId',
    ...UserController.validate('getRank'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRank (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number
  ): Promise<results.JsonResult> {
    return this.json(await this.groupService.getRank(groupId, userId))
  }

  @httpGet(
    '/:userId/role/:groupId',
    ...UserController.validate('getRole'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRole (@requestParam('groupId') groupId: number, @requestParam('userId')
    userId: number): Promise<GetGroupRole> {
    return await this.groupService.getRole(groupId, userId)
  }

  @httpGet('/:userId', ...UserController.validate('getUser'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getUser (@requestParam('userId') userId: number): Promise<GetUserById> {
    return await this.userService.getUser(userId)
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getUserIdFromUsername':
        return [
          header('authorization').exists().isString(),
          param('username').isString()
        ]
      case 'hasBadge':
        return [
          header('authorization').exists().isString(),
          param('userId').isInt().toInt(),
          param('badgeId').isInt().toInt()
        ]
      case 'getUsers':
        return [
          header('authorization').exists().isString(),
          body('userIds').exists(),
          body('userIds.*').isInt().toInt()
        ]
      case 'getRank':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt()
        ]
      case 'getRole':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt()
        ]
      case 'getUser':
        return [
          header('authorization').exists().isString(),
          param('userId').isInt().toInt()
        ]

      default:
        return []
    }
  }
}
