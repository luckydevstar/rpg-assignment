import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split,
  from,
} from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getStoredToken } from './lib/auth-token'

/**
 * Default: same-origin `/graphql` (Vite dev proxies to Nest on :3200).
 * Override with VITE_GRAPHQL_HTTP / VITE_GRAPHQL_WS if the API is on another host.
 */
function httpGraphqlUrl(): string {
  if (import.meta.env.VITE_GRAPHQL_HTTP) return import.meta.env.VITE_GRAPHQL_HTTP
  return `${window.location.origin}/graphql`
}

function wsGraphqlUrl(): string {
  if (import.meta.env.VITE_GRAPHQL_WS) return import.meta.env.VITE_GRAPHQL_WS
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/graphql`
}

const httpLink = new HttpLink({ uri: httpGraphqlUrl(), credentials: 'include' })

const authLink = setContext((_, { headers }) => {
  const token = getStoredToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: wsGraphqlUrl(),
  }),
)

const link = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  from([authLink, httpLink]),
)

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
