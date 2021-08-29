import { Ban, BanCancellation, BanExtension, Exile, Training, TrainingCancellation, TrainingType } from '../../entities'
import { BanService, ExileService, GroupService, TrainingService } from '../../services'
import { ChangeMemberRole, GetGroupStatus, UpdateGroupStatus } from '../../services/group'
import { GetGroup, GetGroupRoles } from '@guidojw/bloxy/src/client/apis/GroupsAPI'
import { ValidationChain, body, header, param, query } from 'express-validator'
import { constants, requestUtil } from '../../util'
import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
  interfaces,
  queryParam,
  requestBody,
  requestParam
} from 'inversify-express-utils'
import { SortQuery } from '../../util/request'
import { inject } from 'inversify'

const { TYPES } = constants
const { decodeScopeQueryParam, decodeSortQueryParam } = requestUtil

@controller('/v1/groups')
export default class GroupController implements interfaces.Controller {
  @inject(TYPES.BanService) private readonly banService!: BanService
  @inject(TYPES.ExileService) private readonly exileService!: ExileService
  @inject(TYPES.GroupService) private readonly groupService!: GroupService
  @inject(TYPES.TrainingService) private readonly trainingService!: TrainingService

  // GroupService
  @httpGet(
    '/:groupId/status',
    ...GroupController.validate('getGroupStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getGroupStatus (@requestParam('groupId') groupId: number): Promise<GetGroupStatus> {
    return await this.groupService.getGroupStatus(groupId)
  }

  @httpGet(
    '/:groupId/roles',
    ...GroupController.validate('getRoles'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getRoles (@requestParam('groupId') groupId: number): Promise<GetGroupRoles> {
    return await this.groupService.getRoles(groupId)
  }

  @httpGet('/:groupId', ...GroupController.validate('getGroup'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getGroup (@requestParam('groupId') groupId: number): Promise<GetGroup> {
    return await this.groupService.getGroup(groupId)
  }

  @httpPut(
    '/:groupId/status',
    ...GroupController.validate('updateGroupStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async updateGroupStatus (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, message: string }
  ): Promise<UpdateGroupStatus> {
    return await this.groupService.updateGroupStatus(groupId, body.message, body.authorId)
  }

  @httpPost(
    '/:groupId/users/:userId/promote',
    ...GroupController.validate('promoteMember'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async promoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<ChangeMemberRole> {
    return await this.groupService.promoteMember(groupId, userId, body.authorId)
  }

  @httpPost(
    '/:groupId/users/:userId/demote',
    ...GroupController.validate('demoteMember'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async demoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<ChangeMemberRole> {
    return await this.groupService.demoteMember(groupId, userId, body.authorId)
  }

  @httpPut(
    '/:groupId/users/:userId',
    ...GroupController.validate('changeMemberRole'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async changeMemberRole (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, rank: number }
  ): Promise<ChangeMemberRole> {
    return await this.groupService.changeMemberRole(groupId, userId, {
      authorId: body.authorId,
      role: body.rank
    })
  }

  // BanService
  @httpGet(
    '/:groupId/bans',
    ...GroupController.validate('getBans'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getBans (
    @requestParam('groupId') groupId: number,
      @queryParam('scope') scope: string[],
      @queryParam('sort') sort: SortQuery
  ): Promise<Ban[]> {
    return await this.banService.getBans(groupId, scope, sort)
  }

  @httpGet(
    '/:groupId/bans/:userId',
    ...GroupController.validate('getBan'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @queryParam('scope') scope: string[]
  ): Promise<Ban> {
    return await this.banService.getBan(groupId, userId, scope)
  }

  @httpPost(
    '/:groupId/bans',
    ...GroupController.validate('postBan'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async postBan (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, duration?: number, reason: string, userId: number }
  ): Promise<Ban> {
    return await this.banService.ban(groupId, body.userId, body)
  }

  @httpPost(
    '/:groupId/bans/:userId/cancel',
    ...GroupController.validate('cancelBan'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async cancelBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<BanCancellation> {
    return await this.banService.unban(groupId, userId, body)
  }

  @httpPost(
    '/:groupId/bans/:userId/extend',
    ...GroupController.validate('extendBan'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async extendBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, duration: number, reason: string }
  ): Promise<BanExtension> {
    return await this.banService.extendBan(groupId, userId, body)
  }

  @httpPut(
    '/:groupId/bans/:userId',
    ...GroupController.validate('putBan'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async putBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { changes: { authorId?: number, reason?: string }, editorId: number }
  ): Promise<Ban> {
    return await this.banService.changeBan(groupId, userId, body)
  }

  // ExileService
  @httpGet(
    '/:groupId/exiles',
    ...GroupController.validate('getExiles'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getExiles (@requestParam('groupId') groupId: number): Promise<Exile[]> {
    return await this.exileService.getExiles(groupId)
  }

  @httpGet(
    '/:groupId/exiles/:userId',
    ...GroupController.validate('getExile'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getExile (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number
  ): Promise<Exile> {
    return await this.exileService.getExile(groupId, userId)
  }

  @httpPost(
    '/:groupId/exiles',
    ...GroupController.validate('postExile'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async postExile (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, reason: string, userId: number }
  ): Promise<Exile> {
    return await this.exileService.exile(groupId, body.userId, body)
  }

  @httpDelete(
    '/:groupId/exiles/:userId',
    ...GroupController.validate('deleteExile'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async deleteExile (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<void> {
    return await this.exileService.unexile(groupId, userId, body)
  }

  // TrainingService
  @httpGet(
    '/:groupId/trainings',
    ...GroupController.validate('getTrainings'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getTrainings (
    @requestParam('groupId') groupId: number,
      @queryParam('scope') scope: string[],
      @queryParam('sort') sort: SortQuery
  ): Promise<Training[]> {
    return await this.trainingService.getTrainings(groupId, scope, sort)
  }

  @httpGet(
    '/:groupId/trainings/types',
    ...GroupController.validate('getTrainingTypes'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getTrainingTypes (@requestParam('groupId') groupId: number): Promise<TrainingType[]> {
    return await this.trainingService.getTrainingTypes(groupId)
  }

  @httpGet(
    '/:groupId/trainings/:trainingId',
    ...GroupController.validate('getTraining'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @queryParam('scope') scope: string[]
  ): Promise<Training> {
    return await this.trainingService.getTraining(groupId, trainingId, scope)
  }

  @httpPost(
    '/:groupId/trainings',
    ...GroupController.validate('postTraining'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async postTraining (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, typeId: number, date: number, notes?: string }
  ): Promise<Training> {
    return await this.trainingService.addTraining(groupId, body)
  }

  @httpPost(
    '/:groupId/trainings/:trainingId/cancel',
    ...GroupController.validate('cancelTraining'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async cancelTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<TrainingCancellation> {
    return await this.trainingService.cancelTraining(groupId, trainingId, body)
  }

  @httpPost(
    '/:groupId/trainings/types',
    ...GroupController.validate('postTrainingType'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async postTrainingType (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { abbreviation: string, name: string }
  ): Promise<TrainingType> {
    return await this.trainingService.createTrainingType(groupId, body)
  }

  @httpPut(
    '/:groupId/trainings/:trainingId',
    ...GroupController.validate('putTraining'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async putTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @requestBody() body: {
        changes: { typeId?: number, date?: number, notes?: string, authorId?: number }
        editorId: number
      }
  ): Promise<Training> {
    return await this.trainingService.changeTraining(groupId, trainingId, body)
  }

  @httpPut(
    '/:groupId/trainings/types/:typeId',
    ...GroupController.validate('putTrainingType'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async putTrainingType (
    @requestParam('groupId') groupId: number,
      @requestParam('typeId') typeId: number,
      @requestBody() body: {
        changes: { abbreviation?: string, name?: string }
        editorId: number
      }
  ): Promise<TrainingType> {
    return await this.trainingService.changeTrainingType(groupId, typeId, body)
  }

  @httpDelete(
    '/:groupId/trainings/types/:typeId',
    ...GroupController.validate('deleteTrainingType'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async deleteTrainingType (
    @requestParam('groupId') groupId: number,
      @requestParam('typeId') typeId: number
  ): Promise<void> {
    return await this.trainingService.deleteTrainingType(groupId, typeId)
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

      case 'updateGroupStatus':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('message').exists().isString()
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

      // BanService
      case 'getBans':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          query('scope').customSanitizer(decodeScopeQueryParam),
          query('sort').customSanitizer(decodeSortQueryParam)
        ]
      case 'getBan':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          query('scope').customSanitizer(decodeScopeQueryParam)
        ]

      case 'postBan':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('duration').optional().isInt().toInt(),
          body('reason').exists().isString(),
          body('userId').exists().isInt().toInt()
        ]
      case 'cancelBan':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString()
        ]
      case 'extendBan':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('duration').exists().isInt().toInt(),
          body('reason').exists().isString()
        ]

      case 'putBan':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').exists().isInt().toInt(),
          body('editorId').exists().isInt().toInt(),
          body('changes.authorId').optional().isInt().toInt(),
          body('changes.reason').optional().isString()
        ]

      // ExileService
      case 'getExiles':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]
      case 'getExile':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt()
        ]
      case 'postExile':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString(),
          body('userId').exists().isInt().toInt()
        ]
      case 'deleteExile':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('userId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString()
        ]

      // TrainingService
      case 'getTrainings':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          query('scope').customSanitizer(decodeScopeQueryParam),
          query('sort').customSanitizer(decodeSortQueryParam)
        ]
      case 'getTraining':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('trainingId').isInt().toInt(),
          query('scope').customSanitizer(decodeScopeQueryParam)
        ]
      case 'getTrainingTypes':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]

      case 'postTraining':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('typeId').exists().isInt().toInt(),
          body('date').exists(),
          body('notes').optional().isString()
        ]
      case 'cancelTraining':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('trainingId').isInt().toInt(),
          body('authorId').exists().isInt().toInt(),
          body('reason').exists().isString()
        ]
      case 'postTrainingType':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          body('name').exists().isString(),
          body('abbreviation').exists().isString()
        ]

      case 'putTraining':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('trainingId').isInt().toInt(),
          body('editorId').exists().isInt().toInt(),
          body('changes.typeId').optional().isInt().toInt(),
          body('changes.date').optional().isInt().toInt(),
          body('changes.notes').optional().isString(),
          body('changes.authorId').optional().isInt().toInt()
        ]
      case 'putTrainingType':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('typeId').isInt().toInt(),
          body('editorId').exists().isInt().toInt(),
          body('changes.name').optional().isString(),
          body('changes.abbreviation').optional().isString()
        ]

      case 'deleteTrainingType':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt(),
          param('typeId').isInt().toInt()
        ]

      default:
        return []
    }
  }
}
