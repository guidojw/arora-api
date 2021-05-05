import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, ValidateIf } from 'class-validator'
import TrainingType from './training-type'

@Entity({ name: 'trainings' })
export default class Training {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column('varchar', { nullable: true, length: 255 })
  @ValidateIf(training => training.notes != null)
  @IsNotEmpty()
  notes!: string | null

  @Column('timestamp with time zone')
  date!: Date

  @Column({ name: 'group_id' })
  groupId!: number

  @Column({ name: 'type_id' })
  typeId!: number

  @ManyToOne(() => TrainingType, trainingType => trainingType.trainings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  type!: TrainingType
}
