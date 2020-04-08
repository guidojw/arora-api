'use strict'
const connections = []

exports.init = () => {
    setInterval(() => {
        for (const connection of connections) {
            if (!connection.isAlive) connection.terminate()
            connection.isAlive = false
            connection.ping()
        }
    }, 60000)
}

exports.addConnection = connection => {
    console.log('New connection!')
    connection.isAlive = true
    connection.on('error', err => {
        console.log('Connection closed by error!')
        console.error(err)
    })
    connection.on('close', () => {
        console.log('Connection closed!')
        exports.removeConnection(connection)
    })
    connection.on('pong', () => {
        console.log('Pong!')
        connection.isAlive = true
    })
    connections.push(connection)
    exports.broadcast('rankChanged', { groupId: 1018818, username: 'Happywalker', rank: 255 })
}

exports.removeConnection = connection => {
    connections.splice(connections.indexOf(connection, 1))
}

exports.broadcast = (event, data) => {
    for (const connection of connections) {
        connection.send(JSON.stringify({ event, data }))
    }
}
