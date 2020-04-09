'use strict'
const connections = []

exports.init = () => {
    setInterval(() => {
        for (const connection of connections) {
            if (!connection.isAlive) return connection.terminate()
            connection.isAlive = false
            connection.ping()
        }
    }, 30000)
}

exports.addConnection = connection => {
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

exports.removeConnection = connection => {
    connections.splice(connections.indexOf(connection), 1)
}

exports.broadcast = (event, data) => {
    for (const connection of connections) {
        connection.send(JSON.stringify({ event, data }))
    }
}
