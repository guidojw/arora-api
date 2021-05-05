import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Ban from './ban'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'ban_cancellations' })
export default class BanCancellation {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column({ name: 'ban_id' })
  banId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  reason!: string

  @OneToOne(() => Ban, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  ban!: Ban
}
