import 'express-async-errors'
import 'reflect-metadata'
import * as loaders from './loaders'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
loaders.init(app) // eslint-disable-line @typescript-eslint/no-floating-promises

export default app

process.on('uncaughtException', console.error)
