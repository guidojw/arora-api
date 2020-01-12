'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message-job')

const trelloService = require('../services/trello')

const timeHelper = require('../helpers/time')

class CheckSuspensionsJob {
    perform = async groupId => {
        try {
            const now = timeHelper.getUnix()
            const boardId = await trelloService.getIdFromBoardName('[NS] Ongoing Suspensions')
            const listId = await trelloService.getIdFromListName(boardId, 'Current')
            const newListId = await trelloService.getIdFromListName(boardId, 'Done')
            const cards = await trelloService.getCards(listId, {fields: 'name,desc'})
            for (const card of cards) {
                const suspension = JSON.parse(card.desc)
                suspension.userId = parseInt(card.name)
                let duration = suspension.duration
                if (suspension.extended) {
                    for (const extension of suspension.extended) {
                        duration += extension.duration
                    }
                }
                if (suspension.at + duration <= now) {
                    await roblox.setRank(groupId, suspension.userId, suspension.rankback ? suspension.rank : 1)
                    await trelloService.putCard(card.id, { idList: newListId })
                    const username = await roblox.getUsernameFromId(suspension.userId)
                    new DiscordMessageJob().perform('log', `Finished **${username}**'s suspension`)
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = CheckSuspensionsJob
