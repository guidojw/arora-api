'use strict'
const createError = require('http-errors')
const pluralize = require('pluralize')
const trelloService = require('./trello')
const timeHelper = require('../helpers/time')
const discordMessageJob = require('../jobs/discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const axios = require('axios')

exports.defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

exports.suspend = async (groupId, userId, options) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank === 2) throw createError(409, 'User is already suspended')
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unsuspendable')
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) throw createError(409, 'User is already suspended')
    }
    if (rank > 0 && rank !== 2) {
        const roles = await exports.getRoles(groupId)
        const roleId = roles.roles.find(role => role.rank === 2).id
        const client = robloxManager.getClient(groupId)
        await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId })
    }
    await trelloService.postCard({
        idList: listId,
        name: userId.toString(),
        desc: JSON.stringify({
            rank: rank,
            rankback: options.rankback,
            duration: options.duration,
            by: options.by,
            reason: options.reason,
            at: Math.round(Date.now() / 1000)
        })
    })
    const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService
        .getUsername(options.by)])
    const days = options.duration / 86400
    await discordMessageJob('log', `**${byUsername}** suspended **${username}** for **${days} ${
        pluralize('day', days)}** with reason "*${options.reason}*"`)
}

exports.promote = async (groupId, userId, by) => {
    const rank = await userService.getRank(userId, groupId)
    if (rank === 0) throw createError(403, 'Can only promote group members')
    if (rank >= 100) throw createError(403, 'Can\'t promote MRs or higher')
    const username = await userService.getUsername(userId)
    const roles = await exports.getRoles(groupId)
    const newRank = rank === 1 ? 3 : rank + 1
    const oldRole = roles.roles.find(role => role.rank === rank)
    const newRole = roles.roles.find(role => role.rank === newRank)
    const client = robloxManager.getClient(groupId)
    await client.apis.updateMemberInGroup({ groupId, userId, roleId: newRole.id })
    if (by) {
        const byUsername = await userService.getUsername(by)
        await discordMessageJob('log', `**${byUsername}** promoted **${username}** from **${oldRole.name
        }** to **${newRole.name}**`)
    } else {
        await discordMessageJob('log', `Promoted **${username}** from **${oldRole.name}** to **${newRole
            .name}**`)
    }
    return roles
}

exports.getShout = async groupId => {
    const client = await robloxManager.getClient(groupId)
    const info = await client.apis.groups.getGroupInfo(groupId)
    return info.shout
}

exports.getSuspensions = async () => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    let suspensions = []
    for (const card of cards) {
        const suspension = JSON.parse(card.desc)
        suspension.userId = parseInt(card.name)
        await suspensions.push(suspension)
    }
    return suspensions
}

exports.getTrainings = async () => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    let trainings = []
    for (const card of cards) {
        const training = JSON.parse(card.desc)
        training.id = parseInt(card.name)
        await trainings.push(training)
    }
    return trainings
}

exports.hostTraining = async options => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const trainingId = await trelloService.getCardsNumOnBoard(boardId) + 1
    await trelloService.postCard({
        idList: listId,
        name: trainingId.toString(),
        desc: JSON.stringify({
            by: options.by,
            type: options.type,
            date: options.date,
            specialnotes: options.specialnotes,
            at: Math.round(Date.now() / 1000)
        })
    })
    return trainingId
}

exports.getExiles = async () => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Exiled')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    let exiles = []
    for (const card of cards) {
        await exiles.push({ userId: parseInt(card.name) })
    }
    return exiles
}

exports.getSuspension = async userId => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        const suspension = JSON.parse(card.desc)
        suspension.userId = parseInt(card.name)
        if (suspension.userId === userId) {
            return suspension
        }
    }
}

exports.getTraining = async trainingId => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        const training = JSON.parse(card.desc)
        training.id = parseInt(card.name)
        if (training.id === trainingId) {
            return training
        }
    }
}

exports.shout = async (groupId, by, message) => {
    const client = robloxManager.getClient(groupId)
    const shout = await client.apis.groups.updateGroupShout({ groupId, message })
    const byUsername = await userService.getUsername(by)
    if (shout.body === '') {
        await discordMessageJob('log', `**${byUsername}** cleared the shout`)
    } else {
        await discordMessageJob('log', `**${byUsername}** shouted *"${shout.body}"*`)
    }
    return shout
}

exports.putTraining = async (trainingId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        if (parseInt(card.name) === trainingId) {
            const cardOptions = {}
            const trainingData = JSON.parse(card.desc)
            if (options.by && options.cancelled === undefined && options.finished === undefined) trainingData.by =
                options.by
            if (options.type) trainingData.type = options.type
            if (options.date) trainingData.date = options.date
            if (options.specialnotes) trainingData.specialnotes = options.specialnotes
            if (options.cancelled) {
                trainingData.cancelled = {
                    by: options.by,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                }
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Cancelled')
            }
            if (options.finished) {
                trainingData.finished = {
                    by: options.by,
                    at: Math.round(Date.now() / 1000)
                }
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Finished')
            }
            cardOptions.desc = JSON.stringify(trainingData)
            return trelloService.putCard(card.id, cardOptions)
        }
    }
}

exports.putSuspension = async (userId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) {
            const cardOptions = {}
            const suspensionData = JSON.parse(card.desc)
            if (options.by && options.cancelled === undefined && options.extended === undefined) suspensionData.by =
                options.by
            if (options.reason) suspensionData.reason = options.reason
            if (options.rankback) suspensionData.rankback = options.rankback
            if (options.cancelled) {
                suspensionData.cancelled = {
                    by: options.by,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                }
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Done')
            }
            if (options.extended) {
                let days = suspensionData.duration / 86400
                if (!suspensionData.extended) suspensionData.extended = []
                for (const extension of suspensionData.extended) {
                    days += extension.duration / 86400
                }
                days += options.duration
                if (days < 1) throw createError(403, 'Insufficient amount of days')
                if (days > 7) throw createError(403, 'Too many days')
                suspensionData.extended.push({
                    by: options.by,
                    duration: options.duration * 86400,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                })
            }
            cardOptions.desc = JSON.stringify(suspensionData)
            return trelloService.putCard(card.id, cardOptions)
        }
    }
}

exports.getGroup = groupId => {
    const client = robloxManager.getClient(groupId)
    return client.apis.groups.getGroupInfo(groupId)
}

exports.getFinishedSuspensions = async () => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Done')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    let suspensions = []
    for (const card of cards) {
        const suspension = JSON.parse(card.desc)
        suspension.userId = parseInt(card.name)
        await suspensions.push(suspension)
    }
    return suspensions
}

exports.announceTraining = async (groupId, trainingId, medium) => {
    if (medium !== undefined && medium !== 'both' && medium !== 'roblox' && medium !== 'discord') throw createError(403,
        'Invalid medium')
    const training = await exports.getTraining(trainingId)
    if (!training) throw createError(404, 'Training not found')
    if (medium === 'roblox') {
        return exports.announceRoblox(groupId)
    } else if (medium === 'discord') {
        return exports.announceDiscord(groupId, training)
    } else if (medium === 'both') {
        return {
            shout: await exports.announceRoblox(groupId),
            announcement: await exports.announceDiscord(groupId, training)
        }
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
    const role = exports.getRoleByAbbreviation(training.type)
    const dateString = timeHelper.getDate(training.date * 1000)
    const timeString = timeHelper.getTime(training.date * 1000)
    const by = training.by
    const specialNotes = training.specialnotes
    return `<:ns:248922413599817728> **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date * 1000) ? 'CEST' : 'CET'}**.` +
        `\n${specialNotes ? specialNotes + '\n' : ''}Hosted by **${by}**.\n@everyone`
}

exports.getRoleByAbbreviation = str => {
    if (str) {
        str = str.toUpperCase()
        /* eslint-disable indent */
        return str === 'G' ? 'Guest' : str === 'C' ? 'Customer' : str === 'S' ? 'Suspended' : str === 'TD' ?
            'Train Driver' : str === 'CD' ? 'Conductor' : str === 'CSR' ? 'Customer Service Representative' : str
            === 'CS' ? 'Customer Service' : str === 'J' ? 'Janitor' : str === 'Se' ? 'Security' : str === 'LC' ?
            'Line Controller' : str === 'PR' ? 'Partner Representative' : str === 'R' ? 'Representative' : str ===
            'MC' ? 'Management Coordinator' : str === 'OC' ? 'Operations Coordinator' : str === 'GA' ?
            'Group Admin' : str === 'BoM' ? 'Board of Managers' : str === 'BoD' ? 'Board of Directors' : str ===
            'CF' ? 'Co-Founder' : str === 'AA' ? 'Alt. Accounts' : str === 'PD' ? 'President-Director' : str ===
            'UT' ? 'Update Tester' : str === 'P' ? 'Pending' : str === 'PH' ? 'Pending HR' : str === 'MoCR' ?
            'Manager of Customer Relations' : str === 'MoSe' ? 'Manager of Security' : str === 'MoRS' ?
            'Manager of Rolling Stock' : str === 'MoSt' ? 'Manager of Stations' : str === 'MoE' ?
            'Manager of Events' : str === 'MoC' ? 'Manager of Conductors' : str === 'MoRM' ?
            'Manager of Rail Management' : str === 'DoNSR' ? 'Director of NS Reizgers' : str === 'DoO' ?
            'Director of Operations' : null
        /* eslint-enable indent */
    }
}

exports.getRoles = async groupId => {
    return (await axios({
        method: 'get',
        url: `https://groups.roblox.com/v1/groups/${groupId}/roles`
    })).data
}
