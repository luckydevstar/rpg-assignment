import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Blog } from './blog.entity';
import { BlogService } from './blog.service';

@Resolver(() => Blog)
export class BlogResolver {
  constructor(private readonly blogService: BlogService) {}

  @Query(() => [Blog])
  blogs(): Promise<Blog[]> {
    return this.blogService.findAll();
  }

  @Mutation(() => Blog)
  @UseGuards(JwtAuthGuard)
  createBlog(
    @Args('content') content: string,
    @CurrentUser() user: User,
  ): Promise<Blog> {
    return this.blogService.create(user.id, content);
  }

  @Subscription(() => Blog, {
    resolve: (payload: { blogPublished: Blog }) => payload.blogPublished,
  })
  blogPublished() {
    return this.blogService.subscribeToNewBlogs();
  }
}
