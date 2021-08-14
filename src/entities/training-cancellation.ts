import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_cancellations' })
export default class TrainingCancellation {
  @PrimaryGeneratedColumn()
  public readonly id!: number

  @Column('bigint', { name: 'author_id' })
  public authorId!: number

  @Column({ name: 'training_id' })
  public trainingId!: number

  @Column({ length: 255 })
  @IsNotEmpty()
  public reason!: string

  @OneToOne(() => Training, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_id' })
  public training!: Training
}
