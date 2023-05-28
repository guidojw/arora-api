import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsString, MaxLength, ValidateIf, ValidateNested } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_cancellations' })
export default class TrainingCancellation {
  @PrimaryGeneratedColumn()
  @ValidateIf(trainingCancellation => typeof trainingCancellation.id !== 'undefined')
  @IsNumber({ maxDecimalPlaces: 0 })
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public authorId!: number

  @Column({ name: 'training_id' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public trainingId!: number

  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public reason!: string

  @OneToOne(() => Training, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_id' })
  @ValidateIf(trainingCancellation => typeof trainingCancellation.training !== 'undefined')
  @ValidateNested()
  public training!: Training
}
