'use strict'
const finishSuspensionJob = require('../jobs/finish-suspension')
const models = require('../models')
const cron = require('node-schedule')

module.exports = async () => {
    const suspensions = await models.Suspension.findAll()
    for (const suspension of suspensions) {
        if (await suspension.endDate <= Date.now()) {
            finishSuspensionJob(suspension)
        } else {
            const job = cron.scheduledJobs[`suspension_${suspension.id}`]
            if (job) job.cancel()
            cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.bind(null,
                suspension))
        }
    }
}
