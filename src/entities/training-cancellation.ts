import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IsNotEmpty } from 'class-validator'
import Training from './training'

@Entity({ name: 'training_cancellations' })
export default class TrainingCancellation {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('bigint', { name: 'author_id' })
  authorId!: number

  @Column({ name: 'training_id' })
  trainingId!: number

  @Column()
  @IsNotEmpty()
  reason!: string

  @OneToOne(() => Training, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'training_id' })
  training!: Training
}
