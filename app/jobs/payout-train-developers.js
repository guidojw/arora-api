'use strict'
const robloxManager = require('../managers/roblox')

const developerTrains = {
    '32851718': [1371397, 1547370], // Supersnel11
    '7050507': [1373258, 2300769, 3886194, 4787242], // AmericanKay
    '21753709': [1399819], // DerailingOn
    '6882179': [1399819], // Happywalker
    '49248891': [1492453], // BuildIntoTrains
    '5775031': [1426909, 2297243] // COEN1000
}

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

    const trainTransactions = transactions.filter(transaction => {
        for (const trains of Object.values(developerTrains)) {
            if (trains.includes(transaction.details.id)) return true
        }
        return false
    })
}
