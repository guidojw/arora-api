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
    }, { individualHooks: true })
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.bind(null,
        suspension))
    return suspension
}

exports.getShout = async groupId => {
    const client = robloxManager.getClient(groupId)
    const info = await client.apis.groups.getGroupInfo(groupId)
    return info.shout
}

exports.getSuspensions = (query) => models.Suspension.scope(query.scope).findAll()

exports.getTrainings = (query) => models.Training.scope(query.scope).findAll()

exports.postTraining = options => {
    return models.Training.create({
        type: options.type.toLowerCase(),
        authorId: options.authorId,
        date: options.date,
        notes: options.notes
    }, { individualHooks: true })
}

exports.getSuspension = async (userId, query) => {
    const suspension = await models.Suspension.scope(query.scope).findOne({ where: { userId }})
    if (!suspension) throw createError(404, 'Suspension not found')
    return suspension
}

exports.getTraining = async (trainingId, query) => {
    const training = await models.Trainin.scope(query.scope).findByPk(trainingId)
    if (!training) throw createError(404, 'Training not found')
    return training
}

exports.shout = async (groupId, authorId, message) => {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message })
    const authorName = await userService.getUsername(authorId)
    if (shout.body === '') {
        await discordMessageJob('log', `**${authorName}** cleared the shout`)
    } else {
        await discordMessageJob('log', `**${authorName}** shouted "*${shout.body}*"`)
    }
    return shout
}

exports.putTraining = async (groupId, trainingId, options) => {
    const training = await models.Training.findByPk(trainingId)
    if (!training) throw createError(404, 'Training not found')
    return training.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

exports.putSuspension = async (groupId, userId, options) => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    if (!suspension) throw createError(404, 'Suspension not found')
    return suspension.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

exports.getGroup = groupId => {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

exports.announceTraining = async (groupId, trainingId, options) => {
    const medium = options.medium.toLowerCase()
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') throw createError(403,
        'Invalid medium')
    const training = await exports.getTraining(trainingId)
    const authorName = await userService.getUsername(options.authorId)
    await discordMessageJob('log', `**${authorName}** announced training **${trainingId}**${medium !== 
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
    const announcement = await exports.getTrainingAnnouncement(training)
    await discordMessageJob('training', announcement)
    return announcement
}

exports.getTrainingAnnouncement = async training => {
    const role = exports.getRoleByAbbreviation(training.type.toUpperCase())
    const dateString = timeHelper.getDate(training.date)
    const timeString = timeHelper.getTime(training.date)
    const authorName = await userService.getUsername(training.authorId)
    const notes = training.notes
    return `<:ns:248922413599817728> **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**.\n${notes ? notes 
            + '\n' : ''}Hosted by **${authorName}**.\n<@&${training.type === 'cd' ? '673950073716998177' : 
            '673950095250554920'}>`
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
    if (!suspension) throw createError(404, 'Suspension not found')
    await exports.setRank(groupId, userId, suspension.rank > 0 ? suspension.rank : 1)
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    return models.SuspensionCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        suspensionId: suspension.id
    }, { individualHooks: true })
}

exports.cancelTraining = async (groupId, trainingId, options) => {
    const training = await models.Training.findByPk(trainingId)
    if (!training) throw createError(404, 'Training not found')
    return models.TrainingCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        trainingId: training.id
    }, { individualHooks: true })
}

exports.extendSuspension = async (groupId, userId, options) => {
    const suspension = await models.Suspension.findOne({ where: { userId }})
    if (!suspension) throw createError(404, 'Suspension not found')
    let duration = suspension.duration + options.duration
    if (!suspension.extensions) suspension.extensions = []
    for (const extension of suspension.extensions) {
        duration += extension.duration
    }
    const days = duration / 86400000
    if (days < 1) throw createError(403, 'Insufficient amount of days')
    if (days > 7) throw createError(403, 'Too many days')
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.bind(null,
        suspension))
    return models.SuspensionExtension.create({
        authorId: options.authorId,
        duration: options.duration,
        reason: options.reason,
        suspensionId: suspension.id
    }, { individualHooks: true })
}

exports.changeRank = async (groupId, userId, options) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank === 0) throw createError(403, 'Can\'t change rank of non members')
    if (rank === 1 && options.authorId) throw createError(403, 'Can\'t change rank of customers.')
    if (rank === 2) throw createError(403, 'Can\'t change rank of suspended members')
    if (rank === 99) throw createError(403, 'Can\'t change rank of partners')
    if (rank >= 200) throw createError(403, 'Can\'t change rank of HRs')
    if (!(options.rank === 1 || options.rank >= 3 && options.rank <= 5 || options.rank >= 100 && options.rank <= 102)) {
        throw createError(400, 'Invalid rank')
    }
    const newRole = await exports.setRank(groupId, userId, options.rank)
    const roles = await exports.getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === rank)
    const username = await userService.getUsername(userId)
    if (options.authorId) {
        const authorName = await userService.getUsername(options.authorId)
        await discordMessageJob('log', `**${authorName}** ${options.rank > rank ? 'promoted' : 
            'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        await discordMessageJob('log', `${options.rank > rank ? 'Promoted' : 'demoted'} **${username}` +
            `** from **${oldRole.name}** to **${newRole.name}**`)
    }
    return { oldRole, newRole }
}
