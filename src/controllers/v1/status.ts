import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  requestParam,
  type results
} from 'inversify-express-utils'
import { type ValidationChain, header, param } from 'express-validator'
import type { GetStatus } from '../../services/status'
import type { StatusService } from '../../services'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/status')
export default class StatusController extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.StatusService) private readonly statusService!: StatusService

  @httpGet('/', ...StatusController.validate('getStatus'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public getStatus (): GetStatus {
    return this.statusService.getStatus()
  }

  @httpGet(
    '/:groupId',
    ...StatusController.validate('getGroupClientStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  public async getGroupClientStatus (@requestParam('groupId') groupId: number): Promise<results.JsonResult> {
    return this.json(await this.statusService.getGroupClientStatus(groupId))
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getStatus':
        return [
          header('authorization').exists().isString()
        ]
      case 'getGroupClientStatus':
        return [
          header('authorization').exists().isString(),
          param('groupId').isInt().toInt()
        ]

      default:
        return []
    }
  }
}
