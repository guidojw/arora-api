import {
  AcceptJoinRequestsJob,
  AnnounceTrainingsJob,
  DiscordMessageJob,
  HealthCheckJob
} from '../jobs'
import { AsyncContainerModule, Container } from 'inversify'
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
import {
  type Ban,
  BanCancellation,
  BanExtension,
  Exile,
  type Training,
  TrainingCancellation,
  TrainingType
} from '../entities'
import { BanRepository, TrainingRepository } from '../repositories'
import { type Repository, createConnection, getCustomRepository, getRepository } from 'typeorm'
import { RobloxManager, WebSocketManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export default async function init (): Promise<Container> {
  const container = new Container()

  const bindings = new AsyncContainerModule(async bind => {
    await createConnection()

    bind<AcceptJoinRequestsJob>(TYPES.AcceptJoinRequestsJob).to(AcceptJoinRequestsJob)
    bind<AnnounceTrainingsJob>(TYPES.AnnounceTrainingsJob).to(AnnounceTrainingsJob)
    bind<DiscordMessageJob>(TYPES.DiscordMessageJob).to(DiscordMessageJob)
    bind<HealthCheckJob>(TYPES.HealthCheckJob).to(HealthCheckJob)

    bind<RobloxManager>(TYPES.RobloxManager).to(RobloxManager).inSingletonScope()
    bind<WebSocketManager>(TYPES.WebSocketManager).to(WebSocketManager).inSingletonScope()

    bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
    bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware)

    bind<Repository<Ban>>(TYPES.BanRepository).toDynamicValue(() => {
      return getCustomRepository(BanRepository)
    }).inRequestScope()
    bind<Repository<BanCancellation>>(TYPES.BanCancellationRepository).toDynamicValue(() => {
      return getRepository(BanCancellation)
    }).inRequestScope()
    bind<Repository<BanExtension>>(TYPES.BanExtensionRepository).toDynamicValue(() => {
      return getRepository(BanExtension)
    }).inRequestScope()
    bind<Repository<Exile>>(TYPES.ExileRepository).toDynamicValue(() => {
      return getRepository(Exile)
    }).inRequestScope()
    bind<Repository<Training>>(TYPES.TrainingRepository).toDynamicValue(() => {
      return getCustomRepository(TrainingRepository)
    }).inRequestScope()
    bind<Repository<TrainingCancellation>>(TYPES.TrainingCancellationRepository).toDynamicValue(() => {
      return getRepository(TrainingCancellation)
    }).inRequestScope()
    bind<Repository<TrainingType>>(TYPES.TrainingTypeRepository).toDynamicValue(() => {
      return getRepository(TrainingType)
    }).inRequestScope()

    bind<AuthService>(TYPES.AuthService).to(AuthService)
    bind<BanService>(TYPES.BanService).to(BanService)
    bind<CatalogService>(TYPES.CatalogService).to(CatalogService)
    bind<ExileService>(TYPES.ExileService).to(ExileService)
    bind<GroupService>(TYPES.GroupService).to(GroupService)
    bind<StatusService>(TYPES.StatusService).to(StatusService)
    bind<TrainingService>(TYPES.TrainingService).to(TrainingService)
    bind<UserService>(TYPES.UserService).to(UserService)
  })
  await container.loadAsync(bindings)

  return container
}
