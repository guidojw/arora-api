import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Ban from './ban'

@Entity({ name: 'ban_cancellations' })
export default class BanCancellation {
  @PrimaryGeneratedColumn()
  @ValidateIf(banCancellation => typeof banCancellation.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Column({ name: 'ban_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public banId!: number

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @OneToOne(() => Ban, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  @ValidateIf(banCancellation => typeof banCancellation.ban !== 'undefined')
  @ValidateNested()
  public ban!: Ban
}
