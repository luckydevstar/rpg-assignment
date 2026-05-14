import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';

export const PUB_SUB = 'PUB_SUB';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogs: Repository<Blog>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  findAll(): Promise<Blog[]> {
    return this.blogs.find({
      order: { createdAt: 'DESC' },
    });
  }

  async create(authorId: string, content: string): Promise<Blog> {
    const blog = this.blogs.create({ content, authorId });
    const saved = await this.blogs.save(blog);
    const full = await this.blogs.findOneOrFail({
      where: { id: saved.id },
      relations: ['author'],
    });
    await this.pubSub.publish('blogPublished', { blogPublished: full });
    return full;
  }

  subscribeToNewBlogs() {
    return this.pubSub.asyncIterator('blogPublished');
  }
}
