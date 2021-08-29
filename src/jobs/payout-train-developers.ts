import { RobloxManager, WebSocketManager } from '../managers'
import { inject, injectable } from 'inversify'
import { GetGroupTransactions } from '@guidojw/bloxy/src/client/apis/EconomyAPI'
import HealthCheckJob from './health-check'
import { Payout } from '../entities'
import { PayoutRepository } from '../repositories'
import { constants } from '../util'

const { TYPES } = constants

export interface DeveloperSales {
  discordId: string
  total: { amount: number, robux: number }
  sales: Record<number, { name: string, amount: number, robux: number }>
}

const developers = {
  Supersnel11: { robloxId: 32851718, discordId: '228110777825886210' },
  KaySherman: { robloxId: 7050507, discordId: '175345544799977472' },
  DerailingOn: { robloxId: 21753709, discordId: '273910287663497216' },
  Happywalker: { robloxId: 6882179, discordId: '235476265325428736' },
  BuildIntoTrains: { robloxId: 49248891, discordId: '263770097288609794' },
  COEN1000: { robloxId: 5775031, discordId: '223172958510645250' }
}

const products = [
  { id: 1371397, developers: [developers.Supersnel11] },
  { id: 1547370, developers: [developers.Supersnel11] },
  { id: 1373258, developers: [developers.KaySherman] },
  { id: 2300769, developers: [developers.KaySherman] },
  { id: 3886194, developers: [developers.KaySherman] },
  { id: 4787242, developers: [developers.KaySherman] },
  { id: 1399819, developers: [developers.DerailingOn, developers.Happywalker] },
  { id: 1492453, developers: [developers.BuildIntoTrains] },
  { id: 1426909, developers: [developers.COEN1000] },
  { id: 2297243, developers: [developers.COEN1000] }
]

const PAY_RATE = 0.5

@injectable()
export default class PayoutTrainDevelopersJob {
  @inject(TYPES.HealthCheckJob) private readonly healthCheckJob!: HealthCheckJob
  @inject(TYPES.RobloxManager) private readonly robloxManager!: RobloxManager
  @inject(TYPES.WebSocketManager) private readonly webSocketManager!: WebSocketManager
  @inject(TYPES.PayoutRepository) private readonly payoutRepository!: PayoutRepository

  public async run (groupId: number): Promise<void> {
    // Get last payout and its last transaction.
    const lastPayout = await this.payoutRepository.getLast(groupId)
    if (typeof lastPayout === 'undefined') {
      throw new Error('Could not get last transaction!')
    }
    const lastTransactionDate = lastPayout.until

    // Get train transactions.
    const client = this.robloxManager.getClient(groupId)
    const group = await client.getGroup(groupId)
    const transactions: GetGroupTransactions['data'] = []
    let cursor
    do {
      const transactionHistory: GetGroupTransactions = await group.getTransactions({
        transactionType: 'Sale',
        limit: 100,
        cursor
      })

      const lastTransaction = transactionHistory.data.find(transaction => {
        return new Date(transaction.created).getTime() <= lastTransactionDate.getTime()
      })
      if (typeof lastTransaction === 'undefined') {
        transactions.push(...transactionHistory.data)
      } else {
        transactions.push(...transactionHistory.data.splice(0, transactionHistory.data.indexOf(lastTransaction)))
        break
      }

      cursor = transactionHistory.nextPageCursor
    } while (typeof cursor !== 'undefined')

    const trainTransactions = transactions.filter(transaction => {
      return products.find(product => product.id === (transaction.details as { id: number }).id)
    })

    // Get developer specific sales information from the train transactions.
    const developersSales: Record<number, DeveloperSales> = {}
    for (const product of products) {
      const productInfo = await client.apis.generalApi.getGamePassProductInfo({ gamePassId: product.id })

      for (const developer of product.developers) {
        if (typeof developersSales[developer.robloxId] === 'undefined') {
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
      const product = products.find(product => product.id === (transaction.details as { id: number }).id)
      if (typeof product === 'undefined') {
        return
      }

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
      const payout = new Payout()
      payout.groupId = groupId
      payout.until = new Date(trainTransactions[0].created)
      await this.payoutRepository.save(payout)
    }

    // Broadcast information about the payouts over the WebSocket.
    this.webSocketManager.broadcast('trainDeveloperPayoutReport', { groupId, developersSales })

    // Ping Healthchecks.io.
    await this.healthCheckJob.run('payoutTrainDevelopersJob')
  }
}
