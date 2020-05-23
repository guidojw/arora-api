'use strict'
const axios = require('axios')
const cron = require('node-schedule')
const timeHelper = require('../helpers/time')
const stringHelper = require('../helpers/string')
const discordMessageJob = require('../jobs/discord-message')
const finishSuspensionJob = require('../jobs/finish-suspension')
const robloxManager = require('../managers/roblox')
const webSocketManager = require('../managers/web-socket')
const userService = require('../services/user')
const { Suspension, SuspensionExtension, SuspensionCancellation, Training, TrainingCancellation } = require('../models')
const NotFoundError = require('../errors/not-found')
const ConflictError = require('../errors/conflict')
const ForbiddenError = require('../errors/forbidden')
const BadRequestError = require('../errors/bad-request')

const defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

async function suspend (groupId, userId, { rankBack, duration, authorId, reason }) {
    let suspended = true
    try {
        await getSuspension(userId)
    } catch {
        suspended = false
    }
    if (suspended) throw new ConflictError('User is already suspended.')
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw new ConflictError('User is already suspended.')
    if (rank >= 200 || rank === 99 || rank === 103) throw new ForbiddenError('User is unsuspendable.')
    if (rank > 0 && rank !== 2) await setRank(groupId, userId, 2)
    const suspension = await Suspension.create({
        rankBack,
        duration,
        authorId,
        reason,
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

function postTraining ({ type, authorId, date, notes }) {
    return Training.create({
        type: type.toLowerCase(),
        authorId,
        date,
        notes
    }, { individualHooks: true })
}

async function getSuspension (userId, scope) {
    const suspension = await Suspension.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!suspension) throw new NotFoundError('Suspension not found.')
    return Suspension.scope(scope || 'defaultScope').findOne({ where: { userId }})
}

async function getTraining (trainingId, scope) {
    const training = await Training.scope(scope || 'defaultScope').findByPk(trainingId)
    if (!training) throw new NotFoundError('Training not found.')
    return training
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

async function putTraining (groupId, trainingId, { changes, editorId }) {
    const training = await getTraining(trainingId)
    return training.update(changes, { editorId, individualHooks: true })
}

async function putSuspension (groupId, userId, { changes, editorId }) {
    const suspension = await getSuspension(userId)
    return suspension.update(changes, { editorId, individualHooks: true })
}

function getGroup (groupId) {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

async function announceTraining (groupId, trainingId, { medium }) {
    medium = medium.toLowerCase()
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') {
        throw new ForbiddenError('Invalid medium')
    }
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

async function cancelSuspension (groupId, userId, { authorId, reason }) {
    const suspension = await getSuspension(userId)
    const rank = await userService.getRank(suspension.userId, groupId)
    if (rank !== 0) await setRank(groupId, suspension.userId, suspension.rank)
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    return SuspensionCancellation.create({ authorId, reason, suspensionId: suspension.id }, { individualHooks: true })
}

async function cancelTraining (groupId, trainingId, { authorId, reason }) {
    const training = await getTraining(trainingId)
    return TrainingCancellation.create({ authorId, reason, trainingId: training.id }, { individualHooks: true })
}

async function extendSuspension (groupId, userId, { authorId, duration, reason }) {
    const suspension = await getSuspension(userId)
    let newDuration = suspension.duration + duration
    if (suspension.extensions) {
        for (const extension of suspension.extensions) {
            newDuration += extension.duration
        }
    }
    const days = newDuration / 86400000
    if (days < 1) throw new ForbiddenError('Insufficient amount of days.')
    if (days > 7) throw new ForbiddenError('Too many days.')
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.run.bind(null,
        suspension))
    return SuspensionExtension.create({
        suspensionId: suspension.id,
        authorId,
        duration,
        reason
    }, { individualHooks: true })
}

async function changeRank (groupId, userId, { rank, authorId }) {
    const oldRank = await userService.getRank(userId, groupId)
    if (oldRank === 0) throw new ForbiddenError('Can\'t change rank of non members.')
    if (oldRank === 1 && authorId) throw new ForbiddenError('Can\'t change rank of customers.')
    if (oldRank === 2) throw new ForbiddenError('Can\'t change rank of suspended members.')
    if (oldRank === 99) throw new ForbiddenError('Can\'t change rank of partners.')
    if (oldRank >= 200) throw new ForbiddenError('Can\'t change rank of HRs.')
    if (!(rank === 1 || rank >= 3 && rank <= 5 || rank >= 100 && rank <= 102)) {
        throw new BadRequestError('Invalid rank.')
    }
    const newRole = await setRank(groupId, userId, rank)
    const roles = await getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === oldRank)
    const username = await userService.getUsername(userId)
    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        await discordMessageJob.run('log', `**${authorName}** ${rank > oldRank ? 'promoted' : 
            'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        await discordMessageJob.run('log', `${rank > oldRank ? 'Promoted' : 'demoted'} **${
            username}** from **${oldRole.name}** to **${newRole.name}**`)
    }
    return { oldRole, newRole }
}

module.exports = {
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
