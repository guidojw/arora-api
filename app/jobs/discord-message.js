'use strict'
const axios = require('axios')

module.exports = async (type, message) => {
    if (type === 'log') {
        await sendLog(message)
    } else if (type === 'trello') {
        await sendTrello(message)
    } else if (type === 'backupNotification') {
        await sendBackupNotification(message)
    }
}

const sendLog = async message => {
    await axios({
        method: 'post',
        url: process.env.DISCORD_LOGS_WEBHOOK_URL,
        data: { content: message }
    })
}

const sendTrello = async body => {
    await axios({
        method: 'post',
        url: process.env.DISCORD_TRELLO_WEBHOOK_URL,
        data: body
    })
}

const sendBackupNotification = async body => {
    await axios({
        method: 'post',
        url: process.env.DISCORD_BACKUP_NOTIFICATION_WEBHOOK_URL,
        data: body
    })
}
