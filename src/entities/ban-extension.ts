import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import Ban from './ban'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'ban_extensions' })
export default class BanExtension {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  public authorId!: number

  @Expose({ name: 'ban_id' })
  @Column({ name: 'ban_id' })
  public banId!: number

  @Expose()
  @Column()
  public duration!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  public reason!: string

  @Expose()
  @Type(() => Ban)
  @ManyToOne(() => Ban, ban => ban.extensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  public ban!: Ban
}
