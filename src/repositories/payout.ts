import { EntityRepository, Repository } from 'typeorm'
import { Payout } from '../entities'

@EntityRepository(Payout)
export default class PayoutRepository extends Repository<Payout> {
  public async getLast (groupId: number): Promise<Payout | undefined> {
    return (await this
      .createQueryBuilder('payout')
      .innerJoin(qb => (
        qb
          .from('payouts', 'other_payout')
          .select('MAX(other_payout.until)', 'until')
      ), 'other_payout', 'other_payout.until = payout.until')
      .andWhere('payout.group_id = :groupId', { groupId })
      .getOne()
    )
  }
}
