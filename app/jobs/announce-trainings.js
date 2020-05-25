'use strict'
const groupService = require('../services/group')
const userService = require('../services/user')
const timeHelper = require('../helpers/time')

module.exports = async groupId => {
    const trainings = await groupService.getTrainings()
    const today = new Date().getDate()
    const trainingsToday = trainings.filter(training => training.date.getDate() === today)
    const trainingsTomorrow = trainings.filter(training => training.date.getDate() === today + 1)
    const authorIds = [...new Set([...trainingsToday.map(training => training.authorId), ...trainingsTomorrow
        .map(training => training.authorId)])]
    const authors = await userService.getUsers(authorIds)

    let shout = 'Trainings today - '
    shout += getTrainingsInfo(trainingsToday, authors)
    shout += '. Trainings tomorrow - '
    shout += getTrainingsInfo(trainingsTomorrow, authors)
    shout += '.'
    if (shout.length > 255) shout = `${shout.substring(0, 255 - 3)}...`

    await groupService.shout(groupId, shout)
}

function getTrainingsInfo (trainings, authors) {
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
                if (j < typeTrainings.length - 2) result += ','
                if (j === typeTrainings.length - 2) result += ' and'
            }
            if (i <= types.length - 2) result += ' | '
        }
    } else {
        result += 'none'
    }
    return result
}

function groupTrainingsByType (trainings) {
    const result = {}
    for (const training of trainings) {
        if (!result.hasOwnProperty(training.type)) result[training.type] = []
        result[training.type].push(training)
    }
    return result
}
