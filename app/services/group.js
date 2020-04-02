'use strict'
const createError = require('http-errors')
const pluralize = require('pluralize')
const axios = require('axios')
const trelloService = require('./trello')
const timeHelper = require('../helpers/time')
const discordMessageJob = require('../jobs/discord-message')
const robloxManager = require('../managers/roblox')
const userService = require('../services/user')
const stringHelper = require('../helpers/string')

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
    const [username, byUsername] = await Promise.all([userService.getUsername(userId), userService.getUsername(
        options.by)])
    const days = options.duration / 86400
    await discordMessageJob('log', `**${byUsername}** suspended **${username}** for **${days}** ${
        pluralize('day', days)} with reason "*${options.reason}*"`)
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
    await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId: newRole.id })
    if (by) {
        const byUsername = await userService.getUsername(by)
        await discordMessageJob('log', `**${byUsername}** promoted **${username}** from **${oldRole.name
        }** to **${newRole.name}**`)
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

exports.scheduleTraining = async options => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const trainingId = await trelloService.getCardsNumOnBoard(boardId) + 1
    await trelloService.postCard({
        idList: listId,
        name: trainingId.toString(),
        desc: JSON.stringify({
            by: options.by,
            type: options.type.toUpperCase(),
            date: options.date,
            specialnotes: options.specialnotes,
            at: Math.round(Date.now() / 1000)
        })
    })
    const dateString = timeHelper.getDate(options.date * 1000)
    const timeString = timeHelper.getTime(options.date * 1000)
    await discordMessageJob('log', `**${options.by}** scheduled a **${options.type.toUpperCase()}** ` +
        `training at **${dateString} ${timeString} ${timeHelper.isDst(options.date * 1000) ? 'CEST' : 'CET'}**` +
    `${options.specialnotes ? ' with note "*' + options.specialnotes + '*"' : ''}`)
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
        await discordMessageJob('log', `**${byUsername}** shouted "*${shout.body}*"`)
    }
    return shout
}

exports.putTraining = async (groupId, trainingId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        if (parseInt(card.name) === trainingId) {
            const cardOptions = {}
            const training = JSON.parse(card.desc)
            const byUsername = await userService.getUsername(options.byUserId)
            if (options.by && options.cancelled === undefined && options.finished === undefined) {
                training.by = options.by
                const newByUsername = await userService.getUsername(options.by)
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` host to **${newByUsername}**`)
            }
            if (options.type) {
                training.type = options.type.toUpperCase()
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` type to **${training.type}**`)
            }
            if (options.date) {
                training.date = options.date
                const dateString = timeHelper.getDate(training.date * 1000)
                const timeString = timeHelper.getTime(training.date * 1000)
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` date to **${dateString} ${timeString} ${timeHelper.isDst(training.date * 1000) ? 'CEST' : 
                        'CET'}**`)
            }
            if (options.specialnotes) {
                training.specialnotes = options.specialnotes
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` note to "*${options.specialnotes}*"`)
            }
            if (options.cancelled) {
                training.cancelled = {
                    by: options.byUserId,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                }
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Cancelled')
                await discordMessageJob('log', `**${byUsername}** cancelled training **${trainingId}**` +
                    `with reason "*${options.reason}*"`)
            }
            if (options.finished) {
                training.finished = {
                    by: options.byUserId,
                    at: Math.round(Date.now() / 1000)
                }
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Finished')
                await discordMessageJob('log', `**${byUsername}** finished training **${trainingId}**`)
            }
            cardOptions.desc = JSON.stringify(training)
            return trelloService.putCard(card.id, cardOptions)
        }
    }
    throw createError(404)
}

exports.putSuspension = async (groupId, userId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) {
            const cardOptions = {}
            const suspension = JSON.parse(card.desc)
            const username = await userService.getUsername(userId)
            const byUsername = await userService.getUsername(options.byUserId)
            if (options.by && options.cancelled === undefined && options.extended === undefined) {
                suspension.by = options.by
                const newByUsername = await userService.getUsername(options.by)
                await discordMessageJob('log', `**${byUsername}** changed the author of **${username}*` +
                    `*'s suspension to **${newByUsername}**`)
            }
            if (options.reason) {
                suspension.reason = options.reason
                await discordMessageJob('log', `**${byUsername}** changed the reason of **${username}*` +
                    `*'s suspension to *"${options.reason}"*`)
            }
            if (options.rankback === 1 || options.rankback === 0) {
                suspension.rankback = options.rankback
                await discordMessageJob('log', `**${byUsername}** changed the rankBack option of **${
                    username}**'s suspension to **${options.rankback === 1 ? 'yes' : 'no'}**`)
            }
            if (options.cancelled) {
                suspension.cancelled = {
                    by: options.byUserId,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                }
                const roles = await exports.getRoles(groupId)
                const roleId = roles.roles.find(role => role.rank === suspension.rank).id
                const client = robloxManager.getClient(groupId)
                await client.apis.groups.updateMemberInGroup({ groupId, userId, roleId })
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Done')
                await discordMessageJob('log', `**${byUsername}** cancelled **${username}**'s ` +
                    `suspension with reason "*${options.reason}*"`)
            }
            if (options.extended) {
                let days = suspension.duration / 86400
                if (!suspension.extended) suspension.extended = []
                for (const extension of suspension.extended) {
                    days += extension.duration / 86400
                }
                days += options.duration
                if (days < 1) throw createError(403, 'Insufficient amount of days')
                if (days > 7) throw createError(403, 'Too many days')
                suspension.extended.push({
                    by: options.byUserId,
                    duration: options.duration * 86400,
                    reason: options.reason,
                    at: Math.round(Date.now() / 1000)
                })
                await discordMessageJob('log', `**${byUsername}** extended **${username}**'s ` +
                    `suspension with **${options.duration}** ${pluralize('day', options.duration)}`)
            }
            cardOptions.desc = JSON.stringify(suspension)
            return trelloService.putCard(card.id, cardOptions)
        }
    }
    throw createError(404)
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

exports.announceTraining = async (groupId, trainingId, options) => {
    if (options.medium !== undefined && options.medium !== 'both' && options.medium !== 'roblox' && options.medium !==
        'discord') throw createError(403, 'Invalid medium')
    const training = await exports.getTraining(trainingId)
    if (!training) throw createError(404, 'Training not found')
    const byUsername = await userService.getUsername(options.byUserId)
    await discordMessageJob('log', `**${byUsername}** announced training **${trainingId}**${options
        .medium !== 'both' ? ' on ' + stringHelper.toPascalCase(options.medium) : ''}`)
    return {
        shout: options.medium === 'both' || options.medium === 'roblox' ? await exports.announceRoblox(groupId) :
            undefined,
        announcement: options.medium === 'both' || options.medium === 'discord' ? await exports.announceDiscord(groupId,
            training) : undefined
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
    const specialNotes = training.specialnotes
    return `<:ns:248922413599817728> **TRAINING**\nThere will be a *${role}* training on **` +
        `${dateString}**.\nTime: **${timeString} ${timeHelper.isDst(training.date * 1000) ? 'CEST' : 'CET'}**.` +
        `\n${specialNotes ? specialNotes + '\n' : ''}Hosted by **${training.by}**.\n<@&${training.type === 'CD' ? 
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
