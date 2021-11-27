import {
  BaseHttpController,
  controller,
  httpGet,
  type interfaces,
  type results
} from 'inversify-express-utils'
import { type ValidationChain, header, query } from 'express-validator'
import type { CatalogService } from '../../services'
import type { Request } from 'express'
import { constants } from '../../util'
import { inject } from 'inversify'

const { TYPES } = constants

@controller('/v1/catalog')
export default class CatalogController extends BaseHttpController implements interfaces.Controller {
  @inject(TYPES.CatalogService) private readonly catalogService!: CatalogService

  @httpGet('/', ...CatalogController.validate('getItems'), TYPES.ErrorMiddleware, TYPES.AuthMiddleware)
  public async getItems (req: Request): Promise<results.JsonResult> {
    const queryStart = req.originalUrl.indexOf('?')
    const queryString = queryStart > 0
      ? req.originalUrl.slice(queryStart + 1)
      : ''
    return this.json(await this.catalogService.getItems(queryString))
  }

  private static validate (method: string): ValidationChain[] {
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
