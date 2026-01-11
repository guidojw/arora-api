import { DataSource, type DataSourceOptions } from 'typeorm'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()
pg.defaults.parseInt8 = true // By default PG returns bigint columns as strings.

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js']
}

const dataSource = new DataSource({
  development: {
    ...baseConfig,
    host: '127.0.0.1',
    database: 'arora_api_development',
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
}[process.env.NODE_ENV ?? 'development'] as DataSourceOptions)

export default dataSource
