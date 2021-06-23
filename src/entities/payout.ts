import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'payouts' })
export default class Payout {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('timestamp with time zone')
  public until!: Date

  @Column({ name: 'group_id' })
  public groupId!: number
}
