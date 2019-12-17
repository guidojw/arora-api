'use strict'
const { param, body } = require('express-validator')
const roblox = require('noblox.js')
const createError = require('http-errors')
const pluralize = require('pluralize')

const DiscordMessageJob = require('../jobs/discord-message-job')

const trelloController = require('./trello')

exports.validate = method => {
    switch (method) {
        case 'getBans':
            return [
                // body('id').exists().isNumeric(),
                // body('key').exists().isString()
            ]
    }
}

exports.getBans = async (req, res, next) => {
    try {
        const boardId = await trelloController.getIdFromBoardName('[NS] Ongoing Suspensions')
        const listId = await trelloController.getIdFromListName(boardId, 'Banned')
        const cards = await trelloController.getCards(listId, {fields: 'name,desc'})
        let bans = []
        for (const card of cards) {
            const ban = {}
            ban.userId = parseInt(card.name)
            for (const [key, value] of Object.entries(JSON.parse(card.desc))) {
                ban[key] = value
            }
            await bans.push(ban)
        }
        res.json(bans)
    } catch (err) {
        next(createError(err.status || 500, err.message))
    }
}
