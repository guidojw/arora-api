import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import BanExtension from './ban-extension'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'bans' })
export default class Ban {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  date!: Date

  @Column({ nullable: true })
  duration!: number | null

  @Column({ name: 'group_id' })
  groupId!: number

  @Column()
  @IsNotEmpty()
  reason!: string

  @Column({ name: 'role_id' })
  roleId!: number

  @Column('bigint', { name: 'user_id' })
  userId!: number

  @OneToMany(() => BanExtension, extension => extension.ban)
  extensions!: BanExtension[]
}