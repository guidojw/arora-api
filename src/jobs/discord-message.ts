import axios from 'axios'

export default class DiscordMessageJob {
  async run (content: string): Promise<any> {
    if (typeof process.env.DISCORD_WEBHOOK_URL !== 'undefined') {
      return await axios.post(process.env.DISCORD_WEBHOOK_URL, { content })
    }
  }
}
