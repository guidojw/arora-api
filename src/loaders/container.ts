import { AnnounceTrainingsJob, DiscordMessageJob, HealthCheckJob } from '../jobs'
import { AuthMiddleware, ErrorMiddleware } from '../middlewares'
import { AuthService, CatalogService } from '../services'
import { RobloxManager, WebSocketManager } from '../managers'
import { Container } from 'inversify'
import TYPES from '../util/types'

export default function init (): Container {
  const container = new Container()

  container.bind<AnnounceTrainingsJob>(TYPES.AnnounceTrainingsJob).to(AnnounceTrainingsJob)
  container.bind<DiscordMessageJob>(TYPES.DiscordMessageJob).to(DiscordMessageJob)
  container.bind<HealthCheckJob>(TYPES.AnnounceTrainingsJob).to(HealthCheckJob)

  container.bind<RobloxManager>(TYPES.RobloxManager).to(RobloxManager)
  container.bind<WebSocketManager>(TYPES.WebSocketManager).to(WebSocketManager)

  container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
  container.bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware)

  container.bind<AuthService>(TYPES.AuthService).to(AuthService)
  container.bind<CatalogService>(TYPES.CatalogService).to(CatalogService)

  return container
}
