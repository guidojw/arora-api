import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import BanExtension from './ban-extension'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'bans' })
export default class Ban {
  @Expose()
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Expose()
  @Column('timestamp with time zone', { default: () => 'NOW()' })
  date!: Date

  @Expose()
  @Column('int', { nullable: true })
  duration?: number | null

  @Expose({ name: 'ends_at' })
  endsAt?: Date

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  groupId!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  reason!: string

  @Expose({ name: 'role_id' })
  @Column({ name: 'role_id' })
  roleId!: number

  @Expose({ name: 'user_id' })
  @Column('bigint', { name: 'user_id' })
  userId!: number

  @Expose()
  @Type(() => BanExtension)
  @OneToMany(() => BanExtension, extension => extension.ban)
  extensions!: BanExtension[]
}
