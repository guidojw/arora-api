'use strict'
const discordMessageJob = require('../jobs/discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const webSocketManager = require('../managers/web-socket')
const { Suspension, SuspensionExtension, SuspensionCancellation, Training, TrainingCancellation } = require('../models')
const NotFoundError = require('../errors/not-found')
const ConflictError = require('../errors/conflict')
const ForbiddenError = require('../errors/forbidden')
const BadRequestError = require('../errors/bad-request')

const robloxConfig = require('../../config/roblox')

async function suspend(groupId, userId, { rankBack, duration, authorId, reason }) {
    if (await Suspension.findOne({ where: { userId }})) {
        throw new ConflictError('User is already suspended.')
    }

    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) {
        throw new ConflictError('User is already suspended.')
    }
    if (rank >= 200 || rank === 99 || rank === 103) {
        throw new ForbiddenError('User is unsuspendable.')
    }
    if (rank > 0 && rank !== 2) {
        await setRank(groupId, userId, 2)
    }

    const mtRank = await userService.getRank(userId, robloxConfig.mtGroup)
    if (mtRank > 0) {
        const client = robloxManager.getClient(robloxConfig.mtGroup)
        const group = await client.getGroup(robloxConfig.mtGroup)
        await group.kickMember(userId)
    }

    return Suspension.create({
        rankBack,
        duration,
        authorId,
        reason,
        userId,
        rank
    }, { individualHooks: true })
}

async function getShout(groupId) {
    const group = await getGroup(groupId)
    return group.shout
}

function getSuspensions(scope, sort) {
    return Suspension.scope(scope || 'defaultScope').findAll({ order: sort })
}

function getTrainings(scope, sort) {
    return Training.scope(scope || 'defaultScope').findAll({ order: sort })
}

function postTraining({ type, authorId, date, notes }) {
    return Training.create({
        type: type.toLowerCase(),
        authorId,
        date,
        notes
    })
}

async function getSuspension(userId, scope) {
    const suspension = await Suspension.scope(scope || 'defaultScope').findOne({ where: { userId }})
    if (!suspension) {
        throw new NotFoundError('Suspension not found.')
    }
    return suspension
}

async function getTraining(trainingId, scope) {
    const training = await Training.scope(scope || 'defaultScope').findByPk(trainingId)
    if (!training) {
        throw new NotFoundError('Training not found.')
    }
    return training
}

async function shout(groupId, message, authorId) {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groupsAPI.updateGroupStatus({ groupId, message })

    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        if (shout.body === '') {
            discordMessageJob.run('log', `**${authorName}** cleared the shout`)
        } else {
            discordMessageJob.run('log', `**${authorName}** shouted "*${shout.body}*"`)
        }
    }

    return shout
}

async function putTraining(groupId, trainingId, changes) {
    const training = await getTraining(trainingId)
    return training.update(changes)
}

async function putSuspension(groupId, userId, { changes, editorId }) {
    const suspension = await getSuspension(userId)
    return suspension.update(changes, { editorId, individualHooks: true })
}

function getGroup(groupId) {
    const client = robloxManager.getClient(groupId)
    return client.apis.groupsAPI.getGroup({ groupId })
}

function getRoles(groupId) {
    const client = robloxManager.getClient(groupId)
    return client.apis.groupsAPI.getGroupRoles({ groupId })
}

async function setRank(groupId, userId, rank) {
    const roles = await getRoles(groupId)
    const role = roles.roles.find(role => role.rank === rank)
    const client = robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.updateMember(userId, role.id)

    webSocketManager.broadcast('rankChanged', { groupId, userId, rank })

    return role
}

async function cancelSuspension(groupId, userId, { authorId, reason }) {
    const suspension = await getSuspension(userId)
    const rank = await userService.getRank(suspension.userId, groupId)

    if (rank !== 0) {
        await setRank(groupId, suspension.userId, suspension.rank)
    }

    return SuspensionCancellation.create({ suspensionId: suspension.id, authorId, reason }, { individualHooks: true })
}

async function cancelTraining(groupId, trainingId, { authorId, reason }) {
    const training = await getTraining(trainingId)
    return TrainingCancellation.create({ trainingId: training.id, authorId, reason })
}

async function extendSuspension(groupId, userId, { authorId, duration, reason }) {
    const suspension = await getSuspension(userId)
    let newDuration = suspension.duration + duration
    if (suspension.extensions) {
        for (const extension of suspension.extensions) {
            newDuration += extension.duration
        }
    }
    const days = newDuration / 86400000

    if (days < 1) {
        throw new ForbiddenError('Insufficient amount of days.')
    }
    if (days > 7) {
        throw new ForbiddenError('Too many days.')
    }

    return SuspensionExtension.create({
        suspensionId: suspension.id,
        authorId,
        duration,
        reason
    }, { individualHooks: true })
}

async function changeRank(groupId, userId, { rank, authorId }) {
    const oldRank = await userService.getRank(userId, groupId)
    if (oldRank === 0) {
        throw new ForbiddenError('Can\'t change rank of non members.')
    }
    if (oldRank === 1 && authorId) {
        throw new ForbiddenError('Can\'t change rank of customers.')
    }
    if (oldRank === 2) {
        throw new ForbiddenError('Can\'t change rank of suspended members.')
    }
    if (oldRank === 99) {
        throw new ForbiddenError('Can\'t change rank of partners.')
    }
    if (oldRank >= 200) {
        throw new ForbiddenError('Can\'t change rank of HRs.')
    }
    if (!(rank === 1 || rank >= 3 && rank <= 5 || rank >= 100 && rank <= 102)) {
        throw new BadRequestError('Invalid rank.')
    }

    const newRole = await setRank(groupId, userId, rank)

    const mtRank = await userService.getRank(userId, robloxConfig.mtGroup)
    if (mtRank > 0) {
        if (rank < 100) {
            const client = robloxManager.getClient(robloxConfig.mtGroup)
            const group = await client.getGroup(robloxConfig.mtGroup)
            await group.kickMember(userId)
        } else {
            await setRank(robloxConfig.mtGroup, userId, { rank })
        }
    }

    const roles = await getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === oldRank)
    const username = await userService.getUsername(userId)
    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        discordMessageJob.run('log', `**${authorName}** ${rank > oldRank ? 'promoted' : 'demoted'} **` +
            `${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        discordMessageJob.run('log', `${rank > oldRank ? 'Promoted' : 'demoted'} **${username}** from ` +
            `**${oldRole.name}** to **${newRole.name}**`)
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
    getRoles,
    setRank,
    cancelSuspension,
    cancelTraining,
    extendSuspension,
    changeRank
}
