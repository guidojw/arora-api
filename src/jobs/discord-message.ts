import BaseJob from './base'
import axios from 'axios'
import { injectable } from 'inversify'

@injectable()
export default class DiscordMessageJob implements BaseJob {
  async run (content: string): Promise<any> {
    if (typeof process.env.DISCORD_WEBHOOK_URL !== 'undefined') {
      return await axios.post(process.env.DISCORD_WEBHOOK_URL, { content })
    }
  }
}
