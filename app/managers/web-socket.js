'use strict'
class WebSocketManager {
    constructor() {
        this.connections = []
    }

    init() {
        setInterval(() => {
            for (const connection of this.connections) {
                if (!connection.isAlive) {
                    return connection.terminate()
                }
                connection.isAlive = false

                connection.ping()
            }
        }, 30000)
    }

    addConnection(connection) {
        console.log('New connection!')
        connection.isAlive = true

        connection.on('error', console.error)
        connection.on('close', () => {
            console.log('Connection closed!')
            this.removeConnection(connection)
        })
        connection.on('pong', () => connection.isAlive = true)

        this.connections.push(connection)
    }

    removeConnection(connection) {
        this.connections.splice(this.connections.indexOf(connection), 1)
    }

    broadcast(event, data) {
        for (const connection of this.connections) {
            connection.send(JSON.stringify({ event, data }))
        }
    }
}

module.exports = WebSocketManager
