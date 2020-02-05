import Vue from 'vue'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import { concat, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { createUploadLink } from 'apollo-upload-client'
import { onError } from 'apollo-link-error'
import { getMainDefinition } from 'apollo-utilities'
import store from './vuex'

Vue.use(VueApollo)

const getHeaders = () => {
  const headers = {}
  const token = store.state.auth.token
  if (token) {
    headers.authorization = `${token}`
  }
  return headers
}

const httpLink = createUploadLink({
  uri: `http://${location.host}/graphql`,
  fetch,
  headers: getHeaders()
})

const wsLink = new WebSocketLink({
  uri: `ws://${location.host}/graphql`,
  options: {
    reconnect: true
  }
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = concat(
  onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        store.commit('appendLog', { type: 'error', subtype: 'graphqlError', error: { message, locations, path, timestamp: new Date() } })
      )
    }
    if (networkError) {
      store.commit('appendLog', { type: 'error', subtype: 'networkError', error: { name: networkError.name, message: networkError.message, stack: networkError.stack, timestamp: new Date() } })
    }
  }),
  split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
    },
    wsLink,
    httpLink
  )
)

const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    addTypename: true
  }),
  connectToDevTools: true
})

export default new VueApollo({
  defaultClient: client
})
