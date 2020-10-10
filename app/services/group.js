'use strict'
const axios = require('axios')
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

exports.suspend = async (groupId, userId, { rankBack, duration, authorId, reason }) => {
    if (await Suspension.findOne({ where: { userId }})) throw new ConflictError('User is already suspended.')
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw new ConflictError('User is already suspended.')
    if (rank >= 200 || rank === 99 || rank === 103) throw new ForbiddenError('User is unsuspendable.')
    if (rank > 0 && rank !== 2) await exports.setRank(groupId, userId, 2)
    const mtRank = await userService.getRank(userId, robloxConfig.mtGroup)
    if (mtRank > 0) {
        const client = robloxManager.getClient(robloxConfig.mtGroup)
        const group = await client.getGroup(robloxConfig.mtGroup)
        await group.removeMemberFromGroup(userId)
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

exports.getShout = async groupId => {
    const client = robloxManager.getClient(groupId)
    const info = await client.apis.groups.getGroupInfo(groupId)
    return info.shout
}

exports.getSuspensions = (scope, sort) => Suspension.scope(scope || 'defaultScope').findAll({ order: sort })

exports.getTrainings = (scope, sort) => Training.scope(scope || 'defaultScope').findAll({ order: sort })

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

exports.shout = async (groupId, message, authorId) => {
    const client = robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    const shout = await group.updateShout(message)
    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        if (shout.body === '') {
            discordMessageJob('log', `**${authorName}** cleared the shout`)
        } else {
            discordMessageJob('log', `**${authorName}** shouted "*${shout.body}*"`)
        }
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

exports.getRoles = async groupId => {
    const client = robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    return group.getRoles()
}

exports.setRank = async (groupId, userId, rank) => {
    const roles = await exports.getRoles(groupId)
    const role = roles.roles.find(role => role.rank === rank)
    const client = robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    await group.updateMember(userId, role.id)
    webSocketManager.broadcast('rankChanged', { groupId, userId, rank })
    return role
}

exports.cancelSuspension = async (groupId, userId, { authorId, reason }) => {
    const suspension = await exports.getSuspension(userId)
    const rank = await userService.getRank(suspension.userId, groupId)
    if (rank !== 0) await exports.setRank(groupId, suspension.userId, suspension.rank)
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

    const mtRank = await userService.getRank(userId, robloxConfig.mtGroup)
    if (mtRank > 0) {
        if (rank < 100) {
            const client = robloxManager.getClient(robloxConfig.mtGroup)
            const group = await client.getGroup(robloxConfig.mtGroup)
            await group.removeMemberFromGroup(userId)
        } else {
            await exports.changeRank(robloxConfig.mtGroup, userId, { rank })
        }
    }

    const roles = await exports.getRoles(groupId)
    const oldRole = roles.roles.find(role => role.rank === oldRank)
    const username = await userService.getUsername(userId)
    if (authorId) {
        const authorName = await userService.getUsername(authorId)
        discordMessageJob('log', `**${authorName}** ${rank > oldRank ? 'promoted' : 
            'demoted'} **${username}** from **${oldRole.name}** to **${newRole.name}**`)
    } else {
        discordMessageJob('log', `${rank > oldRank ? 'Promoted' : 'demoted'} **${username}** ` +
            `from **${oldRole.name}** to **${newRole.name}**`)
    }
    return { oldRole, newRole }
}
