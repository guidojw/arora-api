export const TYPES = {
  AcceptJoinRequestsJob: Symbol.for('AcceptJoinRequestsJob'),
  AnnounceTrainingsJob: Symbol.for('AnnounceTrainingsJob'),
  DiscordMessageJob: Symbol.for('DiscordMessageJob'),
  HealthCheckJob: Symbol.for('HealthCheckJob'),

  RobloxManager: Symbol.for('RobloxManager'),
  WebSocketManager: Symbol.for('WebSocketManager'),

  AuthMiddleware: Symbol.for('AuthMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),

  BanRepository: Symbol.for('BanRepository'),
  BanCancellationRepository: Symbol.for('BanCancellationRepository'),
  BanExtensionRepository: Symbol.for('BanExtensionRepository'),
  ExileRepository: Symbol.for('ExileRepository'),
  TrainingRepository: Symbol.for('TrainingRepository'),
  TrainingCancellationRepository: Symbol.for('TrainingCancellationRepository'),
  TrainingTypeRepository: Symbol.for('TrainingTypeRepository'),

  AuthService: Symbol.for('AuthService'),
  BanService: Symbol.for('BanService'),
  CatalogService: Symbol.for('CatalogService'),
  ExileService: Symbol.for('ExileService'),
  GroupService: Symbol.for('GroupService'),
  StatusService: Symbol.for('StatusService'),
  TrainingService: Symbol.for('TrainingService'),
  UserService: Symbol.for('UserService')
}
