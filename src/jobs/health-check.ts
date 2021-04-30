import axios from 'axios'
import lodash from 'lodash'

export default class HealthCheckJob {
  async run (healthCheck: string): Promise<any> {
    const url = process.env[`${lodash.snakeCase(healthCheck).toUpperCase()}_HEALTH_CHECK_URL`]
    if (typeof url !== 'undefined') {
      return await axios.post(url)
    }
  }
}
