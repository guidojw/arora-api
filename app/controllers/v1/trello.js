'use strict'
const { body } = require('express-validator')
const { trelloService } = require('../../services')
const { discordMessageJob } = require('../../jobs')

exports.validate = method => {
    switch (method) {
        case 'postWebhook':
            return [
                body('action').exists(),
                body('model').exists()
            ]
    }
}

exports.head = (req, res) => {
    res.sendStatus(200)
}

exports.postWebhook = async (req, res) => {
    const embed = await trelloService.getActionEmbed(req.body.action)
    if (embed) await discordMessageJob('trello', { embeds: [embed] })
    res.sendStatus(200)
}
