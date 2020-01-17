'use strict'
require('dotenv').config()

const Trello = require('node-trello')

const trello = new Trello(process.env.TRELLO_KEY, process.env.TRELLO_TOKEN)

const ACTION_TYPES = {
    createCard: 'new card',
    updateCard: 'new action',
    updateCheckItemStateOnCard: 'checklist update',
    commentCard: 'new comment',
    addAttachmentToCard: 'new attachment',
    addChecklistToCard: 'new checklist',
    addLabelToCard: 'label added',
    removeLabelFromCard: 'label removed'
}

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

exports.putCard = (cardId, options) => {
    return new Promise((resolve, reject) => {
        trello.put(`/1/cards/${cardId}`, options, (err, card) => {
            if (err) reject(err)
            resolve(card)
        })
    })
}

exports.getMember = (memberId, options) => {
    return new Promise((resolve, reject) => {
        trello.get(`/1/members/${memberId}`, { fields: options }, (err, member) => {
            if (err) reject(err)
            resolve(member)
        })
    })
}

exports.getActionEmbed = async action => {
    console.log(action)
    if (ACTION_TYPES[action.type]) {
        const member = await exports.getMember(action.idMemberCreator, 'username,avatarHash')
        const actionUrl = `https://trello.com/c/${action.data.card.shortLink}/${action.data.card.idShort}#action-` +
            action.id
        return {
            title: `[${action.data.board.name}] 1 ${ACTION_TYPES[action.type]}`,
            description: `[\`${action.id}\`](${actionUrl}) ${action.data.card.name} - ${member.username}`,
            author: {
                name: member.username,
                icon: `https://trello-avatars.s3.amazonaws.com/${member.avatarHash}/170.png`,
                // url:
            },
            url: actionUrl
        }
    }
}
