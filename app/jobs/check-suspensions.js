'use strict'
const roblox = require('noblox.js')
const discordMessageJob = require('./discord-message')
const trelloService = require('../services/trello')

module.exports = async groupId => {
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
        if (suspension.at + duration <= Math.round(Date.now() / 1000)) {
            await roblox.setRank(groupId, suspension.userId, suspension.rankback ? suspension.rank : 1)
            await trelloService.putCard(card.id, { idList: newListId })
            const username = await roblox.getUsernameFromId(suspension.userId)
            await discordMessageJob('log', `Finished **${username}**'s suspension`)
        }
    }
}
