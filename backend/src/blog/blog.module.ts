import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { AuthModule } from '../auth/auth.module';
import { Blog } from './blog.entity';
import { BlogResolver } from './blog.resolver';
import { BlogService, PUB_SUB } from './blog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), AuthModule],
  providers: [
    BlogService,
    BlogResolver,
    { provide: PUB_SUB, useValue: new PubSub() },
  ],
  exports: [BlogService],
})
export class BlogModule {}
