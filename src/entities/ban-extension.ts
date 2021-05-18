import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Ban from './ban'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'ban_extensions' })
export default class BanExtension {
  @Expose()
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Expose({ name: 'ban_id' })
  @Column({ name: 'ban_id' })
  banId!: number

  @Expose()
  @Column()
  duration!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  reason!: string

  @Expose()
  @Type(() => Ban)
  @ManyToOne(() => Ban, ban => ban.extensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  ban!: Ban
}
