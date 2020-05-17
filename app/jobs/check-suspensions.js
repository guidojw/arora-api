'use strict'
const { finishSuspensionJob } = require('./')
const { Suspension } = require('../models')
const cron = require('node-schedule')

module.exports = async () => {
    const suspensions = await Suspension.findAll()
    for (const suspension of suspensions) {
        const endDate = await suspension.endDate
        if (endDate <= Date.now()) {
            finishSuspensionJob(suspension)
        } else {
            const job = cron.scheduledJobs[`suspension_${suspension.id}`]
            if (!job) cron.scheduleJob(`suspension_${suspension.id}`, endDate, finishSuspensionJob.bind(null, suspension))
        }
    }
}
