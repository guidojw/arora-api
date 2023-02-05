import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Ban from './ban'

@Entity({ name: 'ban_extensions' })
export default class BanExtension {
  @Expose()
  @PrimaryGeneratedColumn()
  @ValidateIf(banExtension => typeof banExtension.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Expose({ name: 'ban_id' })
  @Column({ name: 'ban_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public banId!: number

  @Expose()
  @Column()
  @IsNumber({ maxDecimalPlaces: 0 })
  public duration!: number

  @Expose()
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @Expose()
  @Type(() => Ban)
  @ManyToOne(() => Ban, ban => ban.extensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ban_id' })
  @ValidateIf(banExtension => typeof banExtension.ban !== 'undefined')
  @ValidateNested()
  public ban!: Ban
}
