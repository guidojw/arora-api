'use strict'
require('dotenv').config()

const Trello = require('node-trello')

const trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)

exports.getIdFromBoardName = name => {
    return new Promise((resolve, reject) => {
        name = name.toLowerCase()
        trello.get('/1/members/me/boards', {fields: 'name'}, (err, boards) => {
            if (err) reject(err)
            for (const board of boards) {
                if (board.name.toLowerCase() === name) {
                    resolve(board.id)
                }
            }
            reject(null)
        })
    })
}

exports.getIdFromListName = (boardId, name) => {
    return new Promise((resolve, reject) => {
        name = name.toLowerCase()
        trello.get(`/1/boards/${boardId}/lists`, {fields: 'name'}, (err, lists) => {
            if (err) reject(err)
            for (const list of lists) {
                if (list.name.toLowerCase() === name) {
                    resolve(list.id)
                }
            }
            reject(null)
        })
    })
}

exports.getCards = (listId, options) => {
    return new Promise((resolve, reject) => {
        trello.get(`/1/lists/${listId}/cards`, options, (err, cards) => {
            if (err) reject(err)
            resolve(cards)
        })
    })
}

exports.postCard = options => {
    return new Promise((resolve, reject) => {
        trello.post('/1/cards', options, (err, card) => {
            if (err) reject(err)
            resolve(card)
        })
    })
}

exports.getCardsNumOnBoard = boardId => {
    return new Promise((resolve, reject) => {
        trello.get(`/1/board/${boardId}/cards`, (err, cards) => {
            if (err) reject(err)
            resolve(cards.length)
        })
    })
}
