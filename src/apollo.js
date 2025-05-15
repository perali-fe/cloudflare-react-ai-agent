import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';

// 日志链接
const logLink = new ApolloLink((operation, forward) => {
  console.log(`GraphQL 请求: ${operation.operationName}`, {
    variables: operation.variables,
    query: operation.query.loc?.source.body
  });

  return forward(operation).map(response => {
    console.log(`GraphQL 响应: ${operation.operationName}`, response);
    return response;
  });
});

// 主 HTTP 链接
const httpLink = createHttpLink({
  uri: 'https://api.pera0520.xyz', // 您的 GraphQL API 端点
});

// 创建 Apollo 客户端
const client = new ApolloClient({
  link: ApolloLink.from([logLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    mutate: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    }
  },
});

export default client;