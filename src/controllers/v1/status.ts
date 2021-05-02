import { ValidationChain, header, param } from 'express-validator'
import { controller, httpGet, interfaces, requestParam } from 'inversify-express-utils'
import { Status } from '../../services/status'
import { StatusService } from '../../services'
import TYPES from '../../util/types'
import { inject } from 'inversify'

@controller('/v1/status')
export default class StatusController implements interfaces.Controller {
  @inject(TYPES.StatusService) private readonly _statusService!: StatusService

  @httpGet('/', ...StatusController.validate('getStatus'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  getStatus (): Status {
    return this._statusService.getStatus()
  }

  @httpGet('/:groupId', ...StatusController.validate('getGroupClientStatus'), TYPES.ErrorMiddleware, TYPES
    .AuthMiddleware)
  async getGroupClientStatus (@requestParam('groupId') groupId: number): Promise<boolean> {
    return await this._statusService.getGroupClientStatus(groupId)
  }

  static validate (method: string): ValidationChain[] {
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
