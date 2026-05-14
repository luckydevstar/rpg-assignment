import { gql } from 'graphql-tag'

export const BLOGS_QUERY = gql`
  query Blogs {
    blogs {
      id
      content
      createdAt
      author {
        id
        email
      }
    }
  }
`

export const CREATE_BLOG = gql`
  mutation CreateBlog($content: String!) {
    createBlog(content: $content) {
      id
      content
      createdAt
      author {
        id
        email
      }
    }
  }
`

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
      }
    }
  }
`

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
      }
    }
  }
`

export const ME = gql`
  query Me {
    me {
      id
      email
    }
  }
`

export const BLOG_PUBLISHED = gql`
  subscription BlogPublished {
    blogPublished {
      id
      content
      createdAt
      author {
        email
      }
    }
  }
`
