import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_types' })
export default class TrainingType {
  @Expose()
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Expose()
  @Column({ length: 8 })
  @IsNotEmpty()
  public abbreviation!: string

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  public groupId!: number

  @Expose()
  @Column({ length: 255 })
  @IsNotEmpty()
  public name!: string

  @Expose()
  @Type(() => Training)
  @OneToMany(() => Training, training => training.type)
  public trainings!: Training[]
}
