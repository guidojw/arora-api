import 'dotenv/config'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import path from 'node:path'
import pg from 'pg'

pg.defaults.parseInt8 = true // By default PG returns bigint columns as strings.

const isDevelopment = (process.env.NODE_ENV ?? 'development') === 'development'

export const dataSource = new DataSource({
  type: 'postgres',
  host: isDevelopment ? '127.0.0.1' : process.env.POSTGRES_HOST,
  port: 5432,
  database: isDevelopment ? 'arora_api_development' : 'arora_api',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logging: isDevelopment,
  entities: [path.join(__dirname, 'entities/**/*.js')],
  migrations: [path.join(__dirname, 'migrations/**/*.js')],
  subscribers: [path.join(__dirname, 'subscribers/**/*.js')]
})
