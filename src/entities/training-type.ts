import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_types' })
export default class TrainingType {
  @PrimaryGeneratedColumn()
  readonly id!: number

  @Column({ length: 8 })
  @IsNotEmpty()
  abbreviation!: string

  @Column({ name: 'group_id' })
  groupId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  name!: string

  @OneToMany(() => Training, training => training.type)
  trainings!: Training[]
}
