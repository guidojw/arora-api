'use strict'
const finishSuspensionJob = require('./finish-suspension')
const { Suspension } = require('../models')
const cron = require('node-schedule')

async function run () {
    const suspensions = await Suspension.findAll()
    for (const suspension of suspensions) {
        const endDate = await suspension.endDate
        if (endDate <= Date.now()) {
            finishSuspensionJob.run(suspension)
        } else {
            const job = cron.scheduledJobs[`suspension_${suspension.id}`]
            if (!job) cron.scheduleJob(`suspension_${suspension.id}`, endDate, finishSuspensionJob.run.bind(null,
                suspension))
        }
    }
}

module.exports = {
    run
}
