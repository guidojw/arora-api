import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_types' })
export default class TrainingType {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ length: 8 })
  @IsNotEmpty()
  abbreviation!: string

  @Column({ name: 'group_id' })
  groupId!: number

  @OneToMany(() => Training, training => training.type)
  trainings!: Training[]
}
