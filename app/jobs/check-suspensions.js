'use strict'
const finishSuspensionJob = require('../jobs/finish-suspension')
const groupService = require('../services/group')
const cron = require('node-schedule')

async function run() {
    const suspensions = await groupService.getSuspensions()
    for (const suspension of suspensions) {
        const endDate = await suspension.endDate

        if (endDate <= Date.now()) {
            finishSuspensionJob.run(suspension)

        } else {
            const job = cron.scheduledJobs[`suspension_${suspension.id}`]
            if (!job) {
                cron.scheduleJob(`suspension_${suspension.id}`, endDate, finishSuspensionJob.run.bind(null, suspension))
            }
        }
    }
}

module.exports = {
    run
}
