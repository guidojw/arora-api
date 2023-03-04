import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import BanExtension from './ban-extension'

@Entity({ name: 'bans' })
export default class Ban {
  @Expose()
  @PrimaryGeneratedColumn()
  @ValidateIf(ban => typeof ban.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Expose()
  @Column('timestamp with time zone', { default: () => 'NOW()' })
  @ValidateIf(ban => typeof ban.date !== 'undefined')
  @IsDate()
  public date!: Date

  @Expose()
  @Column('int', { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public duration?: number | null

  @Expose({ name: 'ends_at' })
  @ValidateIf(ban => typeof ban.endsAt !== 'undefined')
  @IsDate()
  public endsAt?: Date

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public groupId!: number

  @Expose()
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @Expose({ name: 'role_id' })
  @Column({ name: 'role_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public roleId!: number

  @Expose({ name: 'user_id' })
  @Column('bigint', { name: 'user_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public userId!: number

  @Expose()
  @Type(() => BanExtension)
  @OneToMany(() => BanExtension, extension => extension.ban)
  @ValidateIf(ban => typeof ban.extensions !== 'undefined')
  @ValidateNested()
  @IsArray()
  public extensions!: BanExtension[]
}
