import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import Ban from './ban'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'ban_extensions' })
export default class BanExtension {
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column({ name: 'ban_id' })
  banId!: number

  @Column()
  duration!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  reason!: string

  @ManyToOne(() => Ban, ban => ban.extensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  ban!: Ban
}
