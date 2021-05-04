import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'exiles' })
export default class Exile {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column('timestamp with time zone', { default: () => 'now()' })
  date!: Date

  @Column({ name: 'group_id' })
  groupId!: number

  @Column()
  @IsNotEmpty()
  reason!: string

  @Column({ name: 'role_id' })
  roleId!: number
}
