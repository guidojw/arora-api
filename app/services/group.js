'use strict'
const createError = require('http-errors')
const axios = require('axios')
const cron = require('node-schedule')
const { NotFoundError, ConflictError, ForbiddenError } = require('../errors')
const { timeHelper, stringHelper } = require('../helpers')
const { discordMessageJob, finishSuspensionJob } = require('../jobs')
const { robloxManager, webSocketManager } = require('../managers')
const { userService } = require('../services')
const { Suspension, SuspensionExtension, SuspensionCancellation, Training, TrainingCancellation } = require('../models')

const defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

async function suspend (groupId, userId, options) {
    if (await Suspension.findOne({ where: { userId }})) throw createError(409, 'User is already suspended.')
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw createError(409, 'User is already suspended.')
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unsuspendable.')
    if (rank > 0 && rank !== 2) await setRank(groupId, userId, 2)
    const suspension = await Suspension.create({
        rankBack: options.rankBack,
        duration: options.duration,
        authorId: options.authorId,
        reason: options.reason,
        userId,
        rank
    }, { individualHooks: true })
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.run.bind(null,
        suspension))
    return suspension
}

async function getShout (groupId) {
    const client = robloxManager.getClient(groupId)
    const info = await client.apis.groups.getGroupInfo(groupId)
    return info.shout
}

function getSuspensions (scope) {
    return Suspension.scope(scope || 'defaultScope').findAll()
}

function getTrainings (scope) {
    return Training.scope(scope || 'defaultScope').findAll()
}

function postTraining (options) {
    return Training.create({
        type: options.type.toLowerCase(),
        authorId: options.authorId,
        date: options.date,
        notes: options.notes
    }, { individualHooks: true })
}

function getSuspension (userId, scope) {
    return Suspension.scope(scope || 'defaultScope').findOne({ where: { userId }})
}

function getTraining (trainingId, scope) {
    return Training.scope(scope || 'defaultScope').findByPk(trainingId)
}

async function shout (groupId, authorId, message) {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message })
    const authorName = await userService.getUsername(authorId)
    if (shout.body === '') {
        await discordMessageJob.run('log', `**${authorName}** cleared the shout`)
    } else {
        await discordMessageJob.run('log', `**${authorName}** shouted "*${shout.body}*"`)
    }
    return shout
}

async function putTraining (groupId, trainingId, options) {
    const training = await getTraining(trainingId)
    return training.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

async function putSuspension (groupId, userId, options) {
    const suspension = await getSuspension(userId)
    return suspension.update(options.changes, { editorId: options.editorId, individualHooks: true })
}

function getGroup (groupId) {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

async function announceTraining (groupId, trainingId, options) {
    const medium = options.medium.toLowerCase()
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') throw createError(403,
        'Invalid medium')
    const training = await getTraining(trainingId)
    const authorName = await userService.getUsername(options.authorId)
    await discordMessageJob.run('log', `**${authorName}** announced training **${trainingId}**${
        medium !== 'both' ? ' on ' + stringHelper.toPascalCase(medium) : ''}`)
    return {
        shout: medium === 'both' || medium === 'roblox' ? await announceRoblox(groupId) : undefined,
        announcement: medium === 'both' || medium === 'discord' ? await announceDiscord(groupId, training) : undefined
    }
}

async function announceRoblox (groupId) {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message: defaultTrainingShout })
    return shout.body
}

async function announceDiscord (groupId, training) {
    const announcement = await getTrainingAnnouncement(training)
    await discordMessageJob.run('training', announcement)
    return announcement
}

async function getTrainingAnnouncement (training) {
    const role = getRoleByAbbreviation(training.type.toUpperCase())
    const dateString = timeHelper.getDate(training.date)
    const timeString = timeHelper.getTime(training.date)
    const authorName = await userService.getUsername(training.authorId)
    const notes = training.notes
    return `<:ns:248922413599817728> **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date) ? 'CEST' : 'CET'}**.\n${notes ? notes 
            + '\n' : ''}Hosted by **${authorName}**.\n<@&${training.type === 'cd' ? '673950073716998177' : 
            '673950095250554920'}>`
}

function getRoleByAbbreviation (str) {
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

async function getRoles (groupId) {
    return (await axios({
        method: 'get',
        url: `https://groups.roblox.com/v1/groups/${groupId}/roles`
    })).data
}

async function setRank (groupId, userId, rank) {
    const roles = await getRoles(groupId)
    const role = roles.roles.find(role => role.rank === rank)
    const client = robloxManager.getClient(groupId)
    await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId: role.id })
    webSocketManager.broadcast('rankChanged', { groupId, userId, rank })
    return role
}

async function cancelSuspension (groupId, userId, options) {
    const suspension = await Suspension.findOne({ where: { userId }})
    if (!suspension) throw createError(404, 'Suspension not found.')
    await setRank(groupId, userId, suspension.rank > 0 ? suspension.rank : 1)
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    return SuspensionCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        suspensionId: suspension.id
    }, { individualHooks: true })
}

async function cancelTraining (groupId, trainingId, options) {
    const training = await Training.findByPk(trainingId)
    if (!training) throw createError(404, 'Training not found.')
    return TrainingCancellation.create({
        authorId: options.authorId,
        reason: options.reason,
        trainingId: training.id
    }, { individualHooks: true })
}

async function extendSuspension (groupId, userId, options) {
    const suspension = await Suspension.findOne({ where: { userId }})
    if (!suspension) throw createError(404, 'Suspension not found.')
    let duration = suspension.duration + options.duration
    if (!suspension.extensions) suspension.extensions = []
    for (const extension of suspension.extensions) {
        duration += extension.duration
    }
    const days = duration / 86400000
    if (days < 1) throw createError(403, 'Insufficient amount of days.')
    if (days > 7) throw createError(403, 'Too many days.')
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.run.bind(null,
        suspension))
    return SuspensionExtension.create({
        authorId: options.authorId,
        duration: options.duration,
        reason: options.reason,
        suspensionId: suspension.id
    }, { individualHooks: true })
}

async function changeRank (groupId, userId, options) {
    const rank = await userService.getRank(userId, groupId)
    if (rank === 0) throw createError(403, 'Can\'t change rank of non members.')
    if (rank === 1 && options.authorId) throw createError(403, 'Can\'t change rank of customers.')
    if (rank === 2) throw createError(403, 'Can\'t change rank of suspended members.')
    if (rank === 99) throw createError(403, 'Can\'t change rank of partners.')
    if (rank >= 200) throw createError(403, 'Can\'t change rank of HRs.')
    if (!(options.rank === 1 || options.rank >= 3 && options.rank <= 5 || options.rank >= 100 && options.rank <= 102)) {
        throw createError(400, 'Invalid rank.')
    }
    const newRole = await setRank(groupId, userId, options.rank)
    const roles = await getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === rank)
    const username = await userService.getUsername(userId)
    if (options.authorId) {
        const authorName = await userService.getUsername(options.authorId)
        await discordMessageJob.run('log', `**${authorName}** ${options.rank > rank ? 'promoted' : 
            'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        await discordMessageJob.run('log', `${options.rank > rank ? 'Promoted' : 'demoted'} **${
            username}** from **${oldRole.name}** to **${newRole.name}**`)
    }
    return { oldRole, newRole }
}

module.exports = {
    defaultTrainingShout,
    suspend,
    getShout,
    getSuspensions,
    getTrainings,
    postTraining,
    getSuspension,
    getTraining,
    shout,
    putTraining,
    putSuspension,
    getGroup,
    announceTraining,
    setRank,
    cancelSuspension,
    cancelTraining,
    extendSuspension,
    changeRank
}
