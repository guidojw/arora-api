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
import { BanRepository, BaseRepository, TrainingRepository } from '../repositories'
import { RobloxManager, WebSocketManager } from '../managers'
import { constants } from '../util'

const { TYPES } = constants

export default async function init (): Promise<Container> {
  const container = new Container()
  const bind = container.bind.bind(container)

  bind<AcceptJoinRequestsJob>(TYPES.AcceptJoinRequestsJob).to(AcceptJoinRequestsJob)
  bind<AnnounceTrainingsJob>(TYPES.AnnounceTrainingsJob).to(AnnounceTrainingsJob)
  bind<DiscordMessageJob>(TYPES.DiscordMessageJob).to(DiscordMessageJob)
  bind<HealthCheckJob>(TYPES.HealthCheckJob).to(HealthCheckJob)

  bind<RobloxManager>(TYPES.RobloxManager).to(RobloxManager).inSingletonScope()
  bind<WebSocketManager>(TYPES.WebSocketManager).to(WebSocketManager).inSingletonScope()

  bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
  bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware)

  bind<Repository<Ban>>(TYPES.BanRepository).toDynamicValue(() => {
    return dataSource.getRepository(Ban).extend(BaseRepository).extend(BanRepository)
  }).inRequestScope()
  bind<Repository<BanCancellation>>(TYPES.BanCancellationRepository).toDynamicValue(() => {
    return dataSource.getRepository(BanCancellation)
  }).inRequestScope()
  bind<Repository<BanExtension>>(TYPES.BanExtensionRepository).toDynamicValue(() => {
    return dataSource.getRepository(BanExtension)
  }).inRequestScope()
  bind<Repository<Exile>>(TYPES.ExileRepository).toDynamicValue(() => {
    return dataSource.getRepository(Exile)
  }).inRequestScope()
  bind<Repository<Training>>(TYPES.TrainingRepository).toDynamicValue(() => {
    return dataSource.getRepository(Training).extend(BaseRepository).extend(TrainingRepository)
  }).inRequestScope()
  bind<Repository<TrainingCancellation>>(TYPES.TrainingCancellationRepository).toDynamicValue(() => {
    return dataSource.getRepository(TrainingCancellation)
  }).inRequestScope()
  bind<Repository<TrainingType>>(TYPES.TrainingTypeRepository).toDynamicValue(() => {
    return dataSource.getRepository(TrainingType)
  }).inRequestScope()

  bind<AuthService>(TYPES.AuthService).to(AuthService)
  bind<BanService>(TYPES.BanService).to(BanService)
  bind<CatalogService>(TYPES.CatalogService).to(CatalogService)
  bind<ExileService>(TYPES.ExileService).to(ExileService)
  bind<GroupService>(TYPES.GroupService).to(GroupService)
  bind<StatusService>(TYPES.StatusService).to(StatusService)
  bind<TrainingService>(TYPES.TrainingService).to(TrainingService)
  bind<UserService>(TYPES.UserService).to(UserService)

  return container
}
