import { AcceptJoinRequestsJob, DiscordMessageJob, HealthCheckJob } from '../jobs'
import {
  AccessToken,
  type Ban,
  BanCancellation,
  BanExtension,
  Exile,
  type Training,
  TrainingCancellation,
  TrainingType
} from '../entities'
import { AsyncContainerModule, Container } from 'inversify'
import { AuthMiddleware, ErrorMiddleware } from '../middlewares'
import {
  AuthService,
  BanService,
  ExileService,
  GroupService,
  OAuthService,
  StatusService,
  TrainingService,
  UserService
} from '../services'
import { BanRepository, TrainingRepository } from '../repositories'
import { type RedisClientType, createClient } from 'redis'
import { type Repository } from 'typeorm'
import { WebSocketManager } from '../managers'
import { constants } from '../util'
import { dataSource } from '../data-source'

const { TYPES } = constants

export default async function init (): Promise<Container> {
  const container = new Container()

  const bindings = new AsyncContainerModule(async bind => {
    await dataSource.initialize()

    const client: RedisClientType = createClient({
      url: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD
    })

    await client.connect()

    bind<RedisClientType>(TYPES.RedisClient).toConstantValue(client)

    bind<AcceptJoinRequestsJob>(TYPES.AcceptJoinRequestsJob).to(AcceptJoinRequestsJob)
    bind<DiscordMessageJob>(TYPES.DiscordMessageJob).to(DiscordMessageJob)
    bind<HealthCheckJob>(TYPES.HealthCheckJob).to(HealthCheckJob)

    bind<WebSocketManager>(TYPES.WebSocketManager).to(WebSocketManager).inSingletonScope()

    bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
    bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware)

    bind<Repository<AccessToken>>(TYPES.AccessTokenRepository).toDynamicValue(() => {
      return dataSource.getRepository(AccessToken)
    }).inRequestScope()
    bind<Repository<Ban>>(TYPES.BanRepository).toDynamicValue(() => {
      return new BanRepository(dataSource)
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
      return new TrainingRepository(dataSource)
    }).inRequestScope()
    bind<Repository<TrainingCancellation>>(TYPES.TrainingCancellationRepository).toDynamicValue(() => {
      return dataSource.getRepository(TrainingCancellation)
    }).inRequestScope()
    bind<Repository<TrainingType>>(TYPES.TrainingTypeRepository).toDynamicValue(() => {
      return dataSource.getRepository(TrainingType)
    }).inRequestScope()

    bind<AuthService>(TYPES.AuthService).to(AuthService)
    bind<BanService>(TYPES.BanService).to(BanService)
    bind<ExileService>(TYPES.ExileService).to(ExileService)
    bind<GroupService>(TYPES.GroupService).to(GroupService)
    bind<OAuthService>(TYPES.OAuthService).to(OAuthService)
    bind<StatusService>(TYPES.StatusService).to(StatusService)
    bind<TrainingService>(TYPES.TrainingService).to(TrainingService)
    bind<UserService>(TYPES.UserService).to(UserService)
  })
  await container.loadAsync(bindings)

  return container
}
