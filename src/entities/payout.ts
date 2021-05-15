import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'payouts' })
export default class Payout {
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Column('timestamp with time zone')
  until!: Date

  @Column({ name: 'group_id' })
  groupId!: number
}
