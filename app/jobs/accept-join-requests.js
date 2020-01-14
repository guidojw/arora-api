'use strict'
const roblox = require('noblox.js')

const DiscordMessageJob = require('./discord-message')

const trelloController = require('../services/trello')

class AcceptJoinRequestsJob {
    perform = async groupId => {
        try {
            const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
            const listId = await trelloController.getIdFromListName(boardId, 'Exiled')
            const cards = await trelloController.getCards(listId, {fields: 'name'})
            let exiles = []
            for (const card of cards) {
                await exiles.push(parseInt(card.name))
            }
            const requests = await roblox.getJoinRequests(groupId)
            for (const request of requests) {
                const userId = await roblox.getIdFromUsername(request.username)
                if (exiles.includes(userId)) {
                    await roblox.handleJoinRequestId(groupId, request.requestId, false)
                    await (new DiscordMessageJob()).perform('log', `Declined **${request.username}**` +
                        '\'s join request')
                } else {
                    await roblox.handleJoinRequestId(groupId, request.requestId, true)
                    await (new DiscordMessageJob()).perform('log', `Accepted **${request.username}**` +
                        '\'s join request')
                }
            }
        } catch (err) {
            console.error(err.message)
        }
    }
}

module.exports = AcceptJoinRequestsJob
