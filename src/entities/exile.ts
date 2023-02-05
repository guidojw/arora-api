import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsDate, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf } from 'class-validator'

@Entity({ name: 'exiles' })
export default class Exile {
  @PrimaryGeneratedColumn()
  @ValidateIf(exile => typeof exile.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Column('timestamp with time zone', { default: () => 'NOW()' })
  @IsDate()
  public date!: Date

  @Column({ name: 'group_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public groupId!: number

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @Column('bigint', { name: 'user_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public userId!: number
}
