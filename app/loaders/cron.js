'use strict'
const cron = require('node-schedule')

const cronConfig = require('../../config/cron')

function init(container) {
    for (const jobConfig of Object.values(cronConfig)) {
        const job = container.get(jobConfig.job)

        if (jobConfig.hasOwnProperty('args')) {
            const [...args] = jobConfig.args
            cron.scheduleJob(job.expression, job.run.bind(null, ...args))

        } else {
            cron.scheduleJob(job.expression, job.run)
        }
    }
}

module.exports = init
