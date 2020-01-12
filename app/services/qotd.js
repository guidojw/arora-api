'use strict'
const trelloService = require('./trello')

exports.suggest = async (qotd, by) => {
    const boardId = await trelloService.getIdFromBoardName('[NS] QOTD Board')
    const listId = await trelloService.getIdFromListName(boardId, 'Suggested')
    await trelloService.postCard({
        idList: listId,
        name: qotd,
        desc: by
    })
}
