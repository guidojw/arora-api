'use strict'
const robloxManager = require('../managers/roblox')
const webSocketManager = require('../managers/web-socket')
const { Payout } = require('../models')

const products = [
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
    // Get last payout and its last transaction.
    const lastPayout = await Payout.getLast()
    if (!lastPayout) throw new Error('Could not get last transaction!')
    const lastTransactionDate = lastPayout.until

    // Get train transactions.
    const client = robloxManager.getClient(groupId)
    const transactions = []
    let cursor = null
    do {
        const transactionHistory = await client.apis.economy.getGroupTransactions({
            transactionType: 'Sale',
            limit: 100,
            groupId,
            cursor
        })

        const lastTransaction = transactionHistory.data.find(transaction => new Date(transaction.created).getTime() <=
            lastTransactionDate.getTime())
        if (!lastTransaction) {
            transactions.push(...transactionHistory.data)
        } else {
            transactions.push(...transactionHistory.data.splice(0, transactionHistory.data.indexOf(lastTransaction)))
            break
        }

        cursor = transactionHistory.nextPageCursor
    } while (cursor)

    const trainTransactions = transactions.filter(transaction => products.find(product => product.id ===
        transaction.details.id))

    // Get developer specific sales information from the train transactions.
    const developersSales = {}
    for (const product of products) {
        for (const id of product.developerIds) {
            if (!developersSales[id]) developersSales[id] = { total: { amount: 0, robux: 0 }, sales: {}}
            developersSales[id].sales[product.id] = { amount: 0, robux: 0 }
        }
    }

    for (const transaction of trainTransactions) {
        const product = products.find(product => product.id === transaction.details.id)
        const gainings = transaction.currency.amount * 0.7 * PAY_RATE * (1 / product.developerIds.length)
        for (const id of product.developerIds) {
            const developerSales = developersSales[id]
            const productSales = developerSales.sales[product.id]
            productSales.amount++
            developerSales.total.amount++
            productSales.robux += gainings
            developerSales.total.robux += gainings
        }
    }

    // Only continue with payout logic if there are train transactions.
    if (trainTransactions.length > 0) {
        // Build a PayoutRequest from the developer sales information.
        // const recipients = []
        // for (const [id, developerSales] of Object.entries(developersSales)) {
        //     recipients.push({
        //         recipientId: parseInt(id),
        //         recipientType: 'User',
        //         amount: Math.ceil(developerSales.total.robux)
        //     })
        // }
        // const payoutRequest = { PayoutType: 'FixedAmount', Recipients: recipients }

        // Make the payouts.
        // await client.apis.groups.payoutUser({ groupId, payoutRequest })

        // Add new payout row.
        await models.Payout.create({ until: new Date(trainTransactions[0].created) })
    }

    // Broadcast information about the payouts over the WebSocket.
    webSocketManager.broadcast('trainDeveloperPayoutReport', { developersSales })
}
