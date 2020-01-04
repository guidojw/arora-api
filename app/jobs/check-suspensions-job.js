'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message-job')

const trelloController = require('../controllers/trello')

const timeHelper = require('../helpers/time')

class CheckSuspensionsJob {
    perform = async groupId => {
        try {
            const now = timeHelper.getUnix()
            const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
            const listId = await trelloController.getIdFromListName(boardId, 'Current')
            const newListId = await trelloController.getIdFromListName(boardId, 'Done')
            const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
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
                    trelloController.putCard(card.id, { idList: newListId })
                    const username = await roblox.getUsernameFromId(userId)
                    new DiscordMessageJob().perform('log', `Finished **${username}**'s suspension`)
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = CheckSuspensionsJob
