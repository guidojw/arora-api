'use strict'
require('dotenv').config()

const axios = require('axios')

class DiscordMessageJob {
    perform = async (type, message) => {
        if (type === 'log') {
            await this.sendLog(message)
        } else if (type === 'training') {
            await this.sendTraining(message)
        }
    }

    sendLog = async message => {
        await axios({
            method: 'post',
            url: process.env.DISCORD_LOGS_WEBHOOK_URL,
            data: { content: message }
        })
    }

    sendTraining = async message => {
        await axios({
            method: 'post',
            url: process.env.DISCORD_TRAININGS_WEBHOOK_URL,
            data: { content: message }
        })
    }
}

module.exports = DiscordMessageJob
