import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import BanExtension from './ban-extension'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'bans' })
export default class Ban {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  public authorId!: number

  @Expose()
  @Column('timestamp with time zone', { default: () => 'NOW()' })
  public date!: Date

  @Expose()
  @Column('int', { nullable: true })
  public duration?: number | null

  @Expose({ name: 'ends_at' })
  public endsAt?: Date

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  public groupId!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  public reason!: string

  @Expose({ name: 'role_id' })
  @Column({ name: 'role_id' })
  public roleId!: number

  @Expose({ name: 'user_id' })
  @Column('bigint', { name: 'user_id' })
  public userId!: number

  @Expose()
  @Type(() => BanExtension)
  @OneToMany(() => BanExtension, extension => extension.ban)
  public extensions!: BanExtension[]
}
