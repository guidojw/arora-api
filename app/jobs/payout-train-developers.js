'use strict'
const robloxManager = require('../managers/roblox')

const trainProducts = [
    { id: 1371397, developerIds: [32851718] }, // Supersnel11
    { id: 1547370, developerIds: [32851718] },
    { id: 1373258, developerIds: [7050507] }, // AmericanKay
    { id: 2300769, developerIds: [7050507] },
    { id: 3886194, developerIds: [7050507] },
    { id: 4787242, developerIds: [7050507] },
    { id: 1399819, developerIds: [21753709, 6882179] }, // DerailingOn, Happywalker
    { id: 1492453, developerIds: [49248891] }, // BuildIntoTrains
    { id: 1426909, developerIds: [5775031] }, // COEN1000
    { id: 2297243, developerIds: [5775031] }
]

const PAY_RATE = 0.5

module.exports = async groupId => {
    const lastTimestamp = '2020-02-17T15:16:35.707Z'
    const client = robloxManager.getClient(groupId)
    const transactions = []
    let cursor = null
    let count = 0
    do {
        const transactionHistory = await client.apis.economy.getGroupTransactions({
            transactionType: 'Sale',
            limit: 100,
            groupId,
            cursor
        })

        const lastTransaction = transactionHistory.data.find(transaction => transaction.created === lastTimestamp)
        if (!lastTransaction) {
            transactions.push(...transactionHistory.data)
        } else {
            transactions.push(...transactionHistory.data.splice(0, transactionHistory.data.indexOf(lastTransaction) +
                1))
            break
        }

        cursor = transactionHistory.nextPageCursor
        count++
    } while (cursor && count < 50)

    const trainTransactions = transactions.filter(transaction => trainProducts.find(product => product.id ===
        transaction.details.id))
}
