import {
  Field,
  HideField,
  ID,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @HideField()
  @Column()
  passwordHash: string;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createdAt: Date;
}
