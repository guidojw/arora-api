const TYPES = {
  AnnounceTrainingsJob: Symbol.for('AnnounceTrainingsJob'),
  DiscordMessageJob: Symbol.for('DiscordMessageJob'),
  HealthCheckJob: Symbol.for('HealthCheckJob'),

  RobloxManager: Symbol.for('RobloxManager'),
  WebSocketManager: Symbol.for('WebSocketManager'),

  AuthMiddleware: Symbol.for('AuthMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),

  AuthService: Symbol.for('AuthService'),
  BanService: Symbol.for('BanService'),
  CatalogService: Symbol.for('CatalogService'),
  ExileService: Symbol.for('ExileService'),
  GroupService: Symbol.for('GroupService'),
  StatusService: Symbol.for('StatusService'),
  TrainingService: Symbol.for('TrainingService'),
  UserService: Symbol.for('UserService')
}

export default TYPES
