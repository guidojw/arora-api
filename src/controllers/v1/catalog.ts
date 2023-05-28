import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  type results
} from 'inversify-express-utils'
import { type ValidationChain, header, query } from 'express-validator'
import { CatalogService } from '../../services'
import { Request } from 'express'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/catalog')
export default class CatalogController extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.CatalogService) private readonly catalogService!: CatalogService

  @httpGet('/', ...CatalogController.validate('getMusicAssets'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getMusicAssets (req: Request): Promise<results.JsonResult> {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0
      ? req.originalUrl.slice(queryStart + 1)
      : ''
    return this.json(await this.catalogService.getMusicAssets(queryString))
  }

  private static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getMusicAssets':
        return [
          header('authorization').exists().isString(),
          query('limit').optional().isInt().toInt(),
          query('pageNumber').optional().isInt().toInt(),
          query('keyword').optional().isString(),
          query('creatorType').optional().isInt().toInt(),
          query('creatorTargetId').optional().isInt().toInt(),
          query('useCreatorWhitelist').optional().isBoolean(),
          query('includeOnlyVerifiedCreators').optional().isBoolean()
        ]

      default:
        return []
    }
  }
}
