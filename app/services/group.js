'use strict'
const roblox = require('noblox.js')
const createError = require('http-errors')
const pluralize = require('pluralize')
const axios = require('axios')
const trelloService = require('./trello')
const timeHelper = require('../helpers/time')
const discordMessageJob = require('../jobs/discord-message')
const stringHelper = require('../helpers/string')

exports.defaultTrainingShout = '[TRAININGS] There are new trainings being hosted soon, check out the Training ' +
    'Scheduler in the Group Center for more info!'

exports.suspend = async (groupId, userId, options) => {
    const rank = await exports.getRank(groupId, userId)
    if (rank === 2) throw createError(409, 'User is already suspended')
    if (rank >= 200 || rank === 99 || rank === 103) throw createError(403, 'User is unsuspendable')
    const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
    const listId = await trelloService.getIdFromListName(boardId, 'Current')
    const cards = await trelloService.getCards(listId, {fields: 'name'})
    for (const card of cards) {
        if (parseInt(card.name) === userId) throw createError(409, 'User is already suspended')
    }
    if (rank > 0 && rank !== 2) {
        await roblox.setRank(groupId, userId, 2)
    }
    await trelloService.postCard({
        idList: listId,
        name: userId,
        desc: JSON.stringify({
            rank: rank,
            rankback: options.rankback,
            duration: options.duration,
            by: options.by,
            reason: options.reason,
            at: Math.round(Date.now() / 1000)
        })
    })
    const [username, byUsername] = await Promise.all([roblox.getUsernameFromId(userId), roblox
        .getUsernameFromId(options.by)])
    const days = options.duration / 86400
    await discordMessageJob('log', `**${byUsername}** suspended **${username}** for **${days}** ${
        pluralize('day', days)} with reason "*${options.reason}*"`)
}

exports.getRank = async (groupId, userId) => {
    return await roblox.getRankInGroup(groupId, userId)
}

exports.promote = async (groupId, userId, by) => {
    const rank = await exports.getRank(groupId, userId)
    if (rank === 0) throw createError(403, 'Can only promote group members')
    if (rank >= 100) throw createError(403, 'Can\'t promote MRs or higher')
    const username = await roblox.getUsernameFromId(userId)
    const roles = await roblox.changeRank(groupId, userId, rank === 1 ? 2 : 1)
    if (by) {
        const byUsername = await roblox.getUsernameFromId(by)
        await discordMessageJob('log', `**${byUsername}** promoted **${username}** from **${roles.oldRole
            .name}** to **${roles.newRole.name}**`)
    } else {
        await discordMessageJob('log', `Promoted **${username}** from **${roles.oldRole.name}** to **${
            roles.newRole.name}**`)
    }
    return roles
}

exports.getShout = async groupId => {
    return await roblox.getShout(groupId)
}

exports.getRole = async (groupId, userId) => {
    return await roblox.getRankNameInGroup(groupId, userId)
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
        name: trainingId,
        desc: JSON.stringify({
            by: options.by,
            type: options.type,
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
    const byUsername = await roblox.getUsernameFromId(by)
    await roblox.shout(groupId, message)
    if (message === '') {
        await discordMessageJob('log', `**${byUsername}** cleared the shout`)
    } else {
        await discordMessageJob('log', `**${byUsername}** shouted "*${message}*"`)
    }
}

exports.putTraining = async (groupId, trainingId, options) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] Training Scheduler')
    const listId = await trelloService.getIdFromListName(boardId, 'Scheduled')
    const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
    for (const card of cards) {
        if (parseInt(card.name) === trainingId) {
            const cardOptions = {}
            const training = JSON.parse(card.desc)
            const byUsername = await roblox.getUsernameFromId(options.byUserId)
            if (options.by && options.cancelled === undefined && options.finished === undefined) {
                training.by = options.by
                const newByUsername = await roblox.getUsernameFromId(options.by)
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` host to **${newByUsername}**`)
            }
            if (options.type) {
                training.type = options.type
                await discordMessageJob('log', `**${byUsername}** changed training **${trainingId}**'s` +
                    ` type to **${options.type.toUpperCase()}**`)
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
            const username = await roblox.getUsernameFromId(userId)
            const byUsername = await roblox.getUsernameFromId(options.byUserId)
            if (options.by && options.cancelled === undefined && options.extended === undefined) {
                suspension.by = options.by
                const newByUsername = await roblox.getUsernameFromId(options.by)
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
                await roblox.setRank(groupId, userId, suspension.rank)
                cardOptions.idList = await trelloService.getIdFromListName(boardId, 'Done')
                await discordMessageJob('log', `**${byUsername}** cancelled **${username}**'s ` +
                    `suspension with reason "*${options.reason}*"`)
            }
            if (options.extended) {
                let days = suspension.duration / 86400
                if (!suspension.extended) suspension.extended = []
                suspension.extended.forEach(extension => {
                    days += extension.duration / 86400
                })
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

exports.getGroup = async groupId => {
    return (await axios({
        method: 'get',
        url: `https://groups.roblox.com/v1/groups/${groupId}`
    })).data
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
    const byUsername = await roblox.getUsernameFromId(options.byUserId)
    await discordMessageJob('log', `**${byUsername}** announced training **${trainingId}**${options
        .medium !== 'both' ? ' on ' + stringHelper.toPascalCase(options.medium) : ''}`)
    if (options.medium === 'roblox') {
        return await exports.announceRoblox(groupId)
    } else if (options.medium === 'discord') {
        return await exports.announceDiscord(groupId, training)
    } else if (options.medium === 'both') {
        return {
            shout: await exports.announceRoblox(groupId),
            announcement: await exports.announceDiscord(groupId, training)
        }
    }
}

exports.announceRoblox = async groupId => {
    const shout = exports.defaultTrainingShout
    await roblox.shout(groupId, shout)
    return shout
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
