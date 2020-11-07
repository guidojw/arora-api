'use strict'
const axios = require('axios')

class DiscordMessageJob {
  async run (type, message) {
    if (type === 'log') {
      await this.sendLog(message)
    } else if (type === 'trello') {
      await this.sendTrello(message)
    }
  }

  async sendLog (message) {
    await axios({
      method: 'post',
      url: process.env.DISCORD_LOGS_WEBHOOK_URL,
      data: { content: message }
    })
  }

  async sendTrello (body) {
    await axios({
      method: 'post',
      url: process.env.DISCORD_TRELLO_WEBHOOK_URL,
      data: body
    })
  }
}

module.exports = DiscordMessageJob
