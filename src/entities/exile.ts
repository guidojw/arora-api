import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'exiles' })
export default class Exile {
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  date!: Date

  @Column({ name: 'group_id' })
  groupId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  reason!: string

  @Column('bigint', { name: 'user_id' })
  userId!: number
}
