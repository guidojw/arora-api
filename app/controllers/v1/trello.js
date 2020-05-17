'use strict'
const { body } = require('express-validator')
const { trelloService } = require('../../services')
const { discordMessageJob } = require('../../jobs')

function validate (method) {
    switch (method) {
        case 'postWebhook':
            return [
                body('action').exists(),
                body('model').exists()
            ]
    }
}

function head (req, res) {
    res.sendStatus(200)
}

async function postWebhook (req, res) {
    const embed = await trelloService.getActionEmbed(req.body.action)
    if (embed) await discordMessageJob.run('trello', { embeds: [embed] })
    res.sendStatus(200)
}

module.exports = {
    validate,
    head,
    postWebhook
}
