import { ValidationChain, header, param } from 'express-validator'
import { controller, httpGet, interfaces, requestParam } from 'inversify-express-utils'
import { GetStatus } from '../../services/status'
import { StatusService } from '../../services'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/status')
export default class StatusController implements interfaces.Controller {
  @inject(TYPES.StatusService) private readonly statusService!: StatusService

  @httpGet('/', ...StatusController.validate('getStatus'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  getStatus (): GetStatus {
    return this.statusService.getStatus()
  }

  @httpGet(
    '/:groupId',
    ...StatusController.validate('getGroupClientStatus'),
    TYPES.ErrorMiddleware,
    TYPES.AuthMiddleware
  )
  async getGroupClientStatus (@requestParam('groupId') groupId: number): Promise<boolean> {
    return await this.statusService.getGroupClientStatus(groupId)
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
