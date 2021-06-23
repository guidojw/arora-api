import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'

@Entity({ name: 'exiles' })
export default class Exile {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  public authorId!: number

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  public date!: Date

  @Column({ name: 'group_id' })
  public groupId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  public reason!: string

  @Column('bigint', { name: 'user_id' })
  public userId!: number
}
