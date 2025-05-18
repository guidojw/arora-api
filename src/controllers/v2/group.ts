import {
  BaseHttpController,
  controller,
  httpGet,
  httpPost,
  httpPut,
  type interfaces,
  requestBody,
  requestParam,
  type results
} from 'inversify-express-utils'
import { type ValidationChain, body, header, param } from 'express-validator'
import { GroupService } from '../../services'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v2/groups')
export default class GroupV2Controller extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.GroupService)
  private readonly groupService!: GroupService

  // GroupService
  @httpGet(
    '/:groupId/status',
    ...GroupV2Controller.validate('getGroupStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getGroupStatus (@requestParam('groupId') groupId: number): Promise<results.JsonResult> {
    return this.json(await this.groupService.getGroupStatus(groupId))
  }

  @httpGet(
    '/:groupId/roles',
    ...GroupV2Controller.validate('getRoles'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRoles (@requestParam('groupId') groupId: number): Promise<results.JsonResult> {
    return this.json(await this.groupService.getRoles(groupId))
  }

  @httpGet('/:groupId', ...GroupV2Controller.validate('getGroup'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getGroup (@requestParam('groupId') groupId: number): Promise<results.JsonResult> {
    return this.json(await this.groupService.getGroup(groupId))
  }

  @httpPut(
    '/:groupId/status',
    ...GroupV2Controller.validate('updateGroupStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async updateGroupStatus (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, message: string }
  ): Promise<results.JsonResult> {
    return this.json(this.groupService.updateGroupStatus(groupId, body.message, body.authorId))
  }

  @httpPost(
    '/:groupId/users/:userId/promote',
    ...GroupV2Controller.validate('promoteMember'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async promoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<results.JsonResult> {
    return this.json(await this.groupService.promoteMember(groupId, userId, body.authorId))
  }

  @httpPost(
    '/:groupId/users/:userId/demote',
    ...GroupV2Controller.validate('demoteMember'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async demoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<results.JsonResult> {
    return this.json(await this.groupService.demoteMember(groupId, userId, body.authorId))
  }

  @httpPut(
    '/:groupId/users/:userId',
    ...GroupV2Controller.validate('changeMemberRole'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async changeMemberRole (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, rank: number }
  ): Promise<results.JsonResult> {
    return this.json(await this.groupService.changeMemberRole(groupId, userId, {
      authorId: body.authorId,
      role: body.rank
    }))
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      // GroupService
      case 'getGroupStatus':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]
      case 'getRoles':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]
      case 'getGroup':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]

      case 'promoteMember':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('authorId').optional().isInt().toInt()
        ]
      case 'demoteMember':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('authorId').optional().isInt().toInt()
        ]

      case 'changeMemberRole':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('rank').exists().isInt().toInt(),
          body('authorId').optional().isInt().toInt()
        ]

      default:
        return []
    }
  }
}
