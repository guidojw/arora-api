const TYPES = {
  AnnounceTrainingsJob: Symbol.for('AnnounceTrainingsJob'),
  DiscordMessageJob: Symbol.for('DiscordMessageJob'),
  HealthCheckJob: Symbol.for('HealthCheckJob'),

  RobloxManager: Symbol.for('RobloxManager'),
  WebSocketManager: Symbol.for('WebSocketManager'),

  AuthMiddleware: Symbol.for('AuthMiddleware'),
  ErrorMiddleware: Symbol.for('ErrorMiddleware'),

  AuthService: Symbol.for('AuthService'),
  CatalogService: Symbol.for('CatalogService')
}

export default TYPES
