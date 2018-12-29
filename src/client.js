import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';
const cache = new InMemoryCache({});

const client = new ApolloClient({
  uri: 'http://koirahukassa.xyz:8080/graphql',
  cache,
});

client.defaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
  },
};

export default client;
