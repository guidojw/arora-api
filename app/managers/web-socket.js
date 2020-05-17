'use strict'
const connections = []

function init () {
    setInterval(() => {
        for (const connection of connections) {
            if (!connection.isAlive) return connection.terminate()
            connection.isAlive = false
            connection.ping()
        }
    }, 30000)
}

function addConnection (connection) {
    console.log('New connection!')
    connection.isAlive = true
    connection.on('error', console.error)
    connection.on('close', () => {
        console.log('Connection closed!')
        exports.removeConnection(connection)
    })
    connection.on('pong', () => connection.isAlive = true)
    connections.push(connection)
}

function removeConnection (connection) {
    connections.splice(connections.indexOf(connection), 1)
}

function broadcast (event, data) {
    for (const connection of connections) {
        connection.send(JSON.stringify({ event, data }))
    }
}

module.exports = {
    init,
    addConnection,
    removeConnection,
    broadcast
}
