'use strict'

require('dotenv').config()
require('pg').types.setTypeParser(20, BigInt)

const baseConfig = {
  type: 'postgres',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: [
    'src/entities/**/*.ts'
  ],
  migrations: [
    'src/migrations/**/*.ts'
  ],
  subscribers: [
    'src/subscribers/**/*.ts'
  ],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers'
  }
}

module.exports = {
  development: {
    ...baseConfig,
    host: '127.0.0.1',
    database: 'arora_api_development2',
    logging: true
  },
  production: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_api_production'
  },
  staging: {
    ...baseConfig,
    host: process.env.POSTGRES_HOST,
    database: 'arora_api_staging'
  }
}[process.env.NODE_ENV ?? 'development']
