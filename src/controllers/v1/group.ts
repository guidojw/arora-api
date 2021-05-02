import { BanService, ExileService, GroupService, TrainingService } from '../../services'
import { ChangeMemberRoleResult, GroupStatus } from '../../services/group'
import { GetGroup, GetGroupRoles } from 'bloxy/src/client/apis/GroupsAPI'
import { ScopeQuery, SortQuery } from '../../util/request'
import { ValidationChain, body, header, param, query } from 'express-validator'
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  interfaces,
  queryParam,
  requestBody,
  requestParam,
} from 'inversify-express-utils'
import TYPES from '../../util/types'
import { inject } from 'inversify'
import { requestUtil } from '../../util'

const { decodeScopeQueryParam, decodeSortQueryParam } = requestUtil

@controller('/v1/group')
export default class GroupController implements interfaces.Controller {
  @inject(TYPES.BanService) private readonly _banService!: BanService
  @inject(TYPES.ExileService) private readonly _exileService!: ExileService
  @inject(TYPES.GroupService) private readonly _groupService!: GroupService
  @inject(TYPES.TrainingService) private readonly _trainingService!: TrainingService

  // GroupService
  @httpGet('/:groupId/shout', ...GroupController.validate('getShout'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getShout (@requestParam('groupId') groupId: number): Promise<GetGroup['shout']> {
    return await this._groupService.getShout(groupId)
  }

  @httpGet('/:groupId/roles', ...GroupController.validate('getRoles'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getRoles (@requestParam('groupId') groupId: number): Promise<GetGroupRoles> {
    return await this._groupService.getRoles(groupId)
  }

  @httpGet('/:groupId', ...GroupController.validate('getGroup'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getGroup (@requestParam('groupId') groupId: number): Promise<GetGroup> {
    return await this._groupService.getGroup(groupId)
  }

  @httpPost('/:groupId/shout', ...GroupController.validate('postShout'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async postShout (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, message: string }
  ): Promise<GroupStatus> {
    return await this._groupService.shout(groupId, body.message, body.authorId)
  }

  @httpPost('/:groupId/users/:userId/promote', ...GroupController.validate('promoteMember'), TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware)
  async promoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<ChangeMemberRoleResult> {
    return await this._groupService.promoteMember(groupId, userId, body.authorId)
  }

  @httpPost('/:groupId/users/:userId/demote', ...GroupController.validate('demoteMember'), TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware)
  async demoteMember (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number }
  ): Promise<ChangeMemberRoleResult> {
    return await this._groupService.demoteMember(groupId, userId, body.authorId)
  }

  @httpPut('/:groupId/users/:userId', ...GroupController.validate('changeMemberRole'), TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware)
  async changeMemberRole (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, rank: number }
  ): Promise<ChangeMemberRoleResult> {
    return await this._groupService.changeMemberRole(groupId, userId, {
      role: body.rank,
      authorId: body.authorId
    })
  }

  // BanService
  @httpGet('/:groupId/bans', ...GroupController.validate('getBans'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getBans (
    @requestParam('groupId') groupId: number,
      @queryParam('scope') scope: ScopeQuery,
      @queryParam('sort') sort: SortQuery
  ): Promise<any> {
    return await this._banService.getBans(groupId, scope, sort)
  }

  @httpGet('/:groupId/bans/:userId', ...GroupController.validate('getBan'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @queryParam('scope') scope: ScopeQuery
  ): Promise<any> {
    return await this._banService.getBan(groupId, userId, scope)
  }

  @httpPost('/:groupId/bans', ...GroupController.validate('postBan'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async postBan (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, duration?: number, reason: string, userId: number }
  ): Promise<any> {
    return await this._banService.ban(groupId, body.userId, {
      authorId: body.authorId,
      duration: body.duration,
      reason: body.reason
    })
  }

  @httpPost('/:groupId/bans/:userId/cancel', ...GroupController.validate('cancelBan'), TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware)
  async cancelBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<any> {
    return await this._banService.unban(groupId, userId, {
      authorId: body.authorId,
      reason: body.reason
    })
  }

  @httpPost('/:groupId/bans/:userId/extend', ...GroupController.validate('extendBan'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async extendBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, duration: number, reason: string }
  ): Promise<any> {
    return await this._banService.extendBan(groupId, userId, {
      authorId: body.authorId,
      duration: body.duration,
      reason: body.reason
    })
  }

  @httpPut('/:groupId/bans/:userId', ...GroupController.validate('putBan'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async putBan (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { changes: { authorId?: number, reason?: number }, editorId: number }
  ): Promise<any> {
    return await this._banService.changeBan(groupId, userId, {
      changes: body.changes,
      editorId: body.editorId
    })
  }

  // ExileService
  @httpGet('/:groupId/exiles', ...GroupController.validate('getExiles'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getExiles (@requestParam('groupId') groupId: number): Promise<any> {
    return await this._exileService.getExiles(groupId)
  }

  @httpGet('/:groupId/exiles/:userId', ...GroupController.validate('getExile'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async getExile (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number
  ): Promise<any> {
    return await this._exileService.getExile(groupId, userId)
  }

  @httpPost('/:groupId/exiles', ...GroupController.validate('postExile'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async postExile (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, reason: string, userId: number }
  ): Promise<any> {
    return await this._exileService.exile(groupId, body.userId, {
      authorId: body.authorId,
      reason: body.reason
    })
  }

  @httpPost('/:groupId/exiles/:userId', ...GroupController.validate('deleteExile'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async deleteExile (
    @requestParam('groupId') groupId: number,
      @requestParam('userId') userId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<any> {
    return await this._exileService.unexile(groupId, userId, {
      authorId: body.authorId,
      reason: body.reason
    })
  }

  // TrainingService
  @httpGet('/:groupId/trainings', ...GroupController.validate('getTrainings'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async getTrainings (
    @requestParam('groupId') groupId: number,
      @queryParam('scope') scope: ScopeQuery,
      @queryParam('sort') sort: SortQuery
  ): Promise<any> {
    return await this._trainingService.getTrainings(groupId, scope, sort)
  }

  @httpGet('/:groupId/trainings/:trainingId', ...GroupController.validate('getTraining'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async getTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @queryParam('scope') scope: ScopeQuery
  ): Promise<any> {
    return await this._trainingService.getTraining(groupId, trainingId, scope)
  }

  @httpGet('/:groupId/trainings/types', ...GroupController.validate('getTrainingTypes'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async getTrainingTypes (): Promise<any> {
    return await this._trainingService.getTrainingTypes()
  }

  @httpPost('/:groupId/trainings', ...GroupController.validate('postTraining'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async postTraining (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { authorId: number, typeId: number, date: number, notes?: string }
  ): Promise<any> {
    return await this._trainingService.addTraining(groupId, {
      authorId: body.authorId,
      typeId: body.typeId,
      date: body.date,
      notes: body.notes
    })
  }

  @httpPost('/:groupId/trainings/:trainingId/cancel', ...GroupController.validate('cancelTraining'), TYPES
    .ErrorMiddleware, TYPES.AuthMiddleware)
  async cancelTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @requestBody() body: { authorId: number, reason: string }
  ): Promise<any> {
    return await this._trainingService.cancelTraining(groupId, trainingId, {
      authorId: body.authorId,
      reason: body.reason
    })
  }

  @httpPost('/:groupId/trainings/types', ...GroupController.validate('postTrainingType'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async postTrainingType (
    @requestParam('groupId') groupId: number,
      @requestBody() body: { abbreviation: string, name: string }
  ): Promise<any> {
    return await this._trainingService.createTrainingType(groupId, {
      abbreviation: body.abbreviation,
      name: body.name
    })
  }

  @httpPut('/:groupId/trainings/:trainingId', ...GroupController.validate('putTraining'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async putTraining (
    @requestParam('groupId') groupId: number,
      @requestParam('trainingId') trainingId: number,
      @requestBody() body: {
        editorId: number
        changes: { typeId?: number, date?: number, notes?: string, authorId?: number }
      }
  ): Promise<any> {
    return await this._trainingService.changeTraining(groupId, trainingId, {
      editorId: body.editorId,
      changes: body.changes
    })
  }

  @httpPut('/:groupId/trainings/types/:typeId', ...GroupController.validate('putTrainingType'), TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware)
  async putTrainingType (
    @requestParam('groupId') groupId: number,
      @requestParam('typeId') typeId: number,
      @requestBody() body: { changes: { abbreviation: string, name: string } }
  ): Promise<any> {
    return await this._trainingService.changeTrainingType(groupId, typeId, {
      changes: body.changes
    })
  }

  @httpPost('/:groupId/trainings/types/:typeId', ...GroupController.validate('deleteTrainingType'), TYPES
    .ErrorMiddleware, TYPES.AuthMiddleware)
  async deleteTrainingType (
    @requestParam('groupId') groupId: number,
      @requestParam('typeId') typeId: number
  ): Promise<any> {
    return await this._trainingService.deleteTrainingType(groupId, typeId)
  }

  static validate (method: string): ValidationChain[] {
    switch (method) {
      // GroupService
      case 'getShout':
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

      case 'postShout':
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
