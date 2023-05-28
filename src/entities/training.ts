import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import TrainingType from './training-type'

@Entity({ name: 'trainings' })
export default class Training {
  @Expose()
  @PrimaryGeneratedColumn()
  @ValidateIf(training => typeof training.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Expose()
  @Column('varchar', { nullable: true, length: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public notes?: string | null

  @Expose()
  @Column('timestamp with time zone')
  @IsDate()
  public date!: Date

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public groupId!: number

  @Expose({ name: 'type_id' })
  @Column({ name: 'type_id', nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  public typeId?: number | null

  @Expose()
  @Type(() => TrainingType)
  @ManyToOne(() => TrainingType, trainingType => trainingType.trainings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  @IsOptional()
  @ValidateNested()
  public type?: TrainingType | null
}
