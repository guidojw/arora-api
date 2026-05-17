import { BaseHttpController, controller, httpGet, type interfaces } from 'inversify-express-utils'
import { type ValidationChain, header } from 'express-validator'
import { GetStatus } from '../../services/status'
import { StatusService } from '../../services'
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

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getStatus':
        return [
          header('authorization').exists().isString()
        ]

      default:
        return []
    }
  }
}
