'use strict'
const axios = require('axios')
const timeHelper = require('../helpers/time')
const discordMessageJob = require('../jobs/discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const stringHelper = require('../helpers/string')
const webSocketManager = require('../managers/web-socket')
const { Suspension, SuspensionExtension, SuspensionCancellation, Training, TrainingCancellation } = require('../models')
const finishSuspensionJob = require('../jobs/finish-suspension')
const cron = require('node-schedule')
const NotFoundError = require('../errors/not-found')
const ConflictError = require('../errors/conflict')
const ForbiddenError = require('../errors/forbidden')
const BadRequestError = require('../errors/bad-request')

const defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

exports.suspend = async (groupId, userId, { rankBack, duration, authorId, reason }) => {
    if (await Suspension.findOne({ where: { userId }})) throw new ConflictError('User is already suspended.')
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw new ConflictError('User is already suspended.')
    if (rank >= 200 || rank === 99 || rank === 103) throw new ForbiddenError('User is unsuspendable.')
    if (rank > 0 && rank !== 2) await exports.setRank(groupId, userId, 2)
    const suspension = await Suspension.create({
        rankBack,
        duration,
        authorId,
        reason,
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

exports.getSuspensions = scope => Suspension.scope(scope || 'defaultScope').findAll()

exports.getTrainings = scope => Training.scope(scope || 'defaultScope').findAll()

exports.postTraining = ({ type, authorId, date, notes }) => {
    return Training.create({
        type: type.toLowerCase(),
        authorId,
        date,
        notes
    }, { individualHooks: true })
}

exports.getSuspension = async (userId, scope) => {
    const suspension = await Suspension.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!suspension) throw new NotFoundError('Suspension not found.')
    return suspension
}

exports.getTraining = async (trainingId, scope) => {
    const training = await Training.scope(scope || 'defaultScope').findByPk(trainingId)
    if (!training) throw new NotFoundError('Training not found.')
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

exports.putTraining = async (groupId, trainingId, { changes, editorId }) => {
    const training = await exports.getTraining(trainingId)
    return training.update(changes, { editorId, individualHooks: true })
}

exports.putSuspension = async (groupId, userId, { changes, editorId }) => {
    const suspension = await exports.getSuspension(userId)
    return suspension.update(changes, { editorId, individualHooks: true })
}

exports.getGroup = groupId => {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

exports.announceTraining = async (groupId, trainingId, { medium, authorId }) => {
    medium = medium.toLowerCase()
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') {
        throw new ForbiddenError('Invalid medium')
    }
    const training = await exports.getTraining(trainingId)
    const authorName = await userService.getUsername(authorId)
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
    const shout = await client.apis.groups.updateGroupShout({ groupId, message: defaultTrainingShout })
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

exports.cancelSuspension = async (groupId, userId, { authorId, reason }) => {
    const suspension = await exports.getSuspension(userId)
    const rank = await userService.getRank(suspension.userId, groupId)
    if (rank !== 0) await exports.setRank(groupId, suspension.userId, suspension.rank)
    const job = cron.scheduledJobs[`suspension_${suspension.id}`]
    if (job) job.cancel()
    return SuspensionCancellation.create({ suspensionId: suspension.id, authorId, reason }, { individualHooks: true })
}

exports.cancelTraining = async (groupId, trainingId, { authorId, reason }) => {
    const training = await exports.getTraining(trainingId)
    return TrainingCancellation.create({ trainingId: training.id, authorId, reason }, { individualHooks: true })
}

exports.extendSuspension = async (groupId, userId, { authorId, duration, reason }) => {
    const suspension = await exports.getSuspension(userId)
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
    cron.scheduleJob(`suspension_${suspension.id}`, await suspension.endDate, finishSuspensionJob.bind(null,
        suspension))
    return SuspensionExtension.create({
        suspensionId: suspension.id,
        authorId,
        duration,
        reason
    }, { individualHooks: true })
}

exports.changeRank = async (groupId, userId, { rank, authorId }) => {
    const oldRank = await userService.getRank(userId, groupId)
    if (oldRank === 0) throw new ForbiddenError('Can\'t change rank of non members.')
    if (oldRank === 1 && authorId) throw new ForbiddenError('Can\'t change rank of customers.')
    if (oldRank === 2) throw new ForbiddenError('Can\'t change rank of suspended members.')
    if (oldRank === 99) throw new ForbiddenError('Can\'t change rank of partners.')
    if (oldRank >= 200) throw new ForbiddenError('Can\'t change rank of HRs.')
    if (!(rank === 1 || rank >= 3 && rank <= 5 || rank >= 100 && rank <= 102)) {
        throw new BadRequestError('Invalid rank.')
    }
    const newRole = await exports.setRank(groupId, userId, rank)
    const roles = await exports.getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === oldRank)
    const username = await userService.getUsername(userId)
    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        await discordMessageJob('log', `**${authorName}** ${rank > oldRank ? 'promoted' : 
            'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        await discordMessageJob('log', `${rank > oldRank ? 'Promoted' : 'demoted'} **${username}** ` +
            `from **${oldRole.name}** to **${newRole.name}**`)
    }
    return { oldRole, newRole }
}
