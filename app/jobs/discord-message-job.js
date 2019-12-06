require('dotenv').config()

const Discord = require('discord.js')

const logsWebhook = new Discord.WebhookClient(process.env.DISCORD_LOGS_WEBHOOK_ID, process.env
    .DISCORD_LOGS_WEBHOOK_TOKEN)
const trainingsWebhook = new Discord.WebhookClient(process.env.DISCORD_TRAININGS_WEBHOOK_ID, process.env
    .DISCORD_TRAININGS_WEBHOOK_TOKEN)

class DiscordMessageJob {
    perform = (type, message) => {
        if (type === 'log') {
            this.sendLog(message)
        } else if (type === 'training') {
            this.sendTraining(message)
        }
    }

    sendLog = message => {
        logsWebhook.send(message)
    }

    sendTraining = message => {
        trainingsWebhook.send(message)
    }
}

module.exports = DiscordMessageJob
