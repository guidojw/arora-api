import * as Sentry from '@sentry/node'
import type BaseManager from './base'
import type WebSocket from 'ws'
import { injectable } from 'inversify'

export type AroraWebSocket = WebSocket & { isAlive: boolean }

const PING_INTERVAL = 30 * 1000

@injectable()
export default class WebSocketManager implements BaseManager {
  private readonly connections: AroraWebSocket[] = []

  public init (): void {
    setInterval(() => {
      for (const connection of this.connections) {
        if (!connection.isAlive) {
          connection.terminate()
          return
        }
        connection.isAlive = false

        connection.ping()
      }
    }, PING_INTERVAL)
  }

  public addConnection (conn: WebSocket): void {
    console.log('New connection!')
    const connection = conn as AroraWebSocket
    connection.isAlive = true

    connection.on('error', console.error)
    connection.on('close', () => {
      console.log('Connection closed!')
      this.removeConnection(connection)
    })
    connection.on('pong', () => {
      connection.isAlive = true
    })

    this.connections.push(connection)
  }

  public broadcast (event: string, data?: any): void {
    Sentry.startSpan({ name: `broadcast: ${event}`, op: 'ws.broadcast' }, () => {
      const traceData = Sentry.getTraceData()
      const sentryTraceHeader = traceData['sentry-trace']
      const sentryBaggageHeader = traceData.baggage
      const metadata = {
        sentryTrace: sentryTraceHeader,
        baggage: sentryBaggageHeader
      }
      for (const connection of this.connections) {
        connection.send(JSON.stringify({ event, data, metadata }))
      }
    })
  }

  private removeConnection (connection: AroraWebSocket): void {
    this.connections.splice(this.connections.indexOf(connection), 1)
  }
}
