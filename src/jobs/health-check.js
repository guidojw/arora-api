'use strict'

const axios = require('axios')
const lodash = require('lodash')

class HealthCheckJob {
  async run (healthCheck) {
    const url = process.env[`${lodash.snakeCase(healthCheck).toUpperCase()}_HEALTH_CHECK_URL`]
    if (url) {
      return axios.get(url)
    }
  }
}

module.exports = HealthCheckJob
