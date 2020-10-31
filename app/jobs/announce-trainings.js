'use strict'
const cron = require('node-schedule')

const { Training } = require('../models')
const { timeHelper } = require('../helpers')

class AnnounceTrainingsJob {
    constructor(groupService, userService) {
        this._groupService = groupService
        this._userService = userService
    }

    async run(groupId) {
        const trainings = await Training.findAll()
        for (const training of trainings) {
            const jobName = `training_${training.id}`
            const job = cron.scheduledJobs[jobName]

            if (!job) {
                cron.scheduleJob(
                    jobName,
                    new Date(training.date.getTime() + 30 * 60 * 1000),
                    this.run.bind(null, groupId)
                )
            }
        }

        const now = new Date()
        const today = now.getDate()
        const trainingsToday = trainings.filter(training => training.date.getDate() === today)
        const trainingsTomorrow = trainings.filter(training => training.date.getDate() === today + 1)
        const authorIds = [...new Set([
            ...trainingsToday.map(training => training.authorId),
            ...trainingsTomorrow.map(training => training.authorId)
        ])]
        const authors = authorIds.length > 0 ? await this._userService.getUsers(authorIds) : undefined

        let shout = 'Trainings today - '
        shout += getTrainingsInfo(trainingsToday, authors)
        shout += '. Trainings tomorrow - '
        shout += getTrainingsInfo(trainingsTomorrow, authors)
        shout += '.'

        const addition = ` (Timezone: ${timeHelper.isDst(now) ? 'CEST' : 'CET'})`

        // Cut excessive characters of shout
        if (shout.length > 255 - addition.length) {
            shout = `${shout.substring(0, 255 - addition.length - 3)}...`
        }

        shout += addition

        // Compare current shout with new shout and update if they differ
        const oldShout = await this._groupService.getShout(groupId)
        if (shout !== oldShout.body) {
            await this._groupService.shout(groupId, shout)
        }
    }
}

function getTrainingsInfo(trainings, authors) {
    const groupedTrainings = groupTrainingsByType(trainings)
    const types = Object.keys(groupedTrainings)
    let result = ''

    if (types.length > 0) {

        for (let i = 0; i < types.length; i++) {
            const type = types[i]
            const typeTrainings = groupedTrainings[type]

            result += `${type.toUpperCase()}:`

            for (let j = 0; j < typeTrainings.length; j++) {
                const training = typeTrainings[j]
                const timeString = timeHelper.getTime(training.date)
                const author = authors.find(author => author.id === training.authorId)

                result += ` ${timeString} (host: ${author.name})`
                if (j < typeTrainings.length - 2) {
                    result += ','
                }
                if (j === typeTrainings.length - 2) {
                    result += ' and'
                }
            }

            if (i <= types.length - 2) {
                result += ' | '
            }
        }

    } else {
        result += 'none'
    }
    return result
}

function groupTrainingsByType(trainings) {
    const result = {}

    for (const training of trainings) {
        if (!result[training.type]) {
            result[training.type] = []
        }

        result[training.type].push(training)
    }
    return result
}

module.exports = AnnounceTrainingsJob
