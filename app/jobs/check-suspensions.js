'use strict'
const discordMessageJob = require('./discord-message')
const trelloService = require('../services/trello')
const userService = require('../services/user')
const groupService = require('../services/group')

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
            const rank = suspension.rankback ? suspension.rank : 1
            await groupService.setRank(groupId, suspension.userId, rank)
            await trelloService.putCard(card.id, { idList: newListId })
            const username = await userService.getUsername(suspension.userId)
            await discordMessageJob('log', `Finished **${username}**'s suspension`)
        }
    }
}
