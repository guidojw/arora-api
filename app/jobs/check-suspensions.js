'use strict'
const cron = require('node-schedule')

class CheckSuspensionsJob {
    constructor(suspensionService, finishSuspensionJob) {
        this._suspensionService = suspensionService
        this._finishSuspensionJob = finishSuspensionJob
    }

    async run() {
        const suspensions = await this._suspensionService.getSuspensions()
        for (const suspension of suspensions) {
            const endDate = await suspension.endDate

            if (endDate <= Date.now()) {
                this._finishSuspensionJob.run(suspension)

            } else {
                const jobName = `suspension_${suspension.id}`
                const job = cron.scheduledJobs[jobName]

                if (!job) {
                    cron.scheduleJob(jobName, endDate, this._finishSuspensionJob.run.bind(null, suspension))
                }
            }
        }
    }
}

module.exports = CheckSuspensionsJob
