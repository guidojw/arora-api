import BaseManager from './base'
import WebSocket from 'ws'
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
          return connection.terminate()
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
    for (const connection of this.connections) {
      connection.send(JSON.stringify({ event, data }))
    }
  }

  private removeConnection (connection: AroraWebSocket): void {
    this.connections.splice(this.connections.indexOf(connection), 1)
  }
}
