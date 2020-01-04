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
                const userId = parseInt(card.name)
                const data = JSON.parse(card.desc)
                let duration = data.duration
                if (data.extensions) {
                    for (const extension of data.extensions) {
                        duration += extension.duration
                    }
                }
                if (data.at + data.duration <= now) {
                    await roblox.setRank(groupId, userId, data.rankback ? data.rank : 1)
                    trelloController.putCard(card.id, { idList: newListId })
                    const username = await roblox.getUsernameFromId(userId)
                    new DiscordMessageJob().perform('log', `Successfully unsuspended **${username}**`)
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = CheckSuspensionsJob
