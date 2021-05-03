import { ValidationChain, header, query } from 'express-validator'
import { controller, httpGet, interfaces } from 'inversify-express-utils'
import { CatalogService } from '../../services'
import { Request } from 'express'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/catalog')
export default class CatalogController implements interfaces.Controller {
  @inject(TYPES.CatalogService) private readonly _catalogService!: CatalogService

  @httpGet('/', ...CatalogController.validate('getItems'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  async getItems (req: Request): Promise<object[]> {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0
      ? req.originalUrl.slice(queryStart + 1)
      : ''
    return await this._catalogService.getItems(queryString)
  }

  static validate (method: string): ValidationChain[] {
    switch (method) {
      case 'getItems':
        return [
          header('authorization').exists().isString(),
          query('CatalogContext').optional().isInt().toInt(),
          query('Category').optional().isInt().toInt(),
          query('CreatorID').optional().isInt().toInt(),
          query('ResultsPerPage').optional().isInt().toInt(),
          query('Keyword').optional().isString(),
          query('SortType').optional().isString(),
          query('PageNumber').optional().isInt().toInt()
        ]

      default:
        return []
    }
  }
}
