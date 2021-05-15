import { EntityRepository, Repository } from 'typeorm'
import { Payout } from '../entities'

@EntityRepository(Payout)
export default class PayoutRepository extends Repository<Payout> {
  async getLast (groupId: number): Promise<Payout | undefined> {
    return (await this
      .createQueryBuilder('payout')
      .innerJoin(qb => (
        qb.from('payouts', 'otherPayout')
          .select('MAX(otherPayout.until)', 'until')
      ), 'otherPayout', '"otherPayout".until = payout.until')
      .andWhere('payout.groupId = :groupId', { groupId })
      .getOne()
    )
  }
}
