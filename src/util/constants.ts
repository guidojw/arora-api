export const TYPES = {
  AnnounceTrainingsJob: Symbol.for('AnnounceTrainingsJob'),
  DiscordMessageJob: Symbol.for('DiscordMessageJob'),
  HealthCheckJob: Symbol.for('HealthCheckJob'),

  RobloxManager: Symbol.for('RobloxManager'),
  WebSocketManager: Symbol.for('WebSocketManager'),

  AuthMiddleware: Symbol.for('AuthMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),

  BanRepository: Symbol.for('BanRepository'),
  BanCancellationRepository: Symbol.for('BanRepository'),
  BanExtensionRepository: Symbol.for('BanExtensionRepository'),
  ExileRepository: Symbol.for('ExileRepository'),
  PayoutRepository: Symbol.for('PayoutRepository'),
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
