import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import Ban from './ban'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'ban_cancellations' })
export default class BanCancellation {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  public authorId!: number

  @Column({ name: 'ban_id' })
  public banId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  public reason!: string

  @OneToOne(() => Ban, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  public ban!: Ban
}
