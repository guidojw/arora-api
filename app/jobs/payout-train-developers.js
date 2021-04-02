'use strict'

const { Payout } = require('../models')

const developers = {
  Supersnel11: { robloxId: 32851718, discordId: '228110777825886210' },
  AmericanKay: { robloxId: 7050507, discordId: '175345544799977472' },
  DerailingOn: { robloxId: 21753709, discordId: '273910287663497216' },
  Happywalker: { robloxId: 6882179, discordId: '235476265325428736' },
  BuildIntoTrains: { robloxId: 49248891, discordId: '263770097288609794' },
  COEN1000: { robloxId: 5775031, discordId: '223172958510645250' }
}

const products = [
  { id: 1371397, developers: [developers.Supersnel11] },
  { id: 1547370, developers: [developers.Supersnel11] },
  { id: 1373258, developers: [developers.AmericanKay] },
  { id: 2300769, developers: [developers.AmericanKay] },
  { id: 3886194, developers: [developers.AmericanKay] },
  { id: 4787242, developers: [developers.AmericanKay] },
  { id: 1399819, developers: [developers.DerailingOn, developers.Happywalker] },
  { id: 1492453, developers: [developers.BuildIntoTrains] },
  { id: 1426909, developers: [developers.COEN1000] },
  { id: 2297243, developers: [developers.COEN1000] }
]

const PAY_RATE = 0.5

class PayoutTrainDevelopersJob {
  constructor (robloxManager, webSocketManager) {
    this._robloxManager = robloxManager
    this._webSocketManager = webSocketManager
  }

  async run (groupId) {
    // Get last payout and its last transaction.
    const lastPayout = await Payout.getLast()
    if (!lastPayout) {
      throw new Error('Could not get last transaction!')
    }
    const lastTransactionDate = lastPayout.until

    // Get train transactions.
    const client = this._robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    const transactions = []
    let cursor = null
    do {
      const transactionHistory = await group.getTransactions({
        transactionType: 'Sale',
        limit: 100,
        cursor
      })

      const lastTransaction = transactionHistory.data.find(transaction => {
        return new Date(transaction.created).getTime() <= lastTransactionDate.getTime()
      })
      if (!lastTransaction) {
        transactions.push(...transactionHistory.data)
      } else {
        transactions.push(...transactionHistory.data
          .splice(0, transactionHistory.data.indexOf(lastTransaction))
        )
        break
      }

      cursor = transactionHistory.nextPageCursor
    } while (cursor)

    const trainTransactions = transactions.filter(transaction => {
      return products.find(product => product.id === transaction.details.id)
    })

    // Get developer specific sales information from the train transactions.
    const developersSales = {}
    for (const product of products) {
      const productInfo = await client.apis.generalApi.getGamePassProductInfo({ gamePassId: product.id })

      for (const developer of product.developers) {
        if (!developersSales[developer.robloxId]) {
          developersSales[developer.robloxId] = {
            discordId: developer.discordId,
            total: { amount: 0, robux: 0 },
            sales: {}
          }
        }

        developersSales[developer.robloxId].sales[product.id] = {
          name: productInfo.Name,
          amount: 0,
          robux: 0
        }
      }
    }

    for (const transaction of trainTransactions) {
      const product = products.find(product => product.id === transaction.details.id)
      const gainings = transaction.currency.amount * 0.7 * PAY_RATE * (1 / product.developers.length)

      for (const developer of product.developers) {
        const developerSales = developersSales[developer.robloxId]
        const productSales = developerSales.sales[product.id]

        productSales.amount++
        developerSales.total.amount++
        productSales.robux += gainings
        developerSales.total.robux += gainings
      }
    }

    // Only continue with payout logic if there are train transactions.
    if (trainTransactions.length > 0) {
      // Add new payout row.
      await Payout.create({ until: new Date(trainTransactions[0].created) })
    }

    // Broadcast information about the payouts over the WebSocket.
    this._webSocketManager.broadcast('trainDeveloperPayoutReport', { developersSales })
  }
}

module.exports = PayoutTrainDevelopersJob
