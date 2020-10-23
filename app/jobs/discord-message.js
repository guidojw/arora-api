'use strict'
const axios = require('axios')

async function run(type, message) {
    if (type === 'log') {
        await sendLog(message)
    } else if (type === 'trello') {
        await sendTrello(message)
    } else if (type === 'backupNotification') {
        await sendBackupNotification(message)
    }
}

async function sendLog(message) {
    await axios({
        method: 'post',
        url: process.env.DISCORD_LOGS_WEBHOOK_URL,
        data: { content: message }
    })
}

async function sendTrello(body) {
    await axios({
        method: 'post',
        url: process.env.DISCORD_TRELLO_WEBHOOK_URL,
        data: body
    })
}

async function sendBackupNotification(body) {
    await axios({
        method: 'post',
        url: process.env.DISCORD_BACKUP_NOTIFICATION_WEBHOOK_URL,
        data: body
    })
}

module.exports = {
    run
}
