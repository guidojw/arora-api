import { EntityRepository, Repository } from 'typeorm'
import { Payout } from '../entities'

@EntityRepository(Payout)
export default class PayoutRepository extends Repository<Payout> {

}
