export const TYPES = {
  RedisClient: Symbol.for('RedisClient'),

  AcceptJoinRequestsJob: Symbol.for('AcceptJoinRequestsJob'),
  DiscordMessageJob: Symbol.for('DiscordMessageJob'),
  HealthCheckJob: Symbol.for('HealthCheckJob'),

  WebSocketManager: Symbol.for('WebSocketManager'),

  AuthMiddleware: Symbol.for('AuthMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),

  AccessTokenRepository: Symbol.for('AccessTokenRepository'),
  BanRepository: Symbol.for('BanRepository'),
  BanCancellationRepository: Symbol.for('BanCancellationRepository'),
  BanExtensionRepository: Symbol.for('BanExtensionRepository'),
  ExileRepository: Symbol.for('ExileRepository'),
  TrainingRepository: Symbol.for('TrainingRepository'),
  TrainingCancellationRepository: Symbol.for('TrainingCancellationRepository'),
  TrainingTypeRepository: Symbol.for('TrainingTypeRepository'),

  AuthService: Symbol.for('AuthService'),
  BanService: Symbol.for('BanService'),
  ExileService: Symbol.for('ExileService'),
  GroupService: Symbol.for('GroupService'),
  OAuthService: Symbol.for('OAuthService'),
  StatusService: Symbol.for('StatusService'),
  TrainingService: Symbol.for('TrainingService'),
  UserService: Symbol.for('UserService')
}
