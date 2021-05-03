import { AnnounceTrainingsJob, DiscordMessageJob, HealthCheckJob } from '../jobs'
import { AuthMiddleware, ErrorMiddleware } from '../middlewares'
import {
  AuthService,
  BanService,
  CatalogService,
  ExileService,
  GroupService,
  StatusService,
  TrainingService,
  UserService
} from '../services'
import { RobloxManager, WebSocketManager } from '../managers'
import { Container } from 'inversify'
import { constants } from '../util'

const { TYPES } = constants

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
  container.bind<BanService>(TYPES.BanService).to(BanService)
  container.bind<CatalogService>(TYPES.CatalogService).to(CatalogService)
  container.bind<ExileService>(TYPES.ExileService).to(ExileService)
  container.bind<GroupService>(TYPES.GroupService).to(GroupService)
  container.bind<StatusService>(TYPES.StatusService).to(StatusService)
  container.bind<TrainingService>(TYPES.TrainingService).to(TrainingService)
  container.bind<UserService>(TYPES.UserService).to(UserService)

  return container
}
