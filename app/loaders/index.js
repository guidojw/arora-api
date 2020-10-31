'use strict'
const expressLoader = require('./express')
const containerLoader = require('./container')
const cronLoader = require('./cron')

const robloxConfig = require('../../config/roblox')

async function init(app) {
    const container = containerLoader()
    app.set('container', container)

    expressLoader(app, container)

    await container.get('RobloxManager').init()
    container.get('WebSocketManager').init()

    cronLoader(container)

    container.get('CheckSuspensionsJob').run()
    container.get('AnnounceTrainingsJob').run(robloxConfig.defaultGroup)
}

module.exports = {
    init
}
