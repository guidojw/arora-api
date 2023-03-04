import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_types' })
export default class TrainingType {
  @Expose()
  @PrimaryGeneratedColumn()
  @ValidateIf(trainingType => typeof trainingType.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Expose()
  @Column({ length: 8 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  public abbreviation!: string

  @Expose({ name: 'group_id' })
  @Column({ name: 'group_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public groupId!: number

  @Expose()
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name!: string

  @Expose()
  @Type(() => Training)
  @OneToMany(() => Training, training => training.type)
  @ValidateIf(trainingType => typeof trainingType.trainings !== 'undefined')
  @ValidateNested()
  @IsArray()
  public trainings!: Training[]
}
