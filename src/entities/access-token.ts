import { Column, Entity, PrimaryColumn } from 'typeorm'
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator'
import { Expose } from 'class-transformer'

@Entity({ name: 'access_tokens' })
export default class AccessToken {
  @Expose()
  @PrimaryColumn({ length: 255 })
  @IsString()
  public readonly id!: string

  @Expose({ name: 'access_token' })
  @Column({ name: 'access_token', length: 255 })
  @IsString()
  @IsNotEmpty()
  public accessToken!: string

  @Expose({ name: 'refresh_token' })
  @Column({ name: 'refresh_token' })
  @IsString()
  @IsNotEmpty()
  public refreshToken!: number

  @Expose({ name: 'token_type' })
  @Column({ name: 'token_type', length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public tokenType!: string

  @Expose({ name: 'expires_in' })
  @Column({ name: 'expires_in' })
  @IsNumber({ maxDecimalPlaces: 0 })
  public expiresIn!: number

  @Expose({ name: 'id_token' })
  @Column({ name: 'id_token', length: 255 })
  @IsString()
  @IsNotEmpty()
  public idToken!: string

  @Expose()
  @Column({ length: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public scope!: string
}
