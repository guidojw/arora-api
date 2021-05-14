import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import TrainingType from './training-type'

@Entity({ name: 'trainings' })
export default class Training {
  @Expose()
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Expose({ name: 'author_id' })
  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Expose()
  @Column('varchar', { nullable: true, length: 255 })
  @ValidateIf(training => training.notes != null)
  @IsNotEmpty()
  notes?: string | null

  @Expose()
  @Column('timestamp with time zone')
  date!: Date

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  groupId!: number

  @Expose({ name: 'type_id' })
  @Column({ name: 'type_id', nullable: true })
  typeId?: number | null

  @Expose()
  @Type(() => TrainingType)
  @ManyToOne(() => TrainingType, trainingType => trainingType.trainings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  type?: TrainingType | null
}
