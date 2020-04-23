'use strict'
const createError = require('http-errors')
const axios = require('axios')
const timeHelper = require('../helpers/time')
const discordMessageJob = require('../jobs/discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const stringHelper = require('../helpers/string')
const webSocketManager = require('../managers/web-socket')
const models = require('../models')
const finishSuspensionJob = require('../jobs/finish-suspension')
const cron = require('node-schedule')

exports.defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

exports.suspend = async (groupId, userId, options) => {
    if (await models.Suspension.findOne({ where: { userId }})) throw createError(409, 'User is already suspended')
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw createError(409, 'User is already suspended')
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unsuspendable')
    if (rank > 0 && rank !== 2) await exports.setRank(groupId, userId, 2)
    const suspension = await models.Suspension.create({
        rankBack: options.rankBack,
        duration: options.duration,
        authorId: options.authorId,
        reason: options.reason,
        userId,
        rank
    })
    cron.scheduleJob(suspension.endDate, finishSuspensionJob.bind(null, suspension))
    return suspension
}

exports.promote = async (groupId, userId, authorId) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank === 0) throw createError(403, 'Can only promote group members')
    if (rank >= 100) throw createError(403, 'Can\'t promote MRs or higher')
    const username = await userService.getUsername(userId)
    const newRank = rank === 1 ? 3 : rank + 1
    const newRole = await exports.setRank(groupId, userId, newRank)
    const roles = await exports.getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === rank)
    if (authorId) {
        const authorUsername = await userService.getUsername(authorId)
        await discordMessageJob('log', `**${authorUsername}** promoted **${username}** from **${oldRole
            .name}** to **${newRole.name}**`)
    } else {
        await discordMessageJob('log', `Promoted **${username}** from **${oldRole.name}** to **${newRole
            .name}**`)
    }
    return { oldRole, newRole }
}

exports.getShout = async groupId => {
    const client = robloxManager.getClient(groupId)
    const info = await client.apis.groups.getGroupInfo(groupId)
    return info.shout
}

exports.getSuspensions = () => {
    return models.Suspension.findAll()
}

exports.getTrainings = () => {
    return models.Training.findAll()
}

exports.scheduleTraining = options => {
    return models.Training.create({
        type: options.type.toLowerCase(),
        authorId: options.authorId,
        date: options.date,
        notes: options.notes
    })
}

exports.getExiles = () => {
    return models.Exile.findAll()
}

exports.getSuspension = async userId => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    if (suspension) return suspension
    throw createError(404, 'Suspension not found')
}

exports.getTraining = async trainingId => {
    const training = await models.Training.findByPk(trainingId)
    if (training) return training
    throw createError(404, 'Training not found')
}

exports.shout = async (groupId, authorId, message) => {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message })
    const authorUsername = await userService.getUsername(authorId)
    if (shout.body === '') {
        await discordMessageJob('log', `**${authorUsername}** cleared the shout`)
    } else {
        await discordMessageJob('log', `**${authorUsername}** shouted "*${shout.body}*"`)
    }
    return shout
}

exports.putTraining = async (groupId, trainingId, options) => {
    const training = await models.Training.findByPk(trainingId)
    if (training) return training.update(options)
    throw createError(404, 'Training not found')
}

exports.putSuspension = async (groupId, userId, options) => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    if (suspension) return suspension.update(options)
    throw createError(404, 'Suspension not found')
}

exports.getGroup = groupId => {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

exports.getFinishedSuspensions = () => {
    return models.Suspension.scope('defaultScope', 'finished').findAll()
}

exports.announceTraining = async (groupId, trainingId, options) => {
    const medium = options.medium.toLowerCase()
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') throw createError(403,
        'Invalid medium')
    const training = await exports.getTraining(trainingId)
    const username = await userService.getUsername(options.userId)
    await discordMessageJob('log', `**${username}** announced training **${trainingId}**${medium !== 
    'both' ? ' on ' + stringHelper.toPascalCase(medium) : ''}`)
    return {
        shout: medium === 'both' || medium === 'roblox' ? await exports.announceRoblox(groupId) : undefined,
        announcement: medium === 'both' || medium === 'discord' ? await exports.announceDiscord(groupId, training) :
            undefined
    }
}

exports.announceRoblox = async groupId => {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message: exports.defaultTrainingShout })
    return shout.body
}

exports.announceDiscord = async (groupId, training) => {
    const announcement = exports.getTrainingAnnouncement(training)
    await discordMessageJob('training', announcement)
    return announcement
}

exports.getTrainingAnnouncement = training => {
    const role = exports.getRoleByAbbreviation(training.type.toUpperCase())
    const dateString = timeHelper.getDate(training.date)
    const timeString = timeHelper.getTime(training.date)
    const specialNotes = training.specialnotes
    return `<:ns:248922413599817728> **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**.` +
        `\n${specialNotes ? specialNotes + '\n' : ''}Hosted by **${training.by}**.\n<@&${training.type === 'cd' ? 
            '673950073716998177' : '673950095250554920'}>`
}

exports.getRoleByAbbreviation = str => {
    /* eslint-disable indent */
    return str === 'G' ? 'Guest' : str === 'C' ? 'Customer' : str === 'S' ? 'Suspended' : str === 'TD' ? 'Train Driver'
        : str === 'CD' ? 'Conductor' : str === 'CSR' ? 'Customer Service Representative' : str === 'CS' ?
        'Customer Service' : str === 'J' ? 'Janitor' : str === 'Se' ? 'Security' : str === 'LC' ? 'Line Controller' :
        str === 'PR' ? 'Partner Representative' : str === 'R' ? 'Representative' : str === 'MC' ?
        'Management Coordinator' : str === 'OC' ? 'Operations Coordinator' : str === 'GA' ? 'Group Admin' : str ===
        'BoM' ? 'Board of Managers' : str === 'BoD' ? 'Board of Directors' : str === 'CF' ? 'Co-Founder' : str === 'AA'
        ? 'Alt. Accounts' : str === 'PD' ? 'President-Director' : str === 'UT' ? 'Update Tester' : str === 'P' ?
        'Pending' : str === 'PH' ? 'Pending HR' : str === 'HoCR' ? 'Head of Customer Relations' : str === 'HoSe' ?
        'Head of Security' : str === 'HoSt' ? 'Manager of Stations' : str === 'HoE' ? 'Head of Events' : str === 'HoC' ?
        'Head of Conductors' : str === 'HoRM' ? 'Head of Rail Management' : str === 'SD' ? 'Staff Director' : str ===
        'OD' ? 'Operations Director' : null
    /* eslint-enable indent */
}

exports.getRoles = async groupId => {
    return (await axios({
        method: 'get',
        url: `https://groups.roblox.com/v1/groups/${groupId}/roles`
    })).data
}

exports.setRank = async (groupId, userId, rank) => {
    const roles = await exports.getRoles(groupId)
    const role = roles.roles.find(role => role.rank === rank)
    const client = robloxManager.getClient(groupId)
    await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId: role.id })
    webSocketManager.broadcast('rankChanged', { groupId, userId, rank })
    return role
}

exports.cancelSuspension = async (groupId, userId, options) => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    await exports.setRank(groupId, userId, suspension.rank)
    return models.SuspensionCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        suspensionId: suspension.id
    })
}

exports.cancelTraining = (groupId, trainingId, options) => {
    return models.TrainingCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        trainingId
    })

}

exports.extendSuspension = async (groupId, userId, options) => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    let days = suspension.duration / 86400000
    if (!suspension.extensions) suspension.extensions = []
    for (const extension of suspension.extensions) {
        days += extension.duration / 86400000
    }
    days += options.duration
    if (days < 1) throw createError(403, 'Insufficient amount of days')
    if (days > 7) throw createError(403, 'Too many days')
    return models.SuspensionExtension.create({
        authorId: options.authorId,
        duration: options.duration,
        reason: options.reason,
        suspensionId: suspension.id
    })
}
