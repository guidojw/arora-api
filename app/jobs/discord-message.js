'use strict'
require('dotenv').config()

const axios = require('axios')

module.exports = async (type, message) => {
    if (type === 'log') {
        await sendLog(message)
    } else if (type === 'training') {
        await sendTraining(message)
    } else if (type === 'trello') {
        await sendTrello(message)
    }
}

const sendLog = async message => {
    await axios({
        method: 'post',
        url: process.env.DISCORD_LOGS_WEBHOOK_URL,
        data: { content: message }
    })
}

const sendTraining = async message => {
    await axios({
        method: 'post',
        url: process.env.DISCORD_TRAININGS_WEBHOOK_URL,
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
