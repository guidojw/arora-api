import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  requestParam,
  type results
} from 'inversify-express-utils'
import { GroupService, UserService } from '../../services'
import { type ValidationChain, header, param } from 'express-validator'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v2/users')
export default class UserV2Controller extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.GroupService)
  private readonly groupService!: GroupService

  @inject(TYPES.UserService)
  private readonly userService!: UserService

  @httpGet(
    '/:userId/rank/:groupId',
    ...UserV2Controller.validate('getRank'),
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
    ...UserV2Controller.validate('getRole'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRole (@requestParam('groupId') groupId: number, @requestParam('userId')
    userId: number): Promise<results.JsonResult> {
    return this.json(await this.groupService.getRole(groupId, userId))
  }

  @httpGet('/:userId', ...UserV2Controller.validate('getUser'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getUser (@requestParam('userId') userId: number): Promise<results.JsonResult> {
    return this.json(await this.userService.getUser(userId))
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
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
